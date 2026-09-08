import {
  COMPETENCIES,
  COMPETENCY_KEYS,
  levelOf,
  type CompetencyKey,
  type CompetencyLevel,
} from "@/data/competencies";
import { EMPLOYMENT_LABEL, DEMAND_LABEL } from "@/data/pathways";
import type { Answer } from "@/data/questions";
import {
  scoreCompetencies,
  employmentLeaning,
  rankPathways,
  buildLearningPath,
  buildNarrative,
  type ScoredPathway,
  type LearningPhase,
  type CompetencyScores,
} from "@/lib/scoring";

export interface Participant {
  name: string;
  age: string;
  gender: string;
  district: string;
  disability: string;
  education: string;
}

export interface ScoredCompetency {
  key: CompetencyKey;
  en: string;
  bn: string;
  color: string;
  score: number;
  level: CompetencyLevel;
}

export interface ProfileResult {
  headline: string;
  summary: string;
  strengths: string[];
  pathway: "wage" | "self" | "mixed";
  pathwayLabel: string;
  sectors: string[];
  nextSteps: string[];
  competencies: ScoredCompetency[];
  pathways: ScoredPathway[];
  learningPath: LearningPhase[];
  /** প্রোফাইলটি AI দিয়ে তৈরি হয়েছে না স্থানীয় স্কোরিং দিয়ে */
  source: "ai" | "local";
}

/**
 * প্রথমটি প্রধান মডেল। ওভারলোড (503) বা রেট-লিমিট (429) হলে পরেরটিতে ফলব্যাক হয়।
 * তোমার অ্যাকাউন্টে যে মডেলগুলো available, সেগুলো দিয়ে এই লিস্ট এডিট করো।
 */
export const MODELS = [
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
];

/** প্রতি মডেলে সর্বোচ্চ কতবার রিট্রাই হবে */
const MAX_RETRIES_PER_MODEL = 2;
/** প্রথম রিট্রাইয়ের আগে অপেক্ষা (ms), এরপর দ্বিগুণ হতে থাকে */
const BASE_DELAY_MS = 800;
/** একটি রিকোয়েস্ট সর্বোচ্চ কতক্ষণ চলবে */
const REQUEST_TIMEOUT_MS = 40_000;

/** যেসব HTTP স্ট্যাটাসে রিট্রাই করা অর্থবহ */
const RETRYABLE = new Set([408, 429, 500, 502, 503, 504]);

class ApiError extends Error {
  status: number;
  retryAfterMs?: number;

  constructor(message: string, status: number, retryAfterMs?: number) {
    super(message);
    this.status = status;
    this.retryAfterMs = retryAfterMs;
  }
}

function getApiKey(): string | null {
  return import.meta.env.VITE_AI_API_KEY || null;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** exponential backoff + jitter — সব ক্লায়েন্ট যেন একই মুহূর্তে রিট্রাই না করে */
function backoffDelay(attempt: number): number {
  const exp = BASE_DELAY_MS * 2 ** attempt;
  return Math.round(exp * (0.75 + Math.random() * 0.5));
}

function parseRetryAfter(res: Response): number | undefined {
  const h = res.headers.get("retry-after");
  if (!h) return undefined;
  const secs = Number(h);
  if (Number.isFinite(secs)) return secs * 1000;
  const date = Date.parse(h);
  return Number.isFinite(date) ? Math.max(0, date - Date.now()) : undefined;
}

/** একটি মডেলে একবার কল — সফল হলে raw টেক্সট, নাহলে throw */
async function callModel(
  model: string,
  apiKey: string,
  prompt: string,
  signal?: AbortSignal,
): Promise<string> {
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const combined =
    signal && typeof AbortSignal.any === "function"
      ? AbortSignal.any([signal, timeout])
      : timeout;

  let res: Response;
  try {
    res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        signal: combined,
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.7,
          },
        }),
      },
    );
  } catch (e) {
    if (signal?.aborted) throw e; // ব্যবহারকারী নিজে বাতিল করেছে
    throw new ApiError(e instanceof Error ? e.message : "network error", 0);
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new ApiError(
      errText || res.statusText,
      res.status,
      parseRetryAfter(res),
    );
  }

  const data = await res.json();

  const blockReason = data?.promptFeedback?.blockReason;
  if (blockReason) {
    throw new Error(`safety block: ${blockReason}`);
  }

  const candidate = data?.candidates?.[0];
  const text: string | undefined = candidate?.content?.parts
    ?.map((p: { text?: string }) => p?.text ?? "")
    .join("");

  if (!text?.trim()) {
    throw new ApiError(
      `empty response (finishReason: ${candidate?.finishReason ?? "unknown"})`,
      500,
    );
  }

  return text;
}

/** মডেল কখনো markdown fence-এ মুড়ে দেয় — সেটা খুলে ফেলে */
function stripFences(text: string): string {
  const m = text.trim().match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return m ? m[1] : text.trim();
}

function asStringArray(v: unknown, fallback: string[]): string[] {
  if (Array.isArray(v)) {
    const out = v.filter(
      (x): x is string => typeof x === "string" && !!x.trim(),
    );
    if (out.length) return out;
  }
  return fallback;
}

function buildPrompt(
  participant: Participant,
  answers: Answer[],
  local: CompetencyScores,
  ranked: ScoredPathway[],
): string {
  const answersText = answers
    .map((a, i) => `${i + 1}. প্রশ্ন: ${a.question}\n   উত্তর: ${a.answer}`)
    .join("\n");

  const localText = COMPETENCIES.map(
    (c) => `- ${c.key} (${c.bn}): ${local[c.key]}`,
  ).join("\n");

  const topText = ranked
    .slice(0, 3)
    .map((p) => `- ${p.titleBn} (${p.title}) — ম্যাচ ${p.match}%`)
    .join("\n");

  return `তুমি JAGORON প্রকল্পের একজন যুব দক্ষতা মূল্যায়নকারী (youth aptitude assessor)। ভাষা হবে সহজ বাংলা, কোনো একাডেমিক জার্গন ছাড়া — এই ব্যবহারকারীর শিক্ষাগত যোগ্যতা কম হতে পারে। "summary"-তে অংশগ্রহণকারীর নাম ধরে সম্বোধন করো।

অংশগ্রহণকারী:
- নাম: ${participant.name}
- বয়স: ${participant.age}
- লিঙ্গ: ${participant.gender}
- জেলা: ${participant.district}
- প্রতিবন্ধিতা: ${participant.disability}
- সর্বোচ্চ শিক্ষা: ${participant.education}

উত্তরসমূহ:
${answersText}

আমাদের নিয়মভিত্তিক স্কোরিং (০–১০০) বলছে:
${localText}

সবচেয়ে মানানসই পাথওয়ে:
${topText}

তোমার কাজ: উপরের স্কোরগুলো পর্যালোচনা করো এবং উত্তরের ভিত্তিতে দরকার হলে সামান্য সংশোধন করো (সর্বোচ্চ ১৫ পয়েন্ট কম-বেশি)। তারপর একটি উৎসাহব্যঞ্জক, বাস্তবসম্মত ন্যারেটিভ লেখো।

শুধু নিচের JSON ফরম্যাটে উত্তর দাও, অন্য কোনো টেক্সট ছাড়া:
{
  "competencies": { "logic": 0-100, "communication": 0-100, "technical": 0-100, "resilience": 0-100, "entrepreneurial": 0-100, "motivation": 0-100 },
  "headline": "একটি ছোট, ব্যক্তিগত শিরোনাম (৪-৬ শব্দ, বাংলায়)",
  "summary": "২-৩ বাক্যের সহজ সারাংশ, অংশগ্রহণকারীর নাম ধরে সম্বোধন করে",
  "strengths": ["৩টি নির্দিষ্ট শক্তি/দক্ষতা, প্রতিটি ৩-৫ শব্দে"],
  "nextSteps": ["৩টি বাস্তবসম্মত পরবর্তী পদক্ষেপ, প্রতিটি এক লাইনে"]
}`;
}

/** নিয়মভিত্তিক স্কোর + (থাকলে) AI-এর সংশোধন মিলিয়ে চূড়ান্ত প্রোফাইল */
function assemble(
  participant: Participant,
  answers: Answer[],
  ai: Record<string, unknown> | null,
): ProfileResult {
  const local = scoreCompetencies(answers, participant);

  const merged = {} as CompetencyScores;
  const aiScores = (ai?.competencies ?? null) as Record<string, unknown> | null;
  for (const k of COMPETENCY_KEYS) {
    const raw = Number(aiScores?.[k]);
    // AI স্কোর ৬০/৪০ অনুপাতে মেশানো হয়, তবে নিয়মভিত্তিক মান থেকে ±১৫-এর বেশি নয়
    if (Number.isFinite(raw) && raw >= 0 && raw <= 100) {
      const blended = Math.round(local[k] * 0.6 + raw * 0.4);
      merged[k] = Math.max(local[k] - 15, Math.min(local[k] + 15, blended));
    } else {
      merged[k] = local[k];
    }
  }

  const leaning = employmentLeaning(answers);
  const ranked = rankPathways(merged, leaning);
  const fallback = buildNarrative(participant, merged, ranked);

  const competencies: ScoredCompetency[] = COMPETENCIES.map((c) => ({
    key: c.key,
    en: c.en,
    bn: c.bn,
    color: c.color,
    score: merged[c.key],
    level: levelOf(merged[c.key]),
  }));

  const headline =
    typeof ai?.headline === "string" && ai.headline.trim()
      ? (ai.headline as string)
      : fallback.headline;
  const summary =
    typeof ai?.summary === "string" && ai.summary.trim()
      ? (ai.summary as string)
      : fallback.summary;

  return {
    headline,
    summary,
    strengths: asStringArray(ai?.strengths, fallback.strengths),
    pathway: fallback.pathway,
    pathwayLabel: fallback.pathwayLabel,
    sectors: fallback.sectors,
    nextSteps: asStringArray(ai?.nextSteps, fallback.nextSteps),
    competencies,
    pathways: ranked,
    learningPath: buildLearningPath(ranked[0]),
    source: ai ? "ai" : "local",
  };
}

/** AI ছাড়াই সম্পূর্ণ প্রোফাইল — নেটওয়ার্ক বা key না থাকলেও ডেমো চলবে */
export function buildLocalProfile(
  participant: Participant,
  answers: Answer[],
): ProfileResult {
  return assemble(participant, answers, null);
}

export interface GenerateOptions {
  /** রিট্রাই হলে UI-তে "আবার চেষ্টা করা হচ্ছে..." দেখাতে */
  onRetry?: (info: { attempt: number; model: string; waitMs: number }) => void;
  /** ব্যবহারকারী পেজ ছেড়ে গেলে রিকোয়েস্ট বাতিল করতে */
  signal?: AbortSignal;
  /**
   * true (ডিফল্ট) হলে সব মডেল ব্যর্থ হলেও স্থানীয় স্কোরিং দিয়ে প্রোফাইল ফেরত আসে।
   * false দিলে আগের মতো error throw করবে।
   */
  fallbackToLocal?: boolean;
}

export async function generateProfile(
  participant: Participant,
  answers: Answer[],
  options: GenerateOptions = {},
): Promise<ProfileResult> {
  const { fallbackToLocal = true } = options;
  const apiKey = getApiKey();

  if (!apiKey) {
    if (fallbackToLocal) return buildLocalProfile(participant, answers);
    throw new Error(
      "AI API key সেট করা নেই। প্রজেক্ট রুটে .env ফাইলে VITE_AI_API_KEY বসাও, তারপর ডেভ সার্ভার রিস্টার্ট করো।",
    );
  }

  const local = scoreCompetencies(answers, participant);
  const ranked = rankPathways(local, employmentLeaning(answers));
  const prompt = buildPrompt(participant, answers, local, ranked);

  let lastError: unknown;

  for (const model of MODELS) {
    for (let attempt = 0; attempt <= MAX_RETRIES_PER_MODEL; attempt++) {
      try {
        const text = await callModel(model, apiKey, prompt, options.signal);
        let parsed: unknown;
        try {
          parsed = JSON.parse(stripFences(text));
        } catch {
          throw new ApiError("malformed JSON from model", 500);
        }
        return assemble(
          participant,
          answers,
          parsed as Record<string, unknown>,
        );
      } catch (e) {
        lastError = e;

        if (options.signal?.aborted) throw e;
        if (!(e instanceof ApiError)) break; // safety block ইত্যাদি — পরের মডেলে যাও

        // ভুল বা অনুপলব্ধ মডেল → রিট্রাই নয়, সরাসরি পরের মডেলে
        if (e.status === 400 || e.status === 404) break;

        // key/permission সমস্যা → বাকিগুলো চেষ্টা করে লাভ নেই
        if (e.status === 401 || e.status === 403) {
          if (fallbackToLocal) return buildLocalProfile(participant, answers);
          throw new Error(
            "AI API key কাজ করছে না (অনুমতি নেই বা মেয়াদ শেষ)। .env ফাইলের VITE_AI_API_KEY চেক করো।",
          );
        }

        if (e.status !== 0 && !RETRYABLE.has(e.status)) break;
        if (attempt === MAX_RETRIES_PER_MODEL) break;

        const waitMs = e.retryAfterMs ?? backoffDelay(attempt);
        options.onRetry?.({ attempt: attempt + 1, model, waitMs });
        await sleep(waitMs);
      }
    }
  }

  if (fallbackToLocal) return buildLocalProfile(participant, answers);

  const status = lastError instanceof ApiError ? lastError.status : undefined;
  if (status === 503 || status === 429) {
    throw new Error(
      "AI সেবাটিতে এখন অনেক চাপ পড়েছে। কয়েক মিনিট পর আবার চেষ্টা করো — তোমার উত্তরগুলো হারায়নি।",
    );
  }
  throw new Error(
    `AI প্রোফাইল তৈরি করা যায়নি। একটু পরে আবার চেষ্টা করো।${
      status ? ` (কোড: ${status})` : ""
    }`,
  );
}

export { EMPLOYMENT_LABEL, DEMAND_LABEL };
