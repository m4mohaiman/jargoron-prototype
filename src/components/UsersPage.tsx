import { useState } from "react";
import { ShieldCheck, UserRound, CircleUser } from "lucide-react";
import { Card } from "@/components/ui/card";
import { listAccounts, displayNameFromEmail, ROLE_LABEL_BN } from "@/lib/auth";

const ROLE_ICON = {
  admin: ShieldCheck,
  field: UserRound,
  user: CircleUser,
} as const;

export function UsersPage({ currentUserEmail }: { currentUserEmail: string }) {
  const [accounts] = useState(listAccounts);

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <p className="text-sm text-ink-soft">
        এই ব্রাউজারে নিবন্ধিত {accounts.length}টি অ্যাকাউন্ট
      </p>

      <Card className="mt-4 divide-y divide-line overflow-hidden">
        {accounts.map((u) => (
          <div
            key={u.email}
            className="flex items-center justify-between px-5 py-4"
          >
            <div className="flex items-center gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest">
                {(() => {
                  const Icon = ROLE_ICON[u.role];
                  return <Icon className="h-4.5 w-4.5" />;
                })()}
              </span>
              <div>
                <p className="flex items-center gap-2 font-sans text-[15px] font-semibold text-ink">
                  {displayNameFromEmail(u.email)}
                  {u.email === currentUserEmail && (
                    <span className="rounded-full bg-dawn-dim px-2 py-0.5 text-[11px] font-semibold text-ink">
                      তুমি
                    </span>
                  )}
                </p>
                <p className="text-sm text-ink-soft">{u.email}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm font-medium text-forest">
                {ROLE_LABEL_BN[u.role]}
              </p>
              <p className="mt-0.5 text-xs text-ink-soft">
                {new Date(u.createdAt).toLocaleDateString("bn-BD", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        ))}
      </Card>

      <p className="mt-4 text-xs leading-relaxed text-ink-soft">
        ডেমোতে অ্যাকাউন্টগুলো ব্রাউজারের localStorage-এ থাকে, তাই এই তালিকা
        শুধু এই ডিভাইসের।
      </p>
    </div>
  );
}
