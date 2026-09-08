import { ArrowLeft, Sparkles, WifiOff } from "lucide-react";
import type { ProfileResult, Participant } from "@/lib/gemini";
import {
  EMPLOYMENT_LABEL,
  DEMAND_LABEL,
  formatIncome,
  type DemandLevel,
  type EmploymentType,
} from "@/data/pathways";
import type { ScoredPathway } from "@/lib/scoring";
import type { CompetencyLevel } from "@/data/competencies";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const LEVEL_PILL: Record<CompetencyLevel, string> = {
  High: "bg-emerald-100 text-emerald-800",
  Medium: "bg-amber-100 text-amber-800",
  Developing: "bg-slate-200 text-slate-700",
};

const EMPLOYMENT_PILL: Record<EmploymentType, string> = {
  wage: "bg-sky-100 text-sky-800",
  self: "bg-emerald-100 text-emerald-800",
  enterprise: "bg-orange-100 text-orange-800",
};

const DEMAND_PILL: Record<DemandLevel, string> = {
  "very-high": "bg-emerald-100 text-emerald-800",
  high: "bg-sky-100 text-sky-800",
  growing: "bg-orange-100 text-orange-800",
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2.5 font-display text-lg font-semibold text-ink">
      <span className="h-5 w-1 rounded-full bg-navy" />
      {children}
    </h2>
  );
}

function CompetencyBar({
  label,
  labelBn,
  score,
  level,
  color,
}: {
  label: string;
  labelBn: string;
  score: number;
  level: CompetencyLevel;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-sans text-[15px] font-medium text-ink">
          {label}{" "}
          <span className="text-[13px] font-normal text-ink-soft">
            / {labelBn}
          </span>
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={cn(
              "rounded px-2 py-0.5 font-sans text-[11px] font-semibold",
              LEVEL_PILL[level],
            )}
          >
            {level}
          </span>
          <span className="w-7 text-right font-sans text-sm tabular-nums text-ink-soft">
            {score}
          </span>
        </div>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-paper-dim">
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function PathwayCard({
  pathway,
  isTop,
}: {
  pathway: ScoredPathway;
  isTop: boolean;
}) {
  return (
    <Card
      className={cn(
        "flex flex-col bg-paper-dim p-5",
        isTop && "border-navy ring-1 ring-navy/25",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-sans text-xs font-medium text-ink-soft">
          {pathway.sector}
        </p>
        <span className="shrink-0 rounded bg-emerald-100 px-1.5 py-0.5 font-sans text-[11px] font-semibold text-emerald-800">
          {pathway.match}%
        </span>
      </div>

      <h3 className="mt-2 font-sans text-[15px] font-bold leading-snug text-ink">
        {pathway.title}
      </h3>
      <p className="mt-0.5 text-[13px] text-ink-soft">{pathway.titleBn}</p>

      <p className="mt-2.5 line-clamp-3 text-[13px] leading-relaxed text-ink-soft">
        {pathway.description}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "rounded px-2 py-0.5 font-sans text-[11px] font-semibold",
            EMPLOYMENT_PILL[pathway.employment],
          )}
        >
          {EMPLOYMENT_LABEL[pathway.employment].en}
        </span>
        <span
          className={cn(
            "rounded px-2 py-0.5 font-sans text-[11px] font-semibold",
            DEMAND_PILL[pathway.demand],
          )}
        >
          {DEMAND_LABEL[pathway.demand].en}
        </span>
      </div>

      <p className="mt-3 font-sans text-[13px] font-semibold text-forest">
        {formatIncome(pathway.incomeMin, pathway.incomeMax)}
      </p>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/10 px-3 py-3 text-center">
      <p className="font-sans text-[11px] font-medium text-paper/60">{label}</p>
      <p className="mt-1 font-sans text-[15px] font-bold leading-tight text-paper">
        {value}
      </p>
    </div>
  );
}

export function Results({
  profile,
  participant,
  mode,
  createdAt,
  onBack,
}: {
  profile: ProfileResult;
  participant: Participant;
  mode: "fresh" | "view";
  createdAt: string;
  onBack: () => void;
}) {
  const date = new Date(createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const top = profile.pathways?.[0];

  const meta = [
    participant.gender,
    `Age ${participant.age}`,
    participant.district,
    participant.education,
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-paper pb-16">
      {/* header band */}
      <header className="border-b-4 border-dawn bg-navy px-6 py-8 text-paper sm:px-10 sm:py-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-sans text-sm text-paper/70">
              {mode === "fresh" ? "Assessment Complete" : "Saved Assessment"} &mdash;{" "}
              {date}
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold leading-tight sm:text-4xl">
              {participant.name}&rsquo;s Competency Profile
            </h1>
            <p className="mt-2 font-sans text-sm text-paper/70">
              {meta.join(" · ")}
            </p>
          </div>

          <button
            onClick={onBack}
            className="flex items-center gap-2 rounded-md border border-paper/30 px-4 py-2.5 font-sans text-sm font-semibold text-paper hover:bg-paper/10"
          >
            <ArrowLeft className="h-4 w-4" />
            {mode === "fresh" ? "Back to Dashboard" : "Back to History"}
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        {profile.source === "local" && (
          <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-dawn/40 bg-dawn/10 px-4 py-3 text-sm text-ink">
            <WifiOff className="mt-0.5 h-4 w-4 shrink-0 text-dawn" />
            <span>
              AI সেবার সাথে সংযোগ করা যায়নি, তাই প্রোফাইলটি JAGORON-এর
              নিয়মভিত্তিক স্কোরিং দিয়ে তৈরি হয়েছে। স্কোর ও পাথওয়ে ঠিক আছে,
              শুধু লেখাটুকু স্বয়ংক্রিয়।
            </span>
          </div>
        )}

        {/* AI narrative */}
        <Card className="mt-6 bg-paper-dim p-6">
          <div className="flex items-center gap-2 text-forest">
            <Sparkles className="h-4 w-4" />
            <span className="font-sans text-xs font-semibold uppercase tracking-wide">
              সারাংশ
            </span>
          </div>
          <h2 className="mt-2.5 font-display text-xl font-semibold text-ink">
            {profile.headline}
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
            {profile.summary}
          </p>
          {profile.strengths.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.strengths.map((s, i) => (
                <span
                  key={i}
                  className="rounded-full border border-line bg-paper px-3 py-1.5 text-[13px] font-medium text-ink"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </Card>

        {/* competencies + best pathway */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Card className="bg-paper-dim p-6">
            <SectionTitle>Competency Profile</SectionTitle>
            <div className="mt-5 space-y-4">
              {profile.competencies.map((c) => (
                <CompetencyBar
                  key={c.key}
                  label={c.en}
                  labelBn={c.bn}
                  score={c.score}
                  level={c.level}
                  color={c.color}
                />
              ))}
            </div>
          </Card>

          {top && (
            <Card className="border-navy bg-navy p-6 text-paper">
              <p className="font-sans text-[11px] font-semibold uppercase tracking-wider text-paper/60">
                Best Matched Pathway
              </p>
              <span className="mt-3 inline-block rounded-full bg-paper/15 px-3 py-1 font-sans text-xs font-semibold">
                {EMPLOYMENT_LABEL[top.employment].en}
              </span>
              <h3 className="mt-3 font-display text-2xl font-semibold leading-tight">
                {top.title}
              </h3>
              <p className="mt-1 font-sans text-sm text-paper/70">
                {top.titleBn}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-paper/80">
                {top.description}
              </p>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <Stat label="Match" value={`${top.match}%`} />
                <Stat
                  label="Avg Income"
                  value={formatIncome(top.incomeMin, top.incomeMax).replace(
                    "/month",
                    "",
                  )}
                />
                <Stat
                  label="Training"
                  value={`${top.trainingMonths} months`}
                />
              </div>
            </Card>
          )}
        </div>

        {/* all pathways */}
        <div className="mt-9">
          <SectionTitle>All Matched Pathways</SectionTitle>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profile.pathways.map((p, i) => (
              <PathwayCard key={p.id} pathway={p} isTop={i === 0} />
            ))}
          </div>
        </div>

        {/* learning pathway */}
        <Card className="mt-9 bg-paper-dim p-6">
          <SectionTitle>Recommended Learning Pathway</SectionTitle>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {profile.learningPath.map((phase) => (
              <div
                key={phase.phase}
                className="rounded-lg border border-line bg-paper/60 p-5"
              >
                <p className="font-sans text-xs font-semibold text-navy">
                  {phase.phase}
                </p>
                <h4 className="mt-1.5 font-sans text-[15px] font-bold text-ink">
                  {phase.title}
                </h4>
                <p className="text-[13px] text-ink-soft">{phase.titleBn}</p>
                <ul className="mt-3 space-y-1.5">
                  {phase.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-[13px] leading-relaxed text-ink-soft"
                    >
                      <span className="mt-0.5 text-forest">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>

        {/* next steps */}
        {profile.nextSteps.length > 0 && (
          <Card className="mt-6 bg-paper-dim p-6">
            <SectionTitle>পরবর্তী পদক্ষেপ</SectionTitle>
            <ol className="mt-4 space-y-3">
              {profile.nextSteps.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-[15px] text-ink">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-paper-dim font-sans text-xs font-semibold text-forest">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{s}</span>
                </li>
              ))}
            </ol>
          </Card>
        )}
      </div>
    </div>
  );
}
