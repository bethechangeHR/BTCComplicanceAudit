import type { RiskGrade } from "@/lib/engine/types";

const GRADE_ACCENT: Record<RiskGrade, string> = {
  A: "text-white",
  B: "text-white",
  C: "text-btc-gold",
  D: "text-btc-gold",
  F: "text-btc-gold",
};

function flaggedCountLine(flaggedCount: number): string {
  if (flaggedCount === 0) {
    return "No flagged areas from your answers";
  }
  return flaggedCount === 1
    ? "1 risk area flagged"
    : `${flaggedCount} risk areas flagged`;
}

/**
 * The assessment scorecard: the single most important visual moment in the
 * funnel per client feedback (2026-07-09), replacing the prior circular
 * "seal" badge. Lives on the deep-teal instrument surface built for exactly
 * this moment. See plan Part B3.
 */
export function GradeBadge({
  grade,
  riskTierLabel,
  flaggedCount,
  animated = true,
}: {
  grade: RiskGrade;
  riskTierLabel?: string;
  flaggedCount?: number;
  animated?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border bg-instrument px-8 py-10 sm:px-12 sm:py-14 ${animated ? "animate-reveal-in" : ""}`}
      style={{ borderColor: "var(--btc-instrument-line)" }}
    >
      <div className="flex flex-col items-center gap-5 text-center">
        <span
          className={`font-display text-8xl font-medium leading-none sm:text-9xl ${GRADE_ACCENT[grade]}`}
        >
          {grade}
        </span>

        {riskTierLabel && (
          <span className="text-lg font-semibold text-white sm:text-xl">
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
