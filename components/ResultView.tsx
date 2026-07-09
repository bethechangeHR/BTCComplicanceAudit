import { GradeBadge } from "./GradeBadge";
import { CategoryRiskList } from "./CategoryRiskList";
import { RiskAssessmentCTA } from "./RiskAssessmentCTA";
import { BookingEmbed } from "./BookingEmbed";
import { Disclaimer } from "./Disclaimer";
import type { OnPageResult } from "@/lib/recommendation/types";

/**
 * `reportUrl` is accepted for backward compatibility with
 * ComplianceCheckApp.tsx (out of scope this phase), but is intentionally
 * never rendered as a link. Per client feedback (2026-07-09), the on-page
 * result must not offer immediate access to the full report; it only ships
 * by email. See CLAUDE.md, "Report philosophy."
 */
export function ResultView({
  result,
}: {
  result: OnPageResult;
  reportUrl?: string;
}) {
  return (
    <div className="mx-auto max-w-xl space-y-8 text-center">
      <GradeBadge
        grade={result.grade}
        riskTierLabel={result.riskTierLabel}
        flaggedCount={result.categoryRisks.length}
      />

      <p className="font-display text-xl text-ink sm:text-2xl">
        {result.verdictLine}
      </p>

      {result.categoryRisks.length > 0 && (
        <div className="space-y-3 text-left">
          <h3 className="text-center text-base font-semibold text-ink sm:text-lg">
            Flagged risk categories
          </h3>
          <CategoryRiskList categoryRisks={result.categoryRisks} />
        </div>
      )}

      <p className="animate-rise-in text-sm text-btc-gray">
        Your full audit report, with the complete reasoning behind every
        flagged area, is on its way to your inbox.
      </p>

      <RiskAssessmentCTA />
      <BookingEmbed bookingUrl={result.bookingUrl} />
      <Disclaimer text={result.disclaimer} />
    </div>
  );
}
