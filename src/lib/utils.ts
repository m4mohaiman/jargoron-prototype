import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * crypto.randomUUID() শুধু secure context-এ (https বা localhost) পাওয়া যায় —
 * `--host` দিয়ে LAN IP-তে http-এর মাধ্যমে অ্যাক্সেস করলে এই ফাংশনটাই থাকে না,
 * তাই ফলব্যাক রাখা হলো (getRandomValues secure context ছাড়াই কাজ করে)।
 */
export function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0"));
    return [
      hex.slice(0, 4).join(""),
      hex.slice(4, 6).join(""),
      hex.slice(6, 8).join(""),
      hex.slice(8, 10).join(""),
      hex.slice(10, 16).join(""),
    ].join("-");
  }
  // শেষ ভরসা — cryptographically secure না, কিন্তু ইউনিক আইডি হিসেবে যথেষ্ট
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
