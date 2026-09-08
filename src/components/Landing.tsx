import { ArrowRight, Sparkles, Compass, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen bg-paper">
      {/* hero */}
      <div className="relative overflow-hidden border-b border-line">
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
          style={{
            background:
              "linear-gradient(to top, rgba(224,167,46,0.16), transparent)",
          }}
        />
        <div className="mx-auto max-w-3xl px-6 pb-20 pt-16 sm:pt-24">
          <p className="font-sans text-xs font-semibold uppercase tracking-wide text-forest">
            JAGORON &middot; AI Aptitude Demo
          </p>
          <h1 className="mt-4 font-display text-[2.6rem] font-semibold leading-[1.1] text-ink sm:text-6xl">
            তোমার মধ্যে লুকিয়ে থাকা
            <br />
            সম্ভাবনা খুঁজে বের করি
          </h1>
          <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-ink-soft">
            পাঁচটা সহজ প্রশ্নের উত্তর দাও — কোনো ডিগ্রি বা সার্টিফিকেট লাগবে না।
            AI তোমার উত্তর বিশ্লেষণ করে বলে দেবে তোমার শক্তির জায়গা কোথায়, আর
            কোন পথে এগোলে ভালো সুযোগ পাবে।
          </p>
          <Button onClick={onStart} size="lg" className="mt-8 gap-2">
            অ্যাসেসমেন্ট শুরু করো
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* horizon line motif */}
      <div className="horizon-line" />

      {/* explainer strip */}
      <div className="mx-auto max-w-3xl px-6 py-14">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <Compass className="h-5 w-5 text-forest" />
            <h3 className="mt-3 font-display text-lg font-semibold text-ink">
              ৫ মিনিটের যাত্রা
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
              সহজ, ছবি ও আইকন-ভিত্তিক প্রশ্ন — পড়তে না পারলেও সমস্যা নেই।
            </p>
          </div>
          <div>
            <Sparkles className="h-5 w-5 text-dawn" />
            <h3 className="mt-3 font-display text-lg font-semibold text-ink">
              AI-বিশ্লেষণ
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
              AI তোমার উত্তর দেখে একটা ব্যক্তিগত প্রোফাইল তৈরি করে দেয়।
            </p>
          </div>
          <div>
            <ShieldCheck className="h-5 w-5 text-forest" />
            <h3 className="mt-3 font-display text-lg font-semibold text-ink">
              কোনো র‍্যাংকিং নেই
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
              এটা পরীক্ষা না — তোমাকে বোঝার একটা উপায় মাত্র। ভুল উত্তর বলে
              কিছু নেই।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
