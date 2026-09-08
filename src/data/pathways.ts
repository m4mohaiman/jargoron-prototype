import type { CompetencyKey } from "@/data/competencies";

export type EmploymentType = "wage" | "self" | "enterprise";
export type DemandLevel = "very-high" | "high" | "growing";

export interface PathwayDef {
  id: string;
  sector: string;
  sectorBn: string;
  title: string;
  titleBn: string;
  description: string;
  employment: EmploymentType;
  demand: DemandLevel;
  incomeMin: number;
  incomeMax: number;
  /** সাধারণ প্রশিক্ষণকাল (মাস) */
  trainingMonths: number;
  /** কোন দক্ষতা এই পাথওয়ের জন্য কতটা জরুরি (0–1) */
  weights: Partial<Record<CompetencyKey, number>>;
}

export const EMPLOYMENT_LABEL: Record<EmploymentType, { en: string; bn: string }> = {
  wage: { en: "Wage Employment", bn: "বেতনভিত্তিক কর্মসংস্থান" },
  self: { en: "Self-Employment", bn: "আত্মকর্মসংস্থান" },
  enterprise: { en: "Entrepreneurship", bn: "উদ্যোক্তা" },
};

export const DEMAND_LABEL: Record<DemandLevel, { en: string; bn: string }> = {
  "very-high": { en: "Very High demand", bn: "অত্যন্ত উচ্চ চাহিদা" },
  high: { en: "High demand", bn: "উচ্চ চাহিদা" },
  growing: { en: "Growing demand", bn: "বাড়ন্ত চাহিদা" },
};

export const PATHWAYS: PathwayDef[] = [
  {
    id: "garments",
    sector: "Manufacturing",
    sectorBn: "উৎপাদন",
    title: "Garments & Textile Production",
    titleBn: "গার্মেন্টস ও টেক্সটাইল উৎপাদন",
    description:
      "Machine operation, quality checking and line work in ready-made garments. The largest formal employer of young women in both project districts.",
    employment: "wage",
    demand: "very-high",
    incomeMin: 8000,
    incomeMax: 18000,
    trainingMonths: 3,
    weights: { technical: 1, resilience: 0.9, logic: 0.5, motivation: 0.6, communication: 0.3 },
  },
  {
    id: "agri",
    sector: "Agriculture",
    sectorBn: "কৃষি",
    title: "Green Agriculture & Food Processing",
    titleBn: "সবুজ কৃষি ও খাদ্য প্রক্রিয়াজাতকরণ",
    description:
      "Climate-adapted cultivation, post-harvest handling and small-scale food processing, run as an own-account enterprise.",
    employment: "self",
    demand: "high",
    incomeMin: 9000,
    incomeMax: 20000,
    trainingMonths: 4,
    weights: { resilience: 1, technical: 0.7, entrepreneurial: 0.7, motivation: 0.6, logic: 0.4 },
  },
  {
    id: "freelancing",
    sector: "Technology",
    sectorBn: "প্রযুক্তি",
    title: "Freelancing & Digital Services",
    titleBn: "ফ্রিল্যান্সিং ও ডিজিটাল সেবা",
    description:
      "Remote digital work sold to domestic and overseas clients. Highest income ceiling of the nine, and the longest runway to a first payment.",
    employment: "self",
    demand: "very-high",
    incomeMin: 12000,
    incomeMax: 40000,
    trainingMonths: 6,
    weights: { logic: 1, technical: 0.9, motivation: 0.9, entrepreneurial: 0.6, communication: 0.5 },
  },
  {
    id: "retail",
    sector: "Business",
    sectorBn: "ব্যবসা",
    title: "Small Trade & Retail Entrepreneurship",
    titleBn: "ক্ষুদ্র ব্যবসা ও খুচরা উদ্যোগ",
    description:
      "Running a small shop or trading enterprise: stock, pricing, cash handling and customer trust.",
    employment: "enterprise",
    demand: "high",
    incomeMin: 10000,
    incomeMax: 30000,
    trainingMonths: 3,
    weights: { entrepreneurial: 1, communication: 0.8, logic: 0.6, motivation: 0.7, resilience: 0.6 },
  },
  {
    id: "health",
    sector: "Health & Social Services",
    sectorBn: "স্বাস্থ্য ও সমাজসেবা",
    title: "Community Health & Care Worker",
    titleBn: "কমিউনিটি স্বাস্থ্য ও সেবাকর্মী",
    description:
      "Frontline health outreach, patient support and community care under a duty-of-care standard.",
    employment: "wage",
    demand: "growing",
    incomeMin: 8500,
    incomeMax: 15000,
    trainingMonths: 5,
    weights: { communication: 1, resilience: 0.8, motivation: 0.7, logic: 0.5, technical: 0.4 },
  },
  {
    id: "construction",
    sector: "Construction",
    sectorBn: "নির্মাণ",
    title: "Construction & Green Building Trades",
    titleBn: "নির্মাণ ও সবুজ ভবন কারিগরি",
    description:
      "Skilled site trades including electrical, plumbing and energy-efficient building methods.",
    employment: "wage",
    demand: "very-high",
    incomeMin: 10000,
    incomeMax: 22000,
    trainingMonths: 4,
    weights: { technical: 1, resilience: 1, motivation: 0.6, logic: 0.4, communication: 0.2 },
  },
  {
    id: "livestock",
    sector: "Agriculture",
    sectorBn: "কৃষি",
    title: "Livestock & Poultry Farming",
    titleBn: "পশুসম্পদ ও পোলট্রি খামার",
    description:
      "Rearing, feed management, disease prevention and market sale, operated as a household enterprise.",
    employment: "self",
    demand: "high",
    incomeMin: 8000,
    incomeMax: 18000,
    trainingMonths: 3,
    weights: { resilience: 1, entrepreneurial: 0.8, technical: 0.6, motivation: 0.6, logic: 0.3 },
  },
  {
    id: "hospitality",
    sector: "Hospitality",
    sectorBn: "আতিথেয়তা",
    title: "Tourism, Hospitality & Food Services",
    titleBn: "পর্যটন, আতিথেয়তা ও খাদ্যসেবা",
    description:
      "Guest service, kitchen and front-of-house roles where reliability and customer trust decide progression.",
    employment: "wage",
    demand: "growing",
    incomeMin: 9000,
    incomeMax: 18000,
    trainingMonths: 3,
    weights: { communication: 1, resilience: 0.7, technical: 0.5, motivation: 0.6, entrepreneurial: 0.4 },
  },
  {
    id: "social",
    sector: "Social Sector",
    sectorBn: "সামাজিক খাত",
    title: "Social Enterprise & Youth Leadership",
    titleBn: "সামাজিক উদ্যোগ ও যুব নেতৃত্ব",
    description:
      "Community-facing ventures and youth organising, where convening people is the core competency.",
    employment: "enterprise",
    demand: "growing",
    incomeMin: 10000,
    incomeMax: 28000,
    trainingMonths: 6,
    weights: { communication: 1, entrepreneurial: 0.9, motivation: 0.9, logic: 0.6, resilience: 0.6 },
  },
];

export function getPathway(id: string): PathwayDef | undefined {
  return PATHWAYS.find((p) => p.id === id);
}

export function formatIncome(min: number, max: number): string {
  const f = (n: number) => n.toLocaleString("en-US");
  return `৳${f(min)}–৳${f(max)}/month`;
}
