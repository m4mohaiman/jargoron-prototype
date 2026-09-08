/**
 * ব্রাউজারের Web Speech API দিয়ে বাংলা টেক্সট-টু-স্পিচ — কোনো সার্ভার বা অডিও ফাইল
 * ছাড়াই কাজ করে, তাই নিম্ন/অ-সাক্ষর ও দৃষ্টি-প্রতিবন্ধী ইউজারদের জন্য প্রশ্ন ও নির্দেশনা
 * শুনে বোঝার সুযোগ দেয়। ব্রাউজার সাপোর্ট না থাকলে সংশ্লিষ্ট বাটন নিজে থেকেই লুকিয়ে যায়।
 */

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

let bnVoice: SpeechSynthesisVoice | null = null;

function pickBanglaVoice() {
  const voices = window.speechSynthesis.getVoices();
  bnVoice = voices.find((v) => v.lang?.toLowerCase().startsWith("bn")) ?? null;
}

if (isSpeechSupported()) {
  pickBanglaVoice();
  window.speechSynthesis.onvoiceschanged = pickBanglaVoice;
}

export function speak(
  text: string,
  handlers?: { onStart?: () => void; onEnd?: () => void },
) {
  if (!isSpeechSupported() || !text.trim()) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "bn-BD";
  if (bnVoice) utterance.voice = bnVoice;
  utterance.rate = 0.92;
  utterance.onstart = () => handlers?.onStart?.();
  utterance.onend = () => handlers?.onEnd?.();
  utterance.onerror = () => handlers?.onEnd?.();
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (isSpeechSupported()) window.speechSynthesis.cancel();
}
