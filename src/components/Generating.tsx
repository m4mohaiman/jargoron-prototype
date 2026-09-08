import { Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Generating({
  error,
  status,
  onRetry,
  onBack,
}: {
  error: string | null;
  status?: string | null;
  onRetry: () => void;
  onBack: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="max-w-sm text-center">
        {error ? (
          <>
            <TriangleAlert className="mx-auto h-8 w-8 text-clay" />
            <h2 className="mt-4 font-display text-xl font-semibold text-ink">
              প্রোফাইল তৈরি করা যায়নি
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{error}</p>
            <div className="mt-6 flex justify-center gap-3">
              <Button variant="outline" onClick={onBack}>
                পেছনে যাও
              </Button>
              <Button onClick={onRetry}>আবার চেষ্টা করো</Button>
            </div>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-forest" />
            <h2 className="mt-4 font-display text-xl font-semibold text-ink">
              তোমার প্রোফাইল তৈরি হচ্ছে
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              {status ?? "AI তোমার উত্তরগুলো বিশ্লেষণ করছে..."}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
