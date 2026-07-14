/**
 * Loss-aversion bridge into booking, replacing CredibilityStrip on the
 * result page per client feedback (2026-07-09): the prior "reviewed by HR
 * pros, no cost or obligation" strip lacked context. This leads with
 * curiosity about the reasons behind the flagged gaps, then hands off
 * directly to BookingEmbed below it. Not a competing CTA button, a framing
 * element, kept plain against bg-surface.
 */
export function RiskAssessmentCTA() {
  return (
    <div className="animate-rise-in space-y-2 border-t border-btc-teal/20 pt-8">
      <p className="font-display text-2xl text-ink sm:text-3xl">
        Want to know why these gaps exist?
      </p>
      <p className="text-sm text-btc-gray sm:text-base">
        A free 30-minute HR risk assessment with be the change HR walks through
        exactly what is driving your score, and what closing each gap actually
        takes.
      </p>
    </div>
  );
}
