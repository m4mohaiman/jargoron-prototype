import {
  COMPETENCIES,
  COMPETENCY_KEYS,
  levelOf,
  type CompetencyKey,
} from "@/data/competencies";
import {
  PATHWAYS,
  EMPLOYMENT_LABEL,
  type PathwayDef,
} from "@/data/pathways";
import { questions, resolveOption, type Answer } from "@/data/questions";
import { educationIdFromValue, type EducationOption } from "@/data/options";
import type { Participant } from "@/lib/gemini";

export type CompetencyScores = Record<CompetencyKey, number>;

const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));

/** শিক্ষাগত যোগ্যতা কারিগরি ও যৌক্তিক স্কোরে সামান্য প্রভাব ফেলে */
const EDUCATION_BONUS: Record<
  EducationOption["id"],
  Partial<Record<CompetencyKey, number>>
> = {
  none: {},
  primary: { logic: 2 },
  jsc: { logic: 4, technical: 2 },
  ssc: { logic: 7, technical: 5 },
  hsc: { logic: 10, technical: 7, communication: 3 },
  vocational: { technical: 14, logic: 6 },
  graduate: { logic: 13, communication: 8, technical: 6 },
};

/**
 * প্রতিটি দক্ষতার জন্য: অর্জিত পয়েন্ট ÷ সম্ভাব্য সর্বোচ্চ পয়েন্ট।
 * সর্বোচ্চ = প্রতিটি প্রশ্নে ঐ দক্ষতার সবচেয়ে বেশি স্কোরওয়ালা অপশন।
 */
export function scoreCompetencies(
  answers: Answer[],
  participant?: Pick<Participant, "education">,
): CompetencyScores {
  const earned = {} as CompetencyScores;
  const possible = {} as CompetencyScores;
  for (const k of COMPETENCY_KEYS) {
    earned[k] = 0;
    possible[k] = 0;
  }

  for (const q of questions) {
    for (const k of COMPETENCY_KEYS) {
      const best = Math.max(0, ...q.options.map((o) => o.scores[k] ?? 0));
      possible[k] += best;
    }
  }

  for (const a of answers) {
    const hit = resolveOption(a);
    if (!hit) continue;
    for (const k of COMPETENCY_KEYS) {
      earned[k] += hit.option.scores[k] ?? 0;
    }
  }

  const eduId = educationIdFromValue(participant?.education ?? "");
  const bonus = EDUCATION_BONUS[eduId] ?? {};

  const out = {} as CompetencyScores;
  for (const k of COMPETENCY_KEYS) {
    if (possible[k] === 0) {
      // বর্তমান প্রশ্নসেটে এই দক্ষতা যাচাই হয় না — নিরপেক্ষ ডিফল্ট, যাতে পাথওয়ে-ম্যাচিং না ভাঙে
      out[k] = clamp(50 + (bonus[k] ?? 0), 5, 100);
      continue;
    }
    const ratio = earned[k] / possible[k];
    out[k] = clamp(Math.round(ratio * 100 + (bonus[k] ?? 0)), 5, 100);
  }
  return out;
}

/** উত্তরগুলো বেতনভিত্তিক না আত্মকর্মসংস্থানের দিকে ঝুঁকছে (−1 … +1, ধনাত্মক = self) */
export function employmentLeaning(answers: Answer[]): number {
  let wage = 0;
  let self = 0;
  for (const a of answers) {
    const hit = resolveOption(a);
    if (hit?.option.leaning === "wage") wage++;
    if (hit?.option.leaning === "self") self++;
  }
  const total = wage + self;
  return total === 0 ? 0 : (self - wage) / total;
}

export interface ScoredPathway extends PathwayDef {
  match: number;
}

const DEMAND_NUDGE = { "very-high": 3, high: 1, growing: 0 } as const;

export function rankPathways(
  scores: CompetencyScores,
  leaning: number,
): ScoredPathway[] {
  return PATHWAYS.map((p) => {
    let weighted = 0;
    let totalWeight = 0;
    for (const k of COMPETENCY_KEYS) {
      const w = p.weights[k] ?? 0;
      weighted += w * scores[k];
      totalWeight += w;
    }
    const fit = totalWeight > 0 ? weighted / totalWeight : 0;

    // পাথওয়ের ধরন ও অংশগ্রহণকারীর ঝোঁক মিললে বোনাস, না মিললে জরিমানা
    const isSelfish = p.employment !== "wage";
    const leanBonus = (isSelfish ? leaning : -leaning) * 8;

    const match = clamp(
      Math.round(fit * 0.92 + leanBonus + DEMAND_NUDGE[p.demand]),
      32,
      99,
    );
    return { ...p, match };
  }).sort((a, b) => b.match - a.match || a.title.localeCompare(b.title));
}

export interface LearningPhase {
  phase: string;
  phaseBn: string;
  title: string;
  titleBn: string;
  items: string[];
}

export function buildLearningPath(top: PathwayDef): LearningPhase[] {
  return [
    {
      phase: "Phase 1 (Months 1–2)",
      phaseBn: "ধাপ ১ (মাস ১–২)",
      title: "Foundation Skills",
      titleBn: "ভিত্তি দক্ষতা",
      items: [
        "Soft skills & communication training",
        "Digital literacy basics",
        "Financial literacy & numeracy",
      ],
    },
    {
      phase: `Phase 2 (Months 3–${2 + top.trainingMonths})`,
      phaseBn: `ধাপ ২ (মাস ৩–${2 + top.trainingMonths})`,
      title: "Technical Training",
      titleBn: "কারিগরি প্রশিক্ষণ",
      items: [
        `${top.title} sector skills`,
        "Industry-Based Training (IBT)",
        "Informal apprenticeship placement",
      ],
    },
    {
      phase: `Phase 3 (Months ${3 + top.trainingMonths}+)`,
      phaseBn: `ধাপ ৩ (মাস ${3 + top.trainingMonths}+)`,
      title: "Employment & Enterprise",
      titleBn: "কর্মসংস্থান ও উদ্যোগ",
      items: [
        top.employment === "wage"
          ? "Job placement support"
          : "Enterprise setup support",
        "Business development support",
        "Youth Challenge Fund application",
      ],
    },
  ];
}

/** AI ছাড়াই একটি সম্পূর্ণ, পড়ার-উপযোগী বাংলা ন্যারেটিভ */
export function buildNarrative(
  participant: Participant,
  scores: CompetencyScores,
  ranked: ScoredPathway[],
) {
  const sorted = [...COMPETENCIES].sort(
    (a, b) => scores[b.key] - scores[a.key],
  );
  const top3 = sorted.slice(0, 3);
  const weakest = sorted[sorted.length - 1];
  const best = ranked[0];

  const strengths = top3.map(
    (c) => `${c.bn} — ${levelOf(scores[c.key]) === "High" ? "শক্তিশালী" : "ভালো"}`,
  );

  const summary =
    `${participant.name}, তোমার উত্তরগুলো বলছে তোমার সবচেয়ে বড় শক্তি ${top3[0].bn}` +
    ` ও ${top3[1].bn}। এই দুটো দক্ষতা "${best.titleBn}" কাজের সাথে ভালোভাবে মিলে যায়।` +
    ` ${weakest.bn} নিয়ে আরেকটু কাজ করলে তোমার সুযোগ আরও বাড়বে।`;

  const nextSteps = [
    `${best.titleBn} খাতে ৩–${best.trainingMonths} মাসের প্রশিক্ষণে ভর্তি হও।`,
    `${weakest.bn} বাড়ানোর জন্য JAGORON-এর সফট স্কিল সেশনে অংশ নাও।`,
    best.employment === "wage"
      ? "স্থানীয় নিয়োগদাতাদের সাথে জব প্লেসমেন্ট সাপোর্টে যোগাযোগ করো।"
      : "Youth Challenge Fund-এ ছোট মূলধনের জন্য আবেদন করো।",
  ];

  return {
    headline: `${best.titleBn}-এর জন্য প্রস্তুত`,
    summary,
    strengths,
    nextSteps,
    pathway: (best.employment === "wage" ? "wage" : "self") as "wage" | "self",
    pathwayLabel: EMPLOYMENT_LABEL[best.employment].bn,
    sectors: ranked.slice(0, 3).map((p) => p.titleBn),
  };
}
