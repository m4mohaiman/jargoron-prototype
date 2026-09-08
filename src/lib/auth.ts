export type Role = "field" | "admin" | "user";

export interface User {
  email: string;
  /** ইমেইল থেকে তৈরি প্রদর্শন-নাম (Topbar-এর initials-এর জন্য) */
  name: string;
  role: Role;
}

export const ROLE_LABEL_BN: Record<Role, string> = {
  admin: "অ্যাডমিন",
  field: "ফিল্ড অফিসার",
  user: "সাধারণ ইউজার",
};

interface Account {
  email: string;
  passwordHash: string;
  salt: string;
  role: Role;
  createdAt: string;
}

const SESSION_KEY = "jagoron-demo-user";
const ACCOUNTS_KEY = "jagoron-demo-accounts";

/** ডেমো অ্যাকাউন্ট — প্রথমবার অ্যাপ খুললে তৈরি হয় */
export const DEMO_ACCOUNTS = [
  { email: "admin@jagoron.org", password: "jagoron123", role: "admin" as Role },
  { email: "field@jagoron.org", password: "jagoron123", role: "field" as Role },
  { email: "user@jagoron.org", password: "jagoron123", role: "user" as Role },
];

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function displayNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p[0]?.toUpperCase() + p.slice(1))
    .join(" ");
}

/**
 * ডেমো-মানের হ্যাশিং। এটি ব্রাউজারে চলে, তাই কোনো বাস্তব নিরাপত্তা দেয় না —
 * শুধু localStorage-এ প্লেইন পাসওয়ার্ড রাখা এড়ানোর জন্য।
 * প্রকৃত ডেপ্লয়মেন্টে অথেন্টিকেশন সার্ভারে হওয়া উচিত।
 */
async function hash(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  if (globalThis.crypto?.subtle) {
    const buf = await globalThis.crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(buf)]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // http:// (non-secure context) — subtle পাওয়া যায় না, তখন এই ফলব্যাক
  let h = 5381;
  for (const byte of data) h = ((h << 5) + h + byte) >>> 0;
  return `fallback-${h.toString(16)}`;
}

function randomSalt(): string {
  const bytes = new Uint8Array(8);
  globalThis.crypto?.getRandomValues?.(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function readAccounts(): Account[] {
  const raw = localStorage.getItem(ACCOUNTS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Account[]) : [];
  } catch {
    return [];
  }
}

function writeAccounts(accounts: Account[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

/** প্রথম রানে ডেমো অ্যাকাউন্টগুলো তৈরি করে */
export async function ensureSeedAccounts(): Promise<void> {
  const accounts = readAccounts();
  let changed = false;

  for (const demo of DEMO_ACCOUNTS) {
    if (accounts.some((a) => a.email === demo.email)) continue;
    const salt = randomSalt();
    accounts.push({
      email: demo.email,
      salt,
      passwordHash: await hash(demo.password, salt),
      role: demo.role,
      createdAt: new Date().toISOString(),
    });
    changed = true;
  }

  if (changed) writeAccounts(accounts);
}

export class AuthError extends Error {}

export async function signIn(
  emailInput: string,
  password: string,
): Promise<User> {
  const email = normalizeEmail(emailInput);
  if (!email || !password) {
    throw new AuthError("ইমেইল ও পাসওয়ার্ড দুটোই দিতে হবে।");
  }

  const account = readAccounts().find((a) => a.email === email);
  if (!account) {
    throw new AuthError(
      "এই ইমেইলে কোনো অ্যাকাউন্ট নেই। আগে সাইন আপ করে নাও।",
    );
  }

  const candidate = await hash(password, account.salt);
  if (candidate !== account.passwordHash) {
    throw new AuthError("পাসওয়ার্ড মেলেনি। আবার চেষ্টা করো।");
  }

  const user: User = {
    email: account.email,
    name: displayNameFromEmail(account.email),
    role: account.role,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export async function signUp(
  emailInput: string,
  password: string,
): Promise<User> {
  const email = normalizeEmail(emailInput);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AuthError("সঠিক একটি ইমেইল ঠিকানা দাও।");
  }
  if (password.length < 6) {
    throw new AuthError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।");
  }

  const accounts = readAccounts();
  if (accounts.some((a) => a.email === email)) {
    throw new AuthError("এই ইমেইলে অ্যাকাউন্ট আগে থেকেই আছে। সাইন ইন করো।");
  }

  const salt = randomSalt();
  accounts.push({
    email,
    salt,
    passwordHash: await hash(password, salt),
    role: "user",
    createdAt: new Date().toISOString(),
  });
  writeAccounts(accounts);

  return signIn(email, password);
}

export function getUser(): User | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<User>;
    if (!parsed?.email) return null;
    const role: Role =
      parsed.role === "admin" || parsed.role === "field" ? parsed.role : "user";
    return {
      email: parsed.email,
      name: parsed.name || displayNameFromEmail(parsed.email),
      role,
    };
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

/** ইউজার ম্যানেজমেন্ট পেজের জন্য — পাসওয়ার্ড ছাড়া */
export function listAccounts(): { email: string; role: Role; createdAt: string }[] {
  return readAccounts()
    .map(({ email, role, createdAt }) => ({ email, role, createdAt }))
    .sort((a, b) => a.email.localeCompare(b.email));
}
