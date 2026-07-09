/**
 * Only carries facts confirmed in btc-source-of-truth.md / btc-kb-client-facing.md:
 * HR Pros with 15+ years experience, nationwide (all 50 state) service. No
 * testimonial quote is included, since no specific approved testimonial text
 * was found in the reviewed source files. See REVIEW.md: LeiLani/marketing
 * should supply an approved testimonial line here once selected, rather
 * than one being invented.
 */
export function CredibilityStrip() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 border-y border-ink/8 py-4 text-xs font-medium uppercase tracking-wide text-btc-gray/80 sm:text-sm">
      <span>Reviewed by HR Pros with 15+ years of experience</span>
      <span className="hidden h-1 w-1 rounded-full bg-btc-gray/40 sm:block" />
      <span>Serving employers nationwide</span>
      <span className="hidden h-1 w-1 rounded-full bg-btc-gray/40 sm:block" />
      <span>No cost, no obligation</span>
    </div>
  );
}
