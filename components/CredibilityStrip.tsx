/**
 * Only carries facts confirmed in btc-source-of-truth.md / btc-kb-client-facing.md:
 * HR Pros with 15+ years experience, nationwide (all 50 state) service. No
 * testimonial quote is included, since no specific approved testimonial text
 * was found in the reviewed source files. See REVIEW.md: LeiLani/marketing
 * should supply an approved testimonial line here once selected, rather
 * than one being invented.
 */
const POINTS = [
  "Reviewed by HR Pros with 15+ years of experience",
  "Serving employers nationwide",
  "No cost, no obligation",
];

export function CredibilityStrip() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
      {POINTS.map((point) => (
        <span
          key={point}
          className="flex items-center gap-2 text-sm font-medium text-btc-gray"
        >
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-btc-teal" />
          {point}
        </span>
      ))}
    </div>
  );
}
