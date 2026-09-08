import {
  Users,
  TrendingUp,
  Briefcase,
  Sparkles,
  ArrowRight,
  UserPlus,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { SavedProfile } from "@/lib/storage";
import type { User } from "@/lib/auth";

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  accent?: "dawn" | "forest";
}) {
  return (
    <Card className="p-5">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-full ${
          accent === "dawn" ? "bg-dawn-dim text-dawn" : "bg-forest/10 text-forest"
        }`}
      >
        <Icon className="h-4.5 w-4.5" />
      </div>
      <p className="mt-4 font-display text-2xl font-semibold text-ink">{value}</p>
      <p className="mt-0.5 text-sm text-ink-soft">{label}</p>
    </Card>
  );
}

export function Dashboard({
  user,
  profiles,
  onNewAssessment,
  onOpenProfile,
  onSeeAll,
}: {
  user: User;
  profiles: SavedProfile[];
  onNewAssessment: () => void;
  onOpenProfile: (id: string) => void;
  onSeeAll: () => void;
}) {
  const total = profiles.length;
  const selfPathway = profiles.filter((p) => p.profile.pathway === "self").length;
  const wagePathway = profiles.filter((p) => p.profile.pathway === "wage").length;
  const avgScore =
    total === 0
      ? 0
      : Math.round(
          profiles.reduce((sum, p) => {
            const scores = p.profile.competencies.map((c) => c.score);
            return sum + scores.reduce((a, b) => a + b, 0) / scores.length;
          }, 0) / total,
        );

  const recent = profiles.slice(0, 5);

  return (
    <div className="mx-auto max-w-5xl px-8 py-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-ink-soft">
            স্বাগতম, <span className="font-medium text-ink">{user.name}</span>
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-ink">
            {user.role === "admin" ? "প্রকল্পের সার্বিক চিত্র" : "তোমার অ্যাসেসমেন্ট সারাংশ"}
          </h2>
        </div>
        {user.role !== "admin" && (
          <Button onClick={onNewAssessment} className="gap-2">
            <UserPlus className="h-4 w-4" />
            নতুন অ্যাসেসমেন্ট
          </Button>
        )}
      </div>

      <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Users} label="মোট প্রোফাইল" value={total} />
        <StatCard
          icon={Briefcase}
          label="বেতনভিত্তিক পাথওয়ে"
          value={wagePathway}
        />
        <StatCard
          icon={TrendingUp}
          label="উদ্যোক্তা পাথওয়ে"
          value={selfPathway}
          accent="dawn"
        />
        <StatCard
          icon={Sparkles}
          label="গড় সক্ষমতা স্কোর"
          value={total === 0 ? "—" : `${avgScore}%`}
          accent="dawn"
        />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-ink">
          সাম্প্রতিক প্রোফাইল
        </h3>
        {total > 0 && (
          <button
            onClick={onSeeAll}
            className="flex items-center gap-1 text-sm font-medium text-forest hover:underline"
          >
            সব দেখো
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {recent.length === 0 ? (
        <Card className="mt-4 flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-paper-dim text-ink-soft">
            <Users className="h-5 w-5" />
          </div>
          <p className="text-sm text-ink-soft">
            এখনো কোনো অ্যাসেসমেন্ট সম্পন্ন হয়নি
          </p>
          {user.role !== "admin" && (
            <Button onClick={onNewAssessment} size="sm" className="mt-1 gap-2">
              <UserPlus className="h-3.5 w-3.5" />
              প্রথম অ্যাসেসমেন্ট শুরু করো
            </Button>
          )}
        </Card>
      ) : (
        <Card className="mt-4 divide-y divide-line overflow-hidden">
          {recent.map((p) => (
            <button
              key={p.id}
              onClick={() => onOpenProfile(p.id)}
              className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-paper-dim"
            >
              <div>
                <p className="font-sans text-[15px] font-semibold text-ink">
                  {p.participant.name}
                </p>
                <p className="mt-0.5 text-sm text-ink-soft">
                  {p.participant.district} &middot; {p.profile.pathwayLabel}
                </p>
              </div>
              <span className="text-xs text-ink-soft">
                {new Date(p.createdAt).toLocaleDateString("bn-BD", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>
            </button>
          ))}
        </Card>
      )}
    </div>
  );
}
