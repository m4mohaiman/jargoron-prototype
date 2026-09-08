import { useEffect, useState } from "react";
import { Sprout, ArrowRight, Loader2, TriangleAlert, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  signIn,
  signUp,
  ensureSeedAccounts,
  DEMO_ACCOUNTS,
  ROLE_LABEL_BN,
  AuthError,
  type User,
} from "@/lib/auth";

type Mode = "signin" | "signup";

export function Login({ onLogin }: { onLogin: (user: User) => void }) {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    ensureSeedAccounts();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      const user = mode === "signin"
        ? await signIn(email, password)
        : await signUp(email, password);
      onLogin(user);
    } catch (err) {
      setError(
        err instanceof AuthError
          ? err.message
          : "সাইন ইন করা যায়নি। আবার চেষ্টা করো।",
      );
    } finally {
      setBusy(false);
    }
  }

  function applyDemo(account: (typeof DEMO_ACCOUNTS)[number]) {
    setMode("signin");
    setEmail(account.email);
    setPassword(account.password);
    setError(null);
  }

  return (
    <div className="flex min-h-screen">
      {/* left: brand panel */}
      <div className="relative hidden w-[42%] flex-col justify-between overflow-hidden bg-forest-dark px-10 py-12 text-paper lg:flex">
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-64"
          style={{
            background:
              "linear-gradient(to top, rgba(224,167,46,0.22), transparent)",
          }}
        />
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-dawn text-forest-dark">
            <Sprout className="h-5 w-5" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">
            JAGORON
          </span>
        </div>

        <div className="relative">
          <h1 className="font-display text-4xl font-semibold leading-[1.15]">
            যুব প্রোফাইলিং ও
            <br />
            অ্যাপটিটিউড টেস্টিং
            <br />
            প্ল্যাটফর্ম
          </h1>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-paper/75">
            CARE Bangladesh ও SOS Children&rsquo;s Villages Bangladesh-এর
            যৌথ উদ্যোগে NEET যুবদের সম্ভাবনা চিহ্নিত করার একটি AI-চালিত টুল।
          </p>
        </div>

        <p className="relative text-xs text-paper/50">
          Internal Prototype &middot; SOS CV &amp; CARE Bangladesh
        </p>
      </div>

      {/* right: auth form */}
      <div className="flex flex-1 items-center justify-center bg-paper px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-forest text-paper">
              <Sprout className="h-5 w-5" />
            </div>
            <span className="font-display text-lg font-semibold tracking-tight text-ink">
              JAGORON
            </span>
          </div>

          <div className="inline-flex rounded-lg border border-line bg-paper-dim p-1">
            {(["signin", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                className={cn(
                  "rounded-md px-4 py-1.5 font-sans text-sm font-semibold transition-colors",
                  mode === m
                    ? "bg-forest text-paper"
                    : "text-ink-soft hover:text-ink",
                )}
              >
                {m === "signin" ? "সাইন ইন" : "সাইন আপ"}
              </button>
            ))}
          </div>

          <h2 className="mt-6 font-display text-2xl font-semibold text-ink">
            {mode === "signin" ? "সাইন ইন করো" : "নতুন অ্যাকাউন্ট খোলো"}
          </h2>
          <p className="mt-1.5 text-sm text-ink-soft">
            {mode === "signin"
              ? "ইমেইল ও পাসওয়ার্ড দিয়ে ড্যাশবোর্ডে প্রবেশ করো"
              : "ইমেইল ও একটি পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) দাও"}
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-ink"
              >
                ইমেইল
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@carebangladesh.org"
                autoFocus
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-ink"
              >
                পাসওয়ার্ড
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={
                    mode === "signin" ? "current-password" : "new-password"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
                  aria-label={
                    showPassword ? "পাসওয়ার্ড লুকাও" : "পাসওয়ার্ড দেখাও"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-md border border-clay/30 bg-clay/5 px-3 py-2.5 text-sm text-clay"
              >
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full gap-2"
              disabled={busy}
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {mode === "signin" ? "সাইন ইন" : "অ্যাকাউন্ট তৈরি করো"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 rounded-lg border border-line bg-paper-dim/70 px-4 py-3.5">
            <p className="font-sans text-xs font-semibold uppercase tracking-wide text-ink-soft">
              ডেমো অ্যাকাউন্ট
            </p>
            <div className="mt-2.5 space-y-1.5">
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.email}
                  type="button"
                  onClick={() => applyDemo(a)}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-paper-dim"
                >
                  <span className="font-mono text-[13px] text-ink">
                    {a.email}
                  </span>
                  <span className="text-xs text-ink-soft">
                    {ROLE_LABEL_BN[a.role]}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-2 px-2 text-xs text-ink-soft">
              পাসওয়ার্ড: <span className="font-mono">jagoron123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
