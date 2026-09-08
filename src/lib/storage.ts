import type { Answer } from "@/data/questions";
import type { Participant, ProfileResult } from "@/lib/gemini";

export interface SavedProfile {
  id: string;
  createdAt: string;
  /** যে ইউজার এই অ্যাসেসমেন্টটি নিয়েছে — "সাধারণ ইউজার" রোলের জন্য নিজের প্রোফাইল আলাদা করতে ব্যবহৃত */
  createdBy: string;
  participant: Participant;
  answers: Answer[];
  profile: ProfileResult;
}

const KEY = "jagoron-demo-profiles";

export function getProfiles(): SavedProfile[] {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as SavedProfile[];
    return parsed.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    return [];
  }
}

export function saveProfile(entry: SavedProfile) {
  const all = getProfiles();
  all.unshift(entry);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function getProfileById(id: string): SavedProfile | undefined {
  return getProfiles().find((p) => p.id === id);
}
