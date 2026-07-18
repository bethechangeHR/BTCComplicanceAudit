import Image from "next/image";
import { HEADLINE_VARIANTS, type HeadlineVariant } from "@/lib/copy/headline";

/**
 * Repurposed 2026-07-18 from a full intro screen with its own "Start my
 * free risk audit" button into a slim header band shown above question 1
 * only. The prior full-screen intro was the step between a landing-page
 * view and the first question; removing it (see ComplianceCheckApp.tsx,
 * the tool now opens directly on question 1) closes that intro-to-Q1 drop.
 * This keeps the logo and a minimal value-prop line for trust without
 * costing a click, and without eating vertical space on every later
 * question (rendered only when stage.index === 0). Headline copy is now an
 * A/B seam, see lib/copy/headline.ts and app/page.tsx's ?v= param.
 */
export function Hero({
  headlineVariant,
}: {
  headlineVariant: HeadlineVariant;
}) {
  const copy = HEADLINE_VARIANTS[headlineVariant];

  return (
    <div className="animate-reveal-in mx-auto max-w-2xl space-y-5 text-center">
      <Image
        src="/btc-logo-color.png"
        alt="Be the Change HR"
        width={168}
        height={56}
        className="mx-auto h-auto w-28 sm:w-32"
        priority
      />
      <div className="space-y-3">
        <h1 className="text-balance font-display text-3xl font-medium text-ink sm:text-4xl">
          {copy.headline}
        </h1>
        <p className="text-sm text-btc-gray sm:text-base">{copy.subline}</p>
      </div>
      <p className="text-xs text-btc-gray/60">
        Built by California HR professionals. About 90 seconds, no cost, no
        obligation.
      </p>
    </div>
  );
}
