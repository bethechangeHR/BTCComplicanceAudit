/**
 * Cost-of-doing-nothing line, added 2026-07-18 (P2.2). Places the existing
 * INDUSTRY_LAWSUIT_ANCHOR (data/gap-library.ts) on the on-page result in
 * addition to the hosted report. Renders the anchor's own framing string
 * verbatim, no new legal claim is authored here: it is always an industry
 * figure, never a BTC guarantee, see the framing text itself and CLAUDE.md
 * rule 1 (no pricing) and rule 5 (no company-specific legal claim).
 */
export function CostAnchorLine({
  amountUsd,
  framing,
}: {
  amountUsd: number;
  framing: string;
}) {
  return (
    <div className="rounded-2xl border border-btc-gold/30 bg-btc-gold/5 px-5 py-6 text-center sm:px-6">
      <p className="font-display text-3xl text-ink sm:text-4xl">
        ${amountUsd.toLocaleString("en-US")}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-btc-gray sm:text-sm">
        {framing}
      </p>
    </div>
  );
}
