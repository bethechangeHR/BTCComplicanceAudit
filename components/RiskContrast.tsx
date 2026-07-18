/**
 * Now-vs-could-be contrast, added 2026-07-18 (P2.1). Guardrail-safe: shows
 * only the visitor's own riskTierLabel and flagged-category count against a
 * generic "clean profile" benchmark (a hypothetical A, zero flagged areas).
 * No fix content, no category names, no pricing, no company-specific legal
 * claim, see CLAUDE.md rule 5. Only rendered by ResultView when the visitor
 * has at least one flagged area, since a visitor who is already the clean
 * benchmark has nothing to contrast against.
 */
export function RiskContrast({
  riskTierLabel,
  flaggedCount,
}: {
  riskTierLabel: string;
  flaggedCount: number;
}) {
  return (
    <div className="grid grid-cols-2 divide-x divide-ink/10 rounded-2xl border border-ink/10 bg-white shadow-document">
      <div className="space-y-1 px-4 py-5 text-center sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-btc-gray/60">
          Where you are
        </p>
        <p className="font-display text-lg text-ink sm:text-xl">
          {riskTierLabel}
        </p>
        <p className="text-xs text-btc-gray">
          {flaggedCount === 1
            ? "1 area flagged"
            : `${flaggedCount} areas flagged`}
        </p>
      </div>
      <div className="space-y-1 px-4 py-5 text-center sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-btc-gray/60">
          A clean profile
        </p>
        <p className="font-display text-lg text-btc-teal-dark sm:text-xl">
          Low exposure
        </p>
        <p className="text-xs text-btc-gray">No areas flagged</p>
      </div>
    </div>
  );
}
