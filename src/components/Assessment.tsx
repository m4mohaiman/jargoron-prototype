import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { questions, TAGS, type Answer, type QuestionOption } from "@/data/questions";
import { SpeakButton } from "@/components/ui/speak-button";
import { speak, stopSpeaking } from "@/lib/speech";
import { cn } from "@/lib/utils";

export type { Answer };

export function Assessment({
  onComplete,
}: {
  onComplete: (answers: Answer[]) => void;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [speakingOption, setSpeakingOption] = useState<string | null>(null);

  const q = questions[step];
  const tag = TAGS[q.tag];
  /** মূল "শুনুন" বাটন — ক্যাটাগরি, প্রশ্ন পড়ে শোনায়, তারপর অপশনগুলো নাম্বার ধরে আলাদা করে শোনার আমন্ত্রণ জানায় */
  const narration = [
    tag.label,
    q.prompt,
    q.helper,
    `এই প্রশ্নে ${q.options.length}টা অপশন আছে। প্রতিটা আলাদা করে শুনতে নাম্বারে ক্লিক করো: ${q.options
      .map((_, i) => i + 1)
      .join(", ")}`,
  ]
    .filter(Boolean)
    .join("। ");

  function speakOption(option: QuestionOption, index: number) {
    if (speakingOption === option.id) {
      stopSpeaking();
      setSpeakingOption(null);
      return;
    }
    speak(`প্রশ্ন: ${q.prompt}। অপশন ${index + 1}: ${option.label}`, {
      onStart: () => setSpeakingOption(option.id),
      onEnd: () => setSpeakingOption(null),
    });
  }

  function choose(option: QuestionOption) {
    stopSpeaking();
    setSpeakingOption(null);
    setSelected(option.id);
    const next = [...answers];
    next[step] = {
      questionId: q.id,
      question: q.prompt,
      optionId: option.id,
      answer: option.label,
    };
    setAnswers(next);

    window.setTimeout(() => {
      if (step + 1 < questions.length) {
        setStep(step + 1);
        setSelected(null);
      } else {
        onComplete(next);
      }
    }, 260);
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-10 sm:py-16">
        <div className="mb-8 flex items-center gap-4">
          {step > 0 ? (
            <button
              onClick={() => {
                stopSpeaking();
                setSpeakingOption(null);
                setStep(step - 1);
                setSelected(null);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-paper-dim"
              aria-label="আগের প্রশ্ন"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          ) : (
            <div className="h-8 w-8" />
          )}
          {/* গেমের মতো মাইলস্টোন ট্রেইল — কোন প্রশ্ন শেষ হয়েছে তা এক নজরে দেখায় */}
          <div className="flex flex-1 items-center gap-1.5">
            {questions.map((qq, i) => (
              <span
                key={qq.id}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors duration-300",
                  i < step
                    ? "bg-forest"
                    : i === step
                      ? "bg-dawn"
                      : "bg-paper-dim",
                )}
              />
            ))}
          </div>
          <span className="font-sans text-sm font-medium text-ink-soft">
            {step + 1}/{questions.length}
          </span>
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-xs font-semibold"
              style={{ backgroundColor: `${tag.color}1a`, color: tag.color }}
            >
              <tag.icon className="h-3.5 w-3.5" />
              {tag.label}
            </span>
            <h2 className="mt-4 font-display text-2xl font-semibold leading-[1.5] text-ink sm:text-[1.75rem]">
              {q.prompt}
            </h2>
            {q.helper && (
              <p className="mt-4 border-l-2 border-forest/40 pl-3 text-sm leading-relaxed text-ink-soft">
                {q.helper}
              </p>
            )}
          </div>
          <SpeakButton text={narration} className="mt-1 shrink-0" />
        </div>

        <div className="mt-9 grid gap-4 sm:grid-cols-2">
          {q.options.map((opt, i) => {
            const Icon = opt.icon;
            const isSelected = selected === opt.id;
            const isSpeaking = speakingOption === opt.id;
            return (
              <div key={opt.id} className="relative">
                <button
                  onClick={() => choose(opt)}
                  className={cn(
                    "flex h-full min-h-[176px] w-full flex-col items-center justify-center gap-3 rounded-2xl border px-5 py-6 text-center transition-all",
                    isSelected
                      ? "scale-[1.02] border-forest bg-forest text-paper shadow-md"
                      : "border-line bg-paper-dim hover:border-forest/50 hover:bg-paper"
                  )}
                >
                  {isSelected && (
                    <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-dawn text-forest-dark">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                  )}
                  <span
                    className={cn(
                      "flex h-16 w-16 shrink-0 items-center justify-center rounded-full",
                      isSelected ? "bg-paper/15" : "bg-paper-dim"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-8 w-8",
                        isSelected ? "text-paper" : "text-forest"
                      )}
                    />
                  </span>
                  <span className="font-sans text-[15px] font-medium leading-[1.55]">
                    {opt.label}
                  </span>
                </button>

                {/* নাম্বার দিয়ে আলাদাভাবে এই অপশনটা শোনার বাটন — নিম্ন-সাক্ষর ইউজারদের জন্য */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakOption(opt, i);
                  }}
                  className={cn(
                    "absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border font-sans text-xs font-bold transition-colors",
                    isSpeaking
                      ? "border-dawn bg-dawn text-forest-dark"
                      : isSelected
                        ? "border-paper/40 bg-paper/15 text-paper hover:bg-paper/25"
                        : "border-line bg-paper-dim text-ink-soft hover:border-forest/50 hover:text-forest"
                  )}
                  aria-label={`অপশন ${i + 1} শুনুন`}
                >
                  {i + 1}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
