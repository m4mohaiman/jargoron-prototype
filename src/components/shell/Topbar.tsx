import { useState } from "react";
import { LogOut, ChevronDown } from "lucide-react";
import type { User } from "@/lib/auth";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function Topbar({
  title,
  user,
  onLogout,
}: {
  title: string;
  user: User;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-line bg-paper-dim/60 px-8">
      <h1 className="font-display text-lg font-semibold text-ink">{title}</h1>

      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-paper-dim"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest font-sans text-xs font-semibold text-paper">
            {initials(user.name) || "?"}
          </span>
          <span className="hidden text-left sm:block">
            <span className="block font-sans text-sm font-semibold text-ink">
              {user.name}
            </span>
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-ink-soft" />
        </button>

        {open && (
          <>
            <button
              className="fixed inset-0 z-10 cursor-default"
              onClick={() => setOpen(false)}
              aria-label="close menu"
            />
            <div className="absolute right-0 z-20 mt-2 w-48 rounded-md border border-line bg-paper-dim py-1.5 shadow-lg">
              <div className="border-b border-line px-3.5 py-2">
                <p className="truncate text-sm font-medium text-ink">
                  {user.email}
                </p>
              </div>
              <button
                onClick={onLogout}
                className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm text-clay hover:bg-paper-dim"
              >
                <LogOut className="h-3.5 w-3.5" />
                লগআউট
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
