import { useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { applyTheme, getStoredTheme, type Theme } from "@/lib/theme";

export function SettingsPage() {
  const [theme, setTheme] = useState<Theme>(getStoredTheme);

  function choose(next: Theme) {
    setTheme(next);
    applyTheme(next);
  }

  return (
    <div className="mx-auto max-w-2xl px-8 py-8">
      <Card className="p-6">
        <h3 className="font-sans text-sm font-semibold uppercase tracking-wide text-forest">
          থিম
        </h3>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => choose("light")}
            className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
              theme === "light"
                ? "border-forest bg-forest text-paper"
                : "border-line text-ink-soft hover:bg-paper-dim"
            }`}
          >
            <Sun className="h-4.5 w-4.5" />
            লাইট
          </button>
          <button
            type="button"
            onClick={() => choose("dark")}
            className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
              theme === "dark"
                ? "border-forest bg-forest text-paper"
                : "border-line text-ink-soft hover:bg-paper-dim"
            }`}
          >
            <Moon className="h-4.5 w-4.5" />
            ডার্ক
          </button>
        </div>
      </Card>
    </div>
  );
}
