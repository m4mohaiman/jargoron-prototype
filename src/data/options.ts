/**
 * Intake ফর্মের ড্রপডাউন অপশন। প্রতিটি অপশনের value দ্বিভাষিক
 * ("English / বাংলা") — যাতে Results পেজে সরাসরি দেখানো যায়।
 */
export interface BilingualOption {
  value: string;
  en: string;
  bn: string;
}

function opt(en: string, bn: string): BilingualOption {
  return { value: `${en} / ${bn}`, en, bn };
}

export const GENDERS: BilingualOption[] = [
  opt("Female", "নারী"),
  opt("Male", "পুরুষ"),
  opt("Other", "অন্যান্য"),
  opt("Prefer not to say", "বলতে চাই না"),
];

/** JAGORON প্রকল্পের ভৌগোলিক পরিধি অনুযায়ী শুধু এই দুই জেলা */
export const DISTRICTS: BilingualOption[] = [
  opt("Khulna", "খুলনা"),
  opt("Gazipur", "গাজীপুর"),
];

export const DISABILITY_STATUS: BilingualOption[] = [
  opt("No disability", "প্রতিবন্ধিতা নেই"),
  opt("Physical disability", "শারীরিক প্রতিবন্ধিতা"),
  opt("Visual impairment", "দৃষ্টি প্রতিবন্ধিতা"),
  opt("Hearing impairment", "শ্রবণ প্রতিবন্ধিতা"),
  opt("Speech difficulty", "বাক প্রতিবন্ধিতা"),
  opt("Intellectual disability", "বুদ্ধি প্রতিবন্ধিতা"),
  opt("Prefer not to say", "বলতে চাই না"),
];

/** id দিয়ে স্কোরিং-এ ব্যবহৃত হয়, তাই আলাদা key রাখা হয়েছে */
export interface EducationOption extends BilingualOption {
  id: "none" | "primary" | "jsc" | "ssc" | "hsc" | "vocational" | "graduate";
}

export const EDUCATION_LEVELS: EducationOption[] = [
  { id: "none", ...opt("No formal education", "কোনো প্রাতিষ্ঠানিক শিক্ষা নেই") },
  { id: "primary", ...opt("Primary (Class 1–5)", "প্রাথমিক (১ম–৫ম)") },
  { id: "jsc", ...opt("Class 6–8 (JSC)", "৬ষ্ঠ–৮ম (জেএসসি)") },
  { id: "ssc", ...opt("SSC / Class 10", "এসএসসি / দশম") },
  { id: "hsc", ...opt("HSC / Class 12", "এইচএসসি / দ্বাদশ") },
  { id: "vocational", ...opt("Vocational / Technical", "কারিগরি / ভোকেশনাল") },
  { id: "graduate", ...opt("Graduate or above", "স্নাতক বা তার বেশি") },
];

export function educationIdFromValue(value: string): EducationOption["id"] {
  return EDUCATION_LEVELS.find((e) => e.value === value)?.id ?? "none";
}
