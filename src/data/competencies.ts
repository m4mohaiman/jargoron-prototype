export type CompetencyKey =
  | "logic"
  | "communication"
  | "technical"
  | "resilience"
  | "entrepreneurial"
  | "motivation";

export type CompetencyLevel = "High" | "Medium" | "Developing";

export interface CompetencyMeta {
  key: CompetencyKey;
  en: string;
  bn: string;
  /** বার-এর রং (Results পেজে ব্যবহৃত) */
  color: string;
}

export const COMPETENCIES: CompetencyMeta[] = [
  { key: "logic", en: "Logical Reasoning", bn: "যৌক্তিক বিশ্লেষণ", color: "#2f9e8f" },
  { key: "communication", en: "Communication", bn: "যোগাযোগ", color: "#1e3a6b" },
  { key: "technical", en: "Technical Skills", bn: "কারিগরি দক্ষতা", color: "#2f7d9e" },
  { key: "resilience", en: "Resilience", bn: "সহনশীলতা", color: "#3f9e4a" },
  { key: "entrepreneurial", en: "Entrepreneurial", bn: "উদ্যোক্তা মনোভাব", color: "#d4682b" },
  { key: "motivation", en: "Motivation", bn: "অনুপ্রেরণা", color: "#7b4fd4" },
];

export const COMPETENCY_KEYS = COMPETENCIES.map((c) => c.key);

export function levelOf(score: number): CompetencyLevel {
  if (score >= 70) return "High";
  if (score >= 45) return "Medium";
  return "Developing";
}

export const LEVEL_BN: Record<CompetencyLevel, string> = {
  High: "উচ্চ",
  Medium: "মাঝারি",
  Developing: "বিকাশমান",
};
