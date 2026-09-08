import type { ReactNode } from "react";
import { Sidebar, type ShellView } from "@/components/shell/Sidebar";
import { Topbar } from "@/components/shell/Topbar";
import type { User } from "@/lib/auth";

const titles: Record<ShellView, string> = {
  dashboard: "Dashboard",
  history: "Profile History",
  users: "User Management",
  settings: "Settings",
};

export function AppShell({
  user,
  active,
  onNavigate,
  onLogout,
  children,
}: {
  user: User;
  active: ShellView;
  onNavigate: (view: ShellView) => void;
  onLogout: () => void;
  children: ReactNode;
}) {
  return (
    <div className="flex h-screen bg-paper">
      <Sidebar user={user} active={active} onNavigate={onNavigate} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar title={titles[active]} user={user} onLogout={onLogout} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
