import { useMemo, useState, type ComponentType, type ReactNode } from "react";
import {
  Users,
  Lightbulb,
  CheckCircle2,
  Activity,
  Briefcase,
  MapPin,
  GraduationCap,
  HeartHandshake,
  Venus,
  PieChart,
  Eye,
  Download,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/auth";
import type {
  Participant as GeminiParticipant,
  ProfileResult,
  ScoredCompetency,
} from "@/lib/gemini";
import {
  rankPathways,
  buildNarrative,
  buildLearningPath,
  type CompetencyScores,
} from "@/lib/scoring";
import { COMPETENCIES, COMPETENCY_KEYS, levelOf } from "@/data/competencies";
import {
  GENDERS,
  DISTRICTS,
  DISABILITY_STATUS,
  EDUCATION_LEVELS,
  type EducationOption,
} from "@/data/options";


const DUMMY_STATS = {
  totalRegisteredYouth: 12000,
  assessmentsCompleted: 8420,
  youthWithRecommendations: 7850,
  femaleParticipantPct: 54,
  avgCompetencyScore: 68,
};

const PATHWAY_DISTRIBUTION = [
  { sector: "Garments & Textile", count: 1850, pct: 22 },
  { sector: "Electrical / Technical", count: 1260, pct: 15 },
  { sector: "Agriculture & Food", count: 1180, pct: 14 },
  { sector: "Small Business", count: 1010, pct: 12 },
  { sector: "Digital Services", count: 930, pct: 11 },
  { sector: "Construction", count: 840, pct: 10 },
  { sector: "Health & Social Care", count: 590, pct: 7 },
  { sector: "Hospitality", count: 500, pct: 6 },
  { sector: "Handicrafts", count: 260, pct: 3 },
];

const ASSESSMENT_STATUS = {
  totalYouth: 12000,
  segments: [
    { label: "Completed", value: 8420, pct: 70, color: "var(--color-forest)" },
    { label: "In Progress", value: 1180, pct: 10, color: "var(--color-dawn)" },
    { label: "Not Started", value: 2400, pct: 20, color: "#c7cdc9" },
  ],
};

const GENDER_DISTRIBUTION = [
  { label: "Female", value: 6480, pct: 54, color: "var(--color-clay)" },
  { label: "Male", value: 5280, pct: 44, color: "var(--color-navy)" },
  { label: "Other", value: 240, pct: 2, color: "var(--color-dawn)" },
];

const DISABILITY_DISTRIBUTION = [
  { label: "No disability", value: 9840 },
  { label: "Physical disability", value: 960 },
  { label: "Visual impairment", value: 600 },
  { label: "Hearing impairment", value: 360 },
  { label: "Prefer not to say", value: 240 },
];

const EDUCATION_DISTRIBUTION = [
  { label: "No formal education", value: 1440 },
  { label: "Primary (Class 1–5)", value: 2160 },
  { label: "Class 6–8 (JSC)", value: 2520 },
  { label: "SSC / Class 10", value: 3000 },
  { label: "HSC / Class 12", value: 1680 },
  { label: "Vocational / Technical", value: 840 },
  { label: "Graduate or above", value: 360 },
];

const DISTRICT_DISTRIBUTION = [
  { label: "Khulna", value: 6600 },
  { label: "Gazipur", value: 5400 },
];

const EMPLOYMENT_DISTRIBUTION = [
  { key: "self", label: "Self-Employment", value: 1960, pct: 25, color: "var(--color-forest)" },
  { key: "enterprise", label: "Entrepreneurship", value: 1180, pct: 15, color: "var(--color-dawn)" },
];

const RECENT_PARTICIPANTS = [
  { name: "Fatema Begum", age: 22, district: "Khulna", pathway: "Garments & Textile", score: 87, source: "AI", gender: "female", education: "ssc" },
  { name: "Md. Rahim Molla", age: 25, district: "Gazipur", pathway: "Digital Services", score: 91, source: "AI", gender: "male", education: "graduate" },
  { name: "Sumaiya Khatun", age: 19, district: "Khulna", pathway: "Handicrafts & Creative", score: 76, source: "Local", gender: "female", education: "jsc" },
  { name: "Karim Hossain", age: 28, district: "Gazipur", pathway: "Construction & Green Building", score: 82, source: "AI", gender: "male", education: "vocational" },
  { name: "Nasrin Akter", age: 23, district: "Khulna", pathway: "Community Health", score: 79, source: "AI", gender: "female", education: "hsc" },
  { name: "Tania Parvin", age: 21, district: "Gazipur", pathway: "Retail / Small Business", score: 88, source: "AI", gender: "female", education: "ssc" },
  { name: "Md. Rubel Islam", age: 26, district: "Khulna", pathway: "Agriculture & Food Processing", score: 74, source: "Local", gender: "male", education: "none" },
  { name: "Roksana Begum", age: 24, district: "Gazipur", pathway: "Handicrafts & Creative", score: 85, source: "AI", gender: "female", education: "primary" },
] as const satisfies readonly {
  name: string;
  age: number;
  district: string;
  pathway: string;
  score: number;
  source: "AI" | "Local";
  gender: "female" | "male";
  education: EducationOption["id"];
}[];

type Participant = (typeof RECENT_PARTICIPANTS)[number];

const GENDER_VALUE: Record<"female" | "male", string> = {
  female: GENDERS.find((g) => g.en === "Female")!.value,
  male: GENDERS.find((g) => g.en === "Male")!.value,
};

const EDU_VALUE = Object.fromEntries(
  EDUCATION_LEVELS.map((e) => [e.id, e.value]),
) as Record<EducationOption["id"], string>;

/** নাম থেকে ডিটারমিনিস্টিক সিউডো-র‍্যান্ডম সংখ্যা — একই অংশগ্রহণকারীর জন্য প্রতিবার একই প্রোফাইল দেখায় */
function seededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(h, 31) + seed.charCodeAt(i)) | 0;
  return () => {
    h = (Math.imul(h, 1664525) + 1013904223) | 0;
    return ((h >>> 0) % 10000) / 10000;
  };
}

/**
 * Recent Participants টেবিলের ডামি সারি থেকে একটা পূর্ণাঙ্গ Results-পেজ-উপযোগী
 * প্রোফাইল তৈরি করে — আসল স্কোরিং/পাথওয়ে ইঞ্জিন ব্যবহার করে, শুধু উত্তরের বদলে
 * টেবিলের কম্পিটেন্সি স্কোরের চারপাশে ছড়ানো মান থেকে শুরু করে।
 */
function buildDummyProfile(p: Participant): {
  profile: ProfileResult;
  participant: GeminiParticipant;
} {
  const rand = seededRandom(p.name);
  const scores = {} as CompetencyScores;
  for (const k of COMPETENCY_KEYS) {
    scores[k] = Math.max(5, Math.min(100, Math.round(p.score + (rand() - 0.5) * 26)));
  }
  const leaning = (rand() - 0.5) * 0.6;
  const ranked = rankPathways(scores, leaning);

  const participant: GeminiParticipant = {
    name: p.name,
    age: String(p.age),
    gender: GENDER_VALUE[p.gender],
    district: DISTRICTS.find((d) => d.en === p.district)?.value ?? p.district,
    disability: DISABILITY_STATUS[0].value,
    education: EDU_VALUE[p.education],
  };

  const narrative = buildNarrative(participant, scores, ranked);
  const competencies: ScoredCompetency[] = COMPETENCIES.map((c) => ({
    key: c.key,
    en: c.en,
    bn: c.bn,
    color: c.color,
    score: scores[c.key],
    level: levelOf(scores[c.key]),
  }));

  const profile: ProfileResult = {
    headline: narrative.headline,
    summary: narrative.summary,
    strengths: narrative.strengths,
    pathway: narrative.pathway,
    pathwayLabel: narrative.pathwayLabel,
    sectors: narrative.sectors,
    nextSteps: narrative.nextSteps,
    competencies,
    pathways: ranked,
    learningPath: buildLearningPath(ranked[0]),
    source: "local",
  };

  return { profile, participant };
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** ৳ চিহ্ন jsPDF-এর স্ট্যান্ডার্ড ফন্টে রেন্ডার হয় না, তাই PDF-এ "Tk" ব্যবহার করা হয় */
function formatIncomeEn(min: number, max: number): string {
  const f = (n: number) => n.toLocaleString("en-US");
  return `Tk ${f(min)}-${f(max)} / month`;
}

/**
 * View পেজের মতোই একই ডামি প্রোফাইল থেকে PDF বানায়। ProfileResult-এর
 * headline/summary/nextSteps বাংলায় তৈরি হয় (buildNarrative থেকে), কিন্তু jsPDF-এর
 * স্ট্যান্ডার্ড ফন্ট বাংলা গ্লিফ আঁকতে পারে না — তাই PDF-এর জন্য একই তথ্য থেকে
 * (competencies/pathway-এর ইংরেজি .en/.title ফিল্ড ব্যবহার করে) আলাদা ইংরেজি
 * সারাংশ বানানো হয়েছে।
 */
async function downloadParticipantReport(p: Participant) {
  const { jsPDF } = await import("jspdf");
  const { profile } = buildDummyProfile(p);
  const doc = new jsPDF();
  const pageW = 210;
  const mX = 14;
  const contentW = pageW - mX * 2;

  const genderEn = p.gender === "female" ? "Female" : "Male";
  const educationEn = EDUCATION_LEVELS.find((e) => e.id === p.education)?.en ?? "";

  const rankedComp = [...profile.competencies].sort((a, b) => b.score - a.score);
  const top2 = rankedComp.slice(0, 2);
  const weakest = rankedComp[rankedComp.length - 1];
  const top = profile.pathways[0];

  const summary = `${p.name} shows the strongest results in ${top2[0].en} and ${top2[1].en}, which line up well with the "${top.title}" pathway. Spending more time on ${weakest.en.toLowerCase()} would open up even more options.`;
  const nextSteps = [
    `Enroll in a ${top.trainingMonths}-month training track in ${top.title}.`,
    `Join JAGORON soft-skill sessions focused on ${weakest.en}.`,
    top.employment === "wage"
      ? "Connect with local employer job-placement support."
      : "Apply for seed capital through the Youth Challenge Fund.",
  ];

  let y = 0;

  // হেডার ব্যান্ড
  doc.setFillColor(31, 92, 82);
  doc.rect(0, 0, pageW, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("JAGORON", mX, 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Youth Competency & Pathway Report", mX, 21);
  doc.setFontSize(9);
  doc.text(
    `Assessment Date: ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`,
    mX,
    27,
  );

  // অংশগ্রহণকারীর নাম ও মেটা
  y = 42;
  doc.setTextColor(22, 36, 31);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(`${p.name}'s Competency Profile`, mX, y);

  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(69, 86, 78);
  doc.text(`${genderEn}  |  Age ${p.age}  |  ${p.district}  |  ${educationEn}`, mX, y);

  // সারাংশ বক্স
  y += 8;
  const summaryLines = doc.splitTextToSize(summary, contentW - 8);
  const summaryBoxH = 14 + summaryLines.length * 5;
  doc.setFillColor(238, 243, 236);
  doc.roundedRect(mX, y, contentW, summaryBoxH, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(31, 92, 82);
  doc.text(`Ready for: ${top.title}`, mX + 4, y + 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(60, 72, 66);
  doc.text(summaryLines, mX + 4, y + 13);
  y += summaryBoxH + 9;

  // কম্পিটেন্সি প্রোফাইল
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(22, 36, 31);
  doc.text("Competency Profile", mX, y);
  y += 7;
  for (const c of profile.competencies) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(22, 36, 31);
    doc.text(`${c.en} (${c.level})`, mX, y);
    doc.setFont("helvetica", "bold");
    doc.text(String(c.score), pageW - mX, y, { align: "right" });
    y += 3;
    doc.setFillColor(224, 229, 222);
    doc.roundedRect(mX, y, contentW, 3.2, 1.5, 1.5, "F");
    doc.setFillColor(...hexToRgb(c.color));
    doc.roundedRect(mX, y, contentW * (c.score / 100), 3.2, 1.5, 1.5, "F");
    y += 8;
  }

  // সেরা ম্যাচড পাথওয়ে
  y += 3;
  const descLines = doc.splitTextToSize(top.description, contentW - 8);
  const pathwayBoxH = 30 + descLines.length * 5;
  doc.setFillColor(20, 40, 66);
  doc.roundedRect(mX, y, contentW, pathwayBoxH, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("BEST MATCHED PATHWAY", mX + 4, y + 7);
  doc.setFontSize(13);
  doc.text(top.title, mX + 4, y + 15.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(descLines, mX + 4, y + 22);
  doc.setFontSize(9);
  doc.text(
    `Match: ${top.match}%   |   Avg Income: ${formatIncomeEn(top.incomeMin, top.incomeMax)}   |   Training: ${top.trainingMonths} months`,
    mX + 4,
    y + pathwayBoxH - 4,
  );
  y += pathwayBoxH + 9;

  // পরবর্তী পদক্ষেপ
  if (y > 250) {
    doc.addPage();
    y = 20;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(22, 36, 31);
  doc.text("Next Steps", mX, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(22, 36, 31);
  nextSteps.forEach((step, i) => {
    const lines = doc.splitTextToSize(`${i + 1}. ${step}`, contentW);
    doc.text(lines, mX, y);
    y += lines.length * 5 + 2;
  });

  // ফুটার
  doc.setDrawColor(211, 219, 208);
  doc.line(mX, 285, pageW - mX, 285);
  doc.setFontSize(9);
  doc.setTextColor(69, 86, 78);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`, mX, 291);
  doc.text("CARE Bangladesh & SOS Children's Villages Bangladesh", mX, 296);

  doc.save(`${p.name.trim().replace(/\s+/g, "_")}_report.pdf`);
}

function StatTile({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  accent?: "dawn" | "forest";
}) {
  return (
    <Card className="p-5">
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full",
          accent === "dawn" ? "bg-dawn-dim text-dawn" : "bg-forest/10 text-forest",
        )}
      >
        <Icon className="h-4.5 w-4.5" />
      </div>
      <p className="mt-4 font-display text-2xl font-semibold text-ink">{value}</p>
      <p className="mt-0.5 text-sm text-ink-soft">{label}</p>
    </Card>
  );
}

function SectionHeading({
  icon: Icon,
  children,
  subtitle,
}: {
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy/10 text-navy">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div>
        <h3 className="font-display text-[15px] font-semibold text-ink">{children}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-ink-soft">{subtitle}</p>}
      </div>
    </div>
  );
}

function HBarRow({
  label,
  value,
  max,
  color = "var(--color-forest)",
}: {
  label: string;
  value: number;
  max: number;
  color?: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-ink">{label}</span>
        <span className="tabular-nums text-ink-soft">{value.toLocaleString("en-US")}</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-paper-dim">
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

/**
 * ইন্টারেক্টিভ ডোনাট চার্ট — সেগমেন্টে হোভার/ফোকাস করলে সেটা বড় ও উজ্জ্বল হয়ে যায়,
 * আর মাঝখানে সেই সেগমেন্টের মান দেখায়। কিছুই হোভার না করলে ঐচ্ছিক centerLabel দেখায়।
 */
function Donut({
  data,
  size = 128,
  thickness = 18,
  centerLabel,
}: {
  data: { label: string; value: number; color: string; display?: string }[];
  size?: number;
  thickness?: number;
  centerLabel?: { value: string; label: string };
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;

  const segments = data.reduce<{ d: (typeof data)[number]; len: number; offset: number }[]>(
    (acc, d) => {
      const prevEnd = acc.length > 0 ? acc[acc.length - 1].offset + acc[acc.length - 1].len : 0;
      const len = (d.value / total) * c;
      acc.push({ d, len, offset: prevEnd });
      return acc;
    },
    [],
  );

  const active = hovered !== null ? segments[hovered] : null;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90 shrink-0"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-paper-dim)"
          strokeWidth={thickness}
        />
        {segments.map(({ d, len, offset }, i) => (
          <circle
            key={d.label}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={d.color}
            strokeWidth={hovered === i ? thickness + 5 : thickness}
            strokeDasharray={`${len} ${c - len}`}
            strokeDashoffset={-offset}
            opacity={hovered !== null && hovered !== i ? 0.4 : 1}
            style={{ cursor: "pointer", transition: "stroke-width 150ms ease, opacity 150ms ease" }}
            tabIndex={0}
            role="img"
            aria-label={`${d.label}: ${d.display ?? d.value}`}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(i)}
            onBlur={() => setHovered(null)}
          />
        ))}
      </svg>
      {(active || centerLabel) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-2 text-center">
          {active ? (
            <>
              <span className="font-display text-lg font-bold" style={{ color: active.d.color }}>
                {active.d.display ?? active.d.value}
              </span>
              <span className="text-[11px] leading-tight text-ink-soft">{active.d.label}</span>
            </>
          ) : (
            <>
              <span className="font-display text-2xl font-bold text-ink">
                {centerLabel!.value}
              </span>
              <span className="text-xs text-ink-soft">{centerLabel!.label}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/** Fisher–Yates শাফল — প্রতিবার নতুন করে বার-এর ক্রম এলোমেলো করে দেয় */
function shuffle<T>(arr: readonly T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** সংখ্যা বার-এর উপরে, % বার-এর ভেতরে (ছোট করে), সেক্টরের নাম বার-এর নিচে — বার-এর ক্রম এলোমেলো */
function PathwayBarChart({ data }: { data: typeof PATHWAY_DISTRIBUTION }) {
  const ordered = useMemo(() => shuffle(data), [data]);
  const maxPct = Math.max(...ordered.map((d) => d.pct));

  return (
    <div className="mt-5 flex items-end gap-1.5">
      {ordered.map((d) => {
        const heightPct = Math.max(18, (d.pct / maxPct) * 100);
        return (
          <div key={d.sector} className="flex flex-1 flex-col items-center">
            <span className="font-display text-lg font-extrabold tabular-nums text-forest">
              {d.count.toLocaleString("en-US")}
            </span>
            <div className="mt-1.5 flex h-56 w-full items-end">
              <div
                className="flex w-full items-start justify-center rounded-t-md bg-gradient-to-t from-forest-dark to-forest pt-1.5 shadow-sm transition-[filter] duration-200 hover:brightness-110"
                style={{ height: `${heightPct}%` }}
                title={`${d.sector}: ${d.count.toLocaleString("en-US")} (${d.pct}%)`}
              >
                <span
                  className="font-sans text-[11px] font-bold text-white"
                  style={{ textShadow: "0 1px 2px rgba(0,0,0,0.35)" }}
                >
                  {d.pct}%
                </span>
              </div>
            </div>
            <span className="mt-2 text-center text-sm font-medium leading-tight text-ink-soft">
              {d.sector}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function AdminDashboard({
  user,
  onViewParticipant,
}: {
  user: User;
  onViewParticipant: (data: {
    profile: ProfileResult;
    participant: GeminiParticipant;
    createdAt: string;
  }) => void;
}) {
  return (
    <div className="mx-auto max-w-7xl px-8 py-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-ink-soft">
            Welcome, <span className="font-medium text-ink">{user.name}</span>
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-ink">
            Project Overview & Insights
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Pathway recommendations, assessment progress, and overall participant overview
          </p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-forest/10 px-2.5 py-1 font-sans text-xs font-semibold text-forest">
          <span className="h-1.5 w-1.5 rounded-full bg-forest" />
          Live
        </span>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatTile
          icon={Users}
          label="Total Registered Youth"
          value={DUMMY_STATS.totalRegisteredYouth.toLocaleString("en-US")}
        />
        <StatTile
          icon={CheckCircle2}
          label="Assessments Completed"
          value={DUMMY_STATS.assessmentsCompleted.toLocaleString("en-US")}
          accent="dawn"
        />
        <StatTile
          icon={Lightbulb}
          label="Youth with Recommendations"
          value={DUMMY_STATS.youthWithRecommendations.toLocaleString("en-US")}
        />
        <StatTile
          icon={Venus}
          label="Female Participant"
          value={`${DUMMY_STATS.femaleParticipantPct}%`}
          accent="dawn"
        />
        <StatTile
          icon={Activity}
          label="Avg Competency Score"
          value={DUMMY_STATS.avgCompetencyScore}
        />
      </div>

      <Card className="mt-6 p-5">
        <SectionHeading icon={Briefcase} subtitle="Breakdown by top recommended sector">
          Pathway Recommendation Distribution
        </SectionHeading>
        <PathwayBarChart data={PATHWAY_DISTRIBUTION} />
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        <Card className="p-5">
          <SectionHeading icon={PieChart} subtitle="Where youth stand in the assessment process">
            Assessment Status
          </SectionHeading>
          <div className="mt-5 flex items-center gap-6">
            <Donut
              size={168}
              thickness={26}
              centerLabel={{
                value: ASSESSMENT_STATUS.totalYouth.toLocaleString("en-US"),
                label: "Total Youth",
              }}
              data={ASSESSMENT_STATUS.segments.map((s) => ({
                ...s,
                display: s.value.toLocaleString("en-US"),
              }))}
            />
            <div className="flex-1 space-y-3.5">
              {ASSESSMENT_STATUS.segments.map((s) => (
                <div key={s.label} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-ink-soft">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: s.color }}
                    />
                    {s.label}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="font-semibold tabular-nums text-ink">
                      {s.value.toLocaleString("en-US")}
                    </span>
                    <span className="text-xs text-ink-soft">{s.pct}%</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <SectionHeading icon={Venus} subtitle="Youth by gender, cohort-wide">
            Gender Distribution
          </SectionHeading>
          <div className="mt-5 flex items-center gap-6">
            <Donut
              size={168}
              thickness={26}
              centerLabel={{ value: DUMMY_STATS.totalRegisteredYouth.toLocaleString("en-US"), label: "Total Youth" }}
              data={GENDER_DISTRIBUTION.map((g) => ({
                ...g,
                display: g.value.toLocaleString("en-US"),
              }))}
            />
            <div className="flex-1 space-y-3.5">
              {GENDER_DISTRIBUTION.map((g) => (
                <div key={g.label} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-ink-soft">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: g.color }} />
                    {g.label}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="font-semibold tabular-nums text-ink">
                      {g.value.toLocaleString("en-US")}
                    </span>
                    <span className="text-xs text-ink-soft">{g.pct}%</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <SectionHeading icon={HeartHandshake}>Disability Inclusion</SectionHeading>
          <div className="mt-4 space-y-3">
            {DISABILITY_DISTRIBUTION.map((d) => (
              <HBarRow
                key={d.label}
                label={d.label}
                value={d.value}
                max={DISABILITY_DISTRIBUTION[0].value}
                color="var(--color-navy)"
              />
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <SectionHeading icon={GraduationCap}>Education Level</SectionHeading>
          <div className="mt-4 space-y-3">
            {EDUCATION_DISTRIBUTION.map((e) => (
              <HBarRow
                key={e.label}
                label={e.label}
                value={e.value}
                max={Math.max(...EDUCATION_DISTRIBUTION.map((x) => x.value))}
                color="var(--color-clay)"
              />
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <SectionHeading icon={MapPin}>District-wise Participation</SectionHeading>
          <div className="mt-4 space-y-3.5">
            {DISTRICT_DISTRIBUTION.map((d) => (
              <HBarRow
                key={d.label}
                label={d.label}
                value={d.value}
                max={DISTRICT_DISTRIBUTION[0].value}
              />
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <SectionHeading icon={Briefcase} subtitle="How recommended youth will earn a living">
            Employment Type
          </SectionHeading>
          <div className="mt-5 flex items-center gap-6">
            <Donut
              size={168}
              thickness={26}
              centerLabel={{
                value: DUMMY_STATS.youthWithRecommendations.toLocaleString("en-US"),
                label: "Recommended",
              }}
              data={EMPLOYMENT_DISTRIBUTION.map((e) => ({
                ...e,
                display: e.value.toLocaleString("en-US"),
              }))}
            />
            <div className="flex-1 space-y-3.5">
              {EMPLOYMENT_DISTRIBUTION.map((e) => (
                <div key={e.key} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-ink-soft">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: e.color }} />
                    {e.label}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="font-semibold tabular-nums text-ink">
                      {e.value.toLocaleString("en-US")}
                    </span>
                    <span className="text-xs text-ink-soft">{e.pct}%</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <h3 className="font-display text-lg font-semibold text-ink">Recent Participants</h3>
      </div>
      <Card className="mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-paper-dim/60 text-xs font-medium uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-4 py-3">Age</th>
                <th className="px-4 py-3">District</th>
                <th className="px-4 py-3">Top Pathway</th>
                <th className="px-4 py-3">Competency Score</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {RECENT_PARTICIPANTS.map((p) => (
                <tr key={p.name} className="hover:bg-paper-dim/40">
                  <td className="px-5 py-3 font-medium text-ink">{p.name}</td>
                  <td className="px-4 py-3 text-ink-soft">{p.age}</td>
                  <td className="px-4 py-3 text-ink-soft">{p.district}</td>
                  <td className="px-4 py-3 text-ink-soft">{p.pathway}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-paper-dim">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-dawn to-forest"
                          style={{ width: `${p.score}%` }}
                        />
                      </div>
                      <span className="tabular-nums text-ink-soft">{p.score}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          onViewParticipant({
                            ...buildDummyProfile(p),
                            createdAt: new Date().toISOString(),
                          })
                        }
                        className="flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 font-sans text-xs font-medium text-ink-soft hover:border-forest/50 hover:text-forest"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </button>
                      <button
                        onClick={() => downloadParticipantReport(p)}
                        className="flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 font-sans text-xs font-medium text-ink-soft hover:border-forest/50 hover:text-forest"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Report
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
