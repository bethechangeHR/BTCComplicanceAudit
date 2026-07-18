import type { RiskGrade } from "@/lib/engine/types";

const GRADE_ACCENT: Record<RiskGrade, string> = {
  A: "text-white",
  B: "text-white",
  C: "text-btc-gold",
  D: "text-btc-gold",
  F: "text-btc-gold",
};

const TIER_BADGE: Record<RiskGrade, string> = {
  A: "border-btc-teal/40 bg-btc-teal/10 text-btc-teal",
  B: "border-btc-teal/40 bg-btc-teal/10 text-btc-teal",
  C: "border-btc-gold/40 bg-btc-gold/10 text-btc-gold",
  D: "border-btc-gold/40 bg-btc-gold/10 text-btc-gold",
  F: "border-[#b3452f]/40 bg-[#b3452f]/10 text-[#e08a6f]",
};

function flaggedCountLine(flaggedCount: number): string {
  if (flaggedCount === 0) {
    return "No flagged areas from your answers";
  }
  return flaggedCount === 1
    ? "One risk area flagged"
    : `${flaggedCount} risk areas flagged`;
}

/**
 * The assessment scorecard: the single most important visual moment in the
 * funnel per client feedback (2026-07-09), replacing the prior circular
 * "seal" badge. Lives on the deep-teal instrument surface built for exactly
 * this moment. See plan Part B3.
 *
 * `compact` added 2026-07-18 for the gate teaser (components/EmailGateStep.tsx,
 * P1d): the full-size badge is tuned for the result page where it is the
 * only thing on screen, but at the gate it sits above a 3-field form, and on
 * a small phone in the actual Facebook/Instagram in-app browser (reduced
 * viewport height from the in-app toolbar, the exact environment P0 was
 * about) the full-size badge pushes the email field, the whole point of the
 * gate, below the fold. Compact keeps the same colors and grade emphasis at
 * roughly half the vertical footprint. ResultView does not pass this prop,
 * so the main reveal moment is unaffected.
 */
export function GradeBadge({
  grade,
  riskTierLabel,
  flaggedCount,
  animated = true,
  compact = false,
}: {
  grade: RiskGrade;
  riskTierLabel?: string;
  flaggedCount?: number;
  animated?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border bg-instrument shadow-document ${compact ? "px-6 py-5 sm:px-8 sm:py-6" : "px-8 py-8 sm:px-10 sm:py-10"} ${animated ? "animate-reveal-in" : ""}`}
      style={{ borderColor: "var(--btc-instrument-line)" }}
    >
      <div
        className={`flex flex-col items-center text-center ${compact ? "gap-2" : "gap-4"}`}
      >
        <span
          className={`font-display font-medium leading-none ${compact ? "text-6xl sm:text-7xl" : "text-8xl sm:text-9xl"} ${GRADE_ACCENT[grade]}`}
        >
          {grade}
        </span>

        {riskTierLabel && (
          <span
            className={`rounded-full border px-4 py-1 text-sm font-bold uppercase tracking-wide ${TIER_BADGE[grade]}`}
          >
            {riskTierLabel}
          </span>
        )}

        {typeof flaggedCount === "number" && (
          <span
            className="text-sm font-medium text-white/70"
            style={{
              borderTop: "1px solid var(--btc-instrument-line)",
              paddingTop: "1rem",
              marginTop: "0.25rem",
            }}
          >
            {flaggedCountLine(flaggedCount)}
          </span>
        )}
      </div>
    </div>
  );
}
