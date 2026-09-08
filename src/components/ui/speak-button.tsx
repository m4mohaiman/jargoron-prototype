import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { isSpeechSupported, speak, stopSpeaking } from "@/lib/speech";

/** নিম্ন/অ-সাক্ষর ইউজারদের জন্য — টেক্সট শুনে বোঝার বাটন (Web Speech API সাপোর্ট না থাকলে কিছুই রেন্ডার করে না) */
export function SpeakButton({
  text,
  label = "শুনুন",
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [supported] = useState(isSpeechSupported);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => () => stopSpeaking(), []);

  if (!supported) return null;

  function toggle(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    speak(text, {
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-paper-dim px-3 py-1.5 font-sans text-xs font-semibold text-forest transition-colors hover:bg-paper-dim",
        speaking && "border-forest bg-forest/10",
        className,
      )}
      aria-label={speaking ? "থামাও" : label}
    >
      {speaking ? (
        <VolumeX className="h-3.5 w-3.5" />
      ) : (
        <Volume2 className="h-3.5 w-3.5" />
      )}
      {speaking ? "থামাও" : label}
    </button>
  );
}
