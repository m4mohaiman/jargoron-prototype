import {
  LayoutDashboard,
  Users,
  Settings,
  Sprout,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type Role, type User } from "@/lib/auth";

export type ShellView = "dashboard" | "history" | "users" | "settings";

interface NavItem {
  key: ShellView;
  label: string;
  icon: typeof LayoutDashboard;
}

const ROLE_LABEL_EN: Record<Role, string> = {
  admin: "Admin Panel",
  field: "Field Officer",
  user: "Regular User",
};

/** ফিল্ড অফিসার ও সাধারণ ইউজার উভয়ের জন্য একই বেসিক নেভিগেশন */
const basicNav: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "history", label: "Profile History", icon: Users },
];

const adminNav: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "history", label: "All Profiles", icon: Users },
  { key: "users", label: "User Management", icon: ShieldCheck },
  { key: "settings", label: "Settings", icon: Settings },
];

export function Sidebar({
  user,
  active,
  onNavigate,
}: {
  user: User;
  active: ShellView;
  onNavigate: (view: ShellView) => void;
}) {
  const items = user.role === "admin" ? adminNav : basicNav;

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-line bg-paper-dim/60 px-4 py-5">
      <div className="flex items-center gap-2.5 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-forest text-paper">
          <Sprout className="h-5 w-5" />
        </div>
        <div>
          <p className="font-display text-base font-semibold leading-tight text-ink">
            JAGORON
          </p>
          <p className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">
            {ROLE_LABEL_EN[user.role]}
          </p>
        </div>
      </div>

      <nav className="mt-6 flex-1 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left font-sans text-sm font-medium transition-colors",
                isActive
                  ? "bg-forest text-paper"
                  : "text-ink-soft hover:bg-paper-dim hover:text-ink"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="horizon-line mb-4" />
      <p className="px-2 text-[11px] leading-relaxed text-ink-soft/70">
        JAGORON AI Aptitude Prototype v0.1 <br />
        <br />
        CARE Bangladesh &amp; SOS CV
      </p>
    </aside>
  );
}
