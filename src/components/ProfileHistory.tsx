import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { SavedProfile } from "@/lib/storage";

export function ProfileHistory({
  profiles,
  onOpenProfile,
}: {
  profiles: SavedProfile[];
  onOpenProfile: (id: string) => void;
}) {
  return (
    <div className="mx-auto max-w-5xl px-8 py-8">
      <p className="text-sm text-ink-soft">
        মোট {profiles.length}টি প্রোফাইল সংরক্ষিত আছে
      </p>

      {profiles.length === 0 ? (
        <Card className="mt-4 flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-paper-dim text-ink-soft">
            <Users className="h-5 w-5" />
          </div>
          <p className="text-sm text-ink-soft">এখনো কোনো প্রোফাইল তৈরি হয়নি</p>
        </Card>
      ) : (
        <Card className="mt-4 divide-y divide-line overflow-hidden">
          {profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => onOpenProfile(p.id)}
              className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-paper-dim"
            >
              <div className="flex items-center gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest/10 font-sans text-sm font-semibold text-forest">
                  {p.participant.name.trim()[0]?.toUpperCase() ?? "?"}
                </span>
                <div>
                  <p className="font-sans text-[15px] font-semibold text-ink">
                    {p.participant.name}
                  </p>
                  <p className="mt-0.5 text-sm text-ink-soft">
                    {p.participant.gender} &middot; বয়স {p.participant.age} &middot;{" "}
                    {p.participant.district}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-forest">
                  {p.profile.pathwayLabel}
                </p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  {new Date(p.createdAt).toLocaleDateString("bn-BD", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </button>
          ))}
        </Card>
      )}
    </div>
  );
}
