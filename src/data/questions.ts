import type { LucideIcon } from "lucide-react";
import {
  Lightbulb,
  Flame,
  Users,
  Brain,
  Star,
  Sprout,
  HelpCircle,
  HandHeart,
  UserCog,
  ClipboardCheck,
  Wrench,
  Droplet,
  Sparkles,
  Landmark,
  Undo2,
  NotebookPen,
  Archive,
  XCircle,
  CarFront,
  MessageCircle,
  CalendarX,
  DoorOpen,
  Clock,
  Megaphone,
  Frown,
  CalendarClock,
  Layers,
  ArrowRightLeft,
  EyeOff,
} from "lucide-react";
import type { CompetencyKey } from "@/data/competencies";

/** প্রতিটি অপশন যে দক্ষতাগুলোকে কতটা নির্দেশ করে (0–1) */
export type OptionScores = Partial<Record<CompetencyKey, number>>;

export interface QuestionOption {
  id: string;
  label: string;
  icon: LucideIcon;
  scores: OptionScores;
  /** কাজের ধরনের ইঙ্গিত — পাথওয়ে ম্যাচিং-এ ব্যবহৃত */
  leaning?: "wage" | "self";
}

/** প্রতিটি প্রশ্নের ক্যাটাগরি ট্যাগ — প্রশ্নের উপরে রঙিন পিল হিসেবে দেখানো হয় */
export type TagId =
  | "entrepreneurial-thinking"
  | "confidence-resilience"
  | "leadership-teamwork"
  | "problem-decision"
  | "skill-interest"
  | "problem-solving";

export interface TagMeta {
  label: string;
  icon: LucideIcon;
  /** JAGORON-এর বিদ্যমান কম্পিটেন্সি প্যালেট থেকে নেওয়া রং — নতুন কোনো রং যোগ করা হয়নি */
  color: string;
}

export const TAGS: Record<TagId, TagMeta> = {
  "entrepreneurial-thinking": {
    label: "উদ্যোক্তা চিন্তাভাবনা",
    icon: Lightbulb,
    color: "#d4682b",
  },
  "confidence-resilience": {
    label: "আত্মবিশ্বাস ও মানসিক শক্তি",
    icon: Flame,
    color: "#3f9e4a",
  },
  "leadership-teamwork": {
    label: "নেতৃত্ব ও দলগত কাজ",
    icon: Users,
    color: "#1e3a6b",
  },
  "problem-decision": {
    label: "সমস্যা সমাধান ও সিদ্ধান্ত গ্রহণ",
    icon: Brain,
    color: "#2f7d9e",
  },
  "skill-interest": {
    label: "দক্ষতা ও আগ্রহ",
    icon: Star,
    color: "#7b4fd4",
  },
  "problem-solving": {
    label: "সমস্যা সমাধান",
    icon: Sprout,
    color: "#2f9e8f",
  },
};

export interface Question {
  id: string;
  tag: TagId;
  prompt: string;
  /** ছোট, সরলভাবে আবার বলা প্রশ্ন — প্রম্পটের নিচে বক্সে দেখানো হয় (ঐচ্ছিক) */
  helper?: string;
  options: QuestionOption[];
}

/**
 * ১০টা প্রশ্ন দুই সোর্স থেকে মেশানো:
 *  ১) স্ক্রিনশট থেকে হুবহু তোলা ৬টা ট্যাগড প্রশ্ন — difficult-task, business-idea,
 *     team-role, garments-mistake, satisfying-work, slow-vegetables। এগুলোর
 *     option scores নিজে বিচার করে বসানো (স্ক্রিনশটে সংখ্যাসূচক weight ছিল না)।
 *  ২) item_bank_answer_key.csv-এর Group 2 (SJT, "WIRED, real weighted scoring")
 *     থেকে বাকি ৪টা — training-cost, short-change, better-offer, blamed।
 *     ("team-member" scenario বাদ দেওয়া হয়েছে কারণ team-role-এর সাথে একই
 *     নেতৃত্ব/দলগত-কাজ বিষয় নিয়ে, দুটো রাখলে পুনরাবৃত্তি হতো।)
 *     CSV-এর ৫-trait weight (technical_skills, ethical_conduct, leadership,
 *     motivation, resilience, স্কেল ০–৩) আমাদের ৬-trait মডেলে এভাবে ম্যাপ করা:
 *       resilience      -> resilience (সরাসরি, ৩ দিয়ে ভাগ করে ০–১ স্কেলে)
 *       motivation      -> motivation (সরাসরি)
 *       leadership      -> entrepreneurial (৭০%) + communication (৩০%)
 *       ethical_conduct -> communication (৫০%) + resilience (৫০%)
 */
export const questions: Question[] = [
  {
    id: "difficult-task",
    tag: "confidence-resilience",
    prompt:
      "যখন আপনি এমন একটি কঠিন কাজের মুখোমুখি হন যা আগে কখনও করেননি, তখন আপনি সাধারণত কী করেন?",
    options: [
      {
        id: "self-step-by-step",
        label: "নিজে নিজে ধাপে ধাপে বুঝে নেওয়ার চেষ্টা করি",
        icon: ClipboardCheck,
        scores: { resilience: 0.9, logic: 0.6, motivation: 0.5 },
      },
      {
        id: "ask-experienced",
        label: "অভিজ্ঞ কারও কাছে সাহায্য ও পরামর্শ চাই",
        icon: HandHeart,
        scores: { communication: 0.9, logic: 0.5 },
      },
      {
        id: "watch-others-first",
        label: "প্রথমে দেখি অন্যরা কীভাবে করে, তারপর নিজে চেষ্টা করি",
        icon: HelpCircle,
        scores: { logic: 0.6, resilience: 0.4 },
      },
      {
        id: "keep-trying",
        label: "কাজটি সফল না হওয়া পর্যন্ত বিভিন্ন উপায়ে চেষ্টা করতে থাকি",
        icon: Flame,
        scores: { resilience: 1, motivation: 0.9 },
      },
    ],
  },
  {
    id: "training-cost",
    tag: "confidence-resilience",
    prompt: "প্রশিক্ষণে যাওয়া-আসার খরচ তোমার জন্য বেশি মনে হচ্ছে। তুমি কী করবে?",
    helper: "বাধা এলে তুমি কীভাবে সামলাও",
    options: [
      {
        id: "share-transport",
        label:
          "একই এলাকার আরও কয়েকজনকে খুঁজে বের করে ভ্যান বা অটো ভাগাভাগি করার ব্যবস্থা করব",
        icon: CarFront,
        scores: {
          resilience: 1,
          entrepreneurial: 0.7,
          communication: 0.3,
          motivation: 0.67,
        },
      },
      {
        id: "ask-trainer",
        label:
          "প্রশিক্ষকের সাথে কথা বলে দেখব কোনো সহায়তা বা সময় বদলানো যায় কিনা",
        icon: MessageCircle,
        scores: {
          resilience: 0.83,
          entrepreneurial: 0.23,
          communication: 0.1,
          motivation: 0.83,
        },
      },
      {
        id: "attend-partial",
        label: "সপ্তাহে দুই দিন যাব, বাকি দিনগুলো বাদ দেব",
        icon: CalendarX,
        scores: { resilience: 0.33, motivation: 0.33 },
      },
      {
        id: "drop-training",
        label: "প্রশিক্ষণটা ছেড়ে দেব",
        icon: DoorOpen,
        scores: {},
      },
    ],
  },
  {
    id: "blamed",
    tag: "confidence-resilience",
    prompt: "কাজের জায়গায় অন্য কারো ভুলের জন্য তোমাকে দোষ দেওয়া হলো। তুমি কী করবে?",
    helper: "চাপের মুখে তোমার আচরণ",
    options: [
      {
        id: "calm-later",
        label:
          "তখন চুপ থাকব; কাজ শেষে আলাদাভাবে সুপারভাইজারকে শান্তভাবে পুরো ঘটনাটা বলব",
        icon: Clock,
        scores: { resilience: 1.33, communication: 0.53, entrepreneurial: 0.47 },
      },
      {
        id: "name-publicly",
        label: "সাথে সাথে সবার সামনে বলব এটা অন্য কেউ করেছে এবং নাম বলব",
        icon: Megaphone,
        scores: { resilience: 0.58, communication: 0.35, entrepreneurial: 0.23 },
      },
      {
        id: "accept-blame",
        label: "কিছুই বলব না, দোষটা মেনে নেব",
        icon: Frown,
        scores: { resilience: 0.41, communication: 0.08 },
      },
      {
        id: "walk-out",
        label: "রেগে গিয়ে কাজ ফেলে বেরিয়ে যাব",
        icon: Flame,
        scores: {},
      },
    ],
  },
  {
    id: "garments-mistake",
    tag: "problem-decision",
    prompt:
      "আপনি একটি গার্মেন্টস কারখানায় কাজ করছেন এবং লক্ষ্য করলেন যে সেলাইতে একটি ভুল হয়েছে, যা ৫০টি শার্টের গুণমানকে প্রভাবিত করতে পারে। আপনার সুপারভাইজার এখন উপস্থিত নেই। আপনি কী করবেন?",
    options: [
      {
        id: "stop-and-fix",
        label: "কাজ বন্ধ করে ভুলটি ঠিক করে তারপর আবার কাজ শুরু করব",
        icon: Wrench,
        scores: { technical: 0.9, resilience: 0.6, logic: 0.5 },
      },
      {
        id: "note-and-inform",
        label: "সমস্যাটি নোট করে সুপারভাইজারকে যত দ্রুত সম্ভব জানাব",
        icon: ClipboardCheck,
        scores: { communication: 0.8, logic: 0.6 },
      },
      {
        id: "consult-colleague",
        label: "একজন অভিজ্ঞ সহকর্মীর সাথে পরামর্শ করে একসাথে সিদ্ধান্ত নেব",
        icon: HandHeart,
        scores: { communication: 0.9, logic: 0.5 },
      },
      {
        id: "continue-and-report-later",
        label: "লক্ষ্য পূরণের জন্য কাজ চালিয়ে যাব এবং পরে জানাব",
        icon: HelpCircle,
        scores: { motivation: 0.3, logic: 0.1 },
      },
    ],
  },
  {
    id: "short-change",
    tag: "problem-decision",
    prompt: "একজন ক্রেতা ভুল করে বেশি টাকা দিয়ে চলে গেছেন। তুমি কী করবে?",
    helper: "সততা ও সিদ্ধান্তের প্রশ্ন — তোমার স্বাভাবিক প্রতিক্রিয়া বেছে নাও",
    options: [
      {
        id: "return-now",
        label:
          "দোকান বন্ধ করে হলেও তাঁকে খুঁজে টাকাটা ফেরত দেব, বা চেনা হলে ফোন করব",
        icon: Undo2,
        scores: { communication: 0.5, resilience: 0.5 },
      },
      {
        id: "note-ledger",
        label: "খাতায় লিখে রাখব, পরের বার এলে ফেরত দেব",
        icon: NotebookPen,
        scores: { communication: 0.42, resilience: 0.42 },
      },
      {
        id: "set-aside",
        label: "টাকাটা আলাদা করে রেখে দেব, কেউ চাইলে দেব",
        icon: Archive,
        scores: { communication: 0.17, resilience: 0.17 },
      },
      {
        id: "do-nothing",
        label: "কিছু করব না — ক্রেতারই গুনে নেওয়া উচিত ছিল",
        icon: XCircle,
        scores: {},
      },
    ],
  },
  {
    id: "satisfying-work",
    tag: "skill-interest",
    prompt: "কোন ধরনের কাজ করলে আপনি সবচেয়ে বেশি তৃপ্তি ও উৎসাহ অনুভব করেন?",
    helper: "কোন ধরনের কাজ আপনাকে সবচেয়ে বেশি সন্তুষ্ট এবং উদ্যমী করে তোলে?",
    options: [
      {
        id: "make-or-repair",
        label: "হাতে-কলমে কিছু তৈরি করা বা মেরামত করা",
        icon: Wrench,
        scores: { technical: 1, resilience: 0.5 },
      },
      {
        id: "help-or-care",
        label: "অন্য মানুষকে সাহায্য করা বা তাদের যত্ন নেওয়া",
        icon: HandHeart,
        scores: { communication: 1, resilience: 0.4 },
      },
      {
        id: "money-or-business",
        label: "টাকা-পয়সা ব্যবস্থাপনা, বিক্রয় করা, বা ছোট ব্যবসা চালানো",
        icon: Landmark,
        scores: { entrepreneurial: 1, logic: 0.5 },
      },
      {
        id: "create-new",
        label: "নতুন কিছু তৈরি করা — হস্তশিল্প, নকশা, খাবার, কনটেন্ট",
        icon: Sparkles,
        scores: { entrepreneurial: 0.7, technical: 0.6, logic: 0.4 },
      },
    ],
  },
  {
    id: "business-idea",
    tag: "entrepreneurial-thinking",
    prompt:
      "আপনার কাছে ৫,০০০ টাকা সঞ্চয় আছে। একজন প্রতিবেশী আপনাকে একটি ব্যবসার ধারণা দিলেন। আপনি কীভাবে প্রতিক্রিয়া জানাবেন?",
    helper:
      "আপনার কাছে ৫,০০০ টাকা সঞ্চয় আছে। একজন প্রতিবেশী আপনাকে একটি ব্যবসার ধারণা দিলেন। আপনি কী করবেন?",
    options: [
      {
        id: "research-first",
        label: "সিদ্ধান্ত নেওয়ার আগে অনেক প্রশ্ন করি এবং খোঁজখবর নিই",
        icon: HelpCircle,
        scores: { logic: 0.8, resilience: 0.4 },
      },
      {
        id: "test-small",
        label: "অল্প কিছু টাকা বিনিয়োগ করে আগে ধারণাটি পরীক্ষা করি",
        icon: Sparkles,
        scores: { entrepreneurial: 1, logic: 0.7, resilience: 0.3 },
        leaning: "self",
      },
      {
        id: "keep-safe",
        label: "সঞ্চয়ের টাকা নিরাপদে রাখি — ঝুঁকি বেশি",
        icon: ClipboardCheck,
        scores: { resilience: 0.5, entrepreneurial: 0.1 },
        leaning: "wage",
      },
      {
        id: "invest-all-on-trust",
        label: "মানুষটির উপর বিশ্বাস থাকলে সব টাকা বিনিয়োগ করি",
        icon: HandHeart,
        scores: { entrepreneurial: 0.6, motivation: 0.4, logic: 0.1 },
        leaning: "self",
      },
    ],
  },
  {
    id: "better-offer",
    tag: "entrepreneurial-thinking",
    prompt:
      "একজন ক্রেতাকে শুক্রবারের মধ্যে কাজ দেওয়ার কথা দিয়েছ। এর মধ্যে আরেকজন নতুন ক্রেতা ভালো দামে জরুরি কাজ দিতে চাইছেন। তুমি কী করবে?",
    helper: "প্রতিশ্রুতি ও সুযোগের মধ্যে ভারসাম্য",
    options: [
      {
        id: "keep-promise",
        label:
          "নতুন ক্রেতাকে বলব শুক্রবারের পরে করে দিতে পারব; আগের কথা রাখব",
        icon: CalendarClock,
        scores: {
          communication: 0.6,
          resilience: 0.5,
          motivation: 0.5,
          entrepreneurial: 0.23,
        },
      },
      {
        id: "take-both",
        label:
          "দুটোই নেব, সাহায্যের জন্য আরেকজনকে ডাকব, আর দুই ক্রেতাকেই আগেই জানিয়ে রাখব",
        icon: Layers,
        scores: {
          communication: 0.72,
          resilience: 0.42,
          motivation: 1,
          entrepreneurial: 0.7,
        },
      },
      {
        id: "delay-old",
        label: "নতুন কাজটা নেব, পুরোনো ক্রেতাকে বলব দেরি হবে",
        icon: ArrowRightLeft,
        scores: {
          communication: 0.13,
          resilience: 0.08,
          motivation: 0.67,
          entrepreneurial: 0.12,
        },
      },
      {
        id: "hide-old",
        label: "নতুন কাজটা নেব, পুরোনো ক্রেতাকে কিছু বলব না",
        icon: EyeOff,
        scores: { motivation: 0.33 },
      },
    ],
  },
  {
    id: "team-role",
    tag: "leadership-teamwork",
    prompt: "একটি দলীয় কাজে, আপনি সাধারণত কোন ভূমিকা নেন?",
    helper: "একটি দলীয় কাজে, আপনি সাধারণত কোন ভূমিকা নেন?",
    options: [
      {
        id: "lead",
        label:
          "নেতৃত্ব দিই — কাজগুলো সংগঠিত করি এবং সবাইকে সময়মতো কাজ করতে সাহায্য করি",
        icon: UserCog,
        scores: { entrepreneurial: 0.7, communication: 0.8, motivation: 0.6 },
      },
      {
        id: "collaborator",
        label:
          "সহযোগী হিসেবে কাজ করি — অন্যদের সাহায্য করি এবং নিশ্চিত করি সবাই যুক্ত আছে",
        icon: HandHeart,
        scores: { communication: 1, resilience: 0.4 },
      },
      {
        id: "problem-solver",
        label: "সমস্যা সমাধানকারী — সমস্যা দেখা দিলে তা সমাধানের দিকে মনোযোগ দিই",
        icon: Brain,
        scores: { logic: 0.9, technical: 0.4 },
      },
      {
        id: "creative-contributor",
        label: "সৃজনশীল — দলের জন্য নতুন ধারণা বা নতুন উপায় নিয়ে আসি",
        icon: Sparkles,
        scores: { entrepreneurial: 0.8, logic: 0.5 },
      },
    ],
  },
  {
    id: "slow-vegetables",
    tag: "problem-solving",
    prompt: "আপনি সবজি লাগিয়েছেন, কিন্তু সেগুলো ধীরে ধীরে বাড়ছে। আপনি কী করবেন?",
    helper: "আপনি সবজি লাগিয়েছেন, কিন্তু সেগুলো ধীরে ধীরে বাড়ছে। আপনি কী করবেন?",
    options: [
      {
        id: "ask-farmer",
        label: "একজন স্থানীয় কৃষক বা কৃষি সম্প্রসারণ কর্মকর্তার কাছে পরামর্শ নেব",
        icon: HandHeart,
        scores: { communication: 0.8, logic: 0.6 },
      },
      {
        id: "try-methods",
        label: "বিভিন্ন সার বা পানি দেওয়ার পদ্ধতি চেষ্টা করে দেখব কোনটি কাজ করে",
        icon: Droplet,
        scores: { logic: 0.9, technical: 0.7, resilience: 0.5 },
      },
      {
        id: "wait-and-observe",
        label: "আরও কিছু সময় দেব এবং ধৈর্য ধরে পর্যবেক্ষণ করব",
        icon: ClipboardCheck,
        scores: { resilience: 0.6, motivation: 0.3 },
      },
      {
        id: "learn-online",
        label: "অনলাইনে বা বই পড়ে উপযুক্ত পরিবেশ ও যত্নের বিষয়ে জানব",
        icon: HelpCircle,
        scores: { logic: 0.8, motivation: 0.6 },
      },
    ],
  },
];

/** অ্যাসেসমেন্টে দেওয়া একটি উত্তর */
export interface Answer {
  questionId: string;
  question: string;
  optionId: string;
  answer: string;
}

/** পুরনো (v1) সেভ করা উত্তরেও optionId ছিল না — label দেখে অপশনটা খুঁজে নেয় */
export function resolveOption(a: Answer) {
  const q = questions.find((x) => x.id === a.questionId);
  if (!q) {
    for (const question of questions) {
      const byLabel = question.options.find((o) => o.label === a.answer);
      if (byLabel) return { question, option: byLabel };
    }
    return null;
  }
  const option =
    q.options.find((o) => o.id === a.optionId) ??
    q.options.find((o) => o.label === a.answer);
  return option ? { question: q, option } : null;
}
