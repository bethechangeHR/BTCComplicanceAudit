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
 *
 * Trimmed 2026-07-20 per Noah's direct feedback: the subline and fine-print
 * trust line were cut so the title is the single apparent focal point. A
 * small eyebrow label replaces them to name the tool ("what this is") so
 * that context is not lost, keeping the above-the-fold read as tight as
 * possible per the value-equation approach (maximize clarity, minimize
 * friction before question 1).
 */
export function Hero({
  headlineVariant,
}: {
  headlineVariant: HeadlineVariant;
}) {
  const copy = HEADLINE_VARIANTS[headlineVariant];

  return (
    <div className="animate-reveal-in mx-auto max-w-2xl space-y-4 text-center">
      <Image
        src="/btc-logo-color.png"
        alt="Be the Change HR"
        width={168}
        height={56}
        className="mx-auto h-auto w-28 sm:w-32"
        priority
      />
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-btc-teal">
        Free California HR Risk Audit
      </p>
      <h1 className="text-balance font-display text-4xl font-medium text-ink sm:text-5xl">
        {copy.headline}
      </h1>
    </div>
  );
}
