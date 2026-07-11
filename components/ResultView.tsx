import { GradeBadge } from "./GradeBadge";
import { CategoryRiskList } from "./CategoryRiskList";
import { RiskAssessmentCTA } from "./RiskAssessmentCTA";
import { BookingEmbed } from "./BookingEmbed";
import { Disclaimer } from "./Disclaimer";
import type { OnPageResult } from "@/lib/recommendation/types";

/**
 * `reportUrl` is rendered as a direct fallback link as of 2026-07-11: the
 * sending domain is still warming up its email reputation, so some report
 * emails land in spam or are delayed. This temporarily overrides the
 * 2026-07-09 email-only decision in CLAUDE.md, "Report philosophy," so no
 * lead is ever fully cut off from their report. Remove this link once
 * inbox delivery is confirmed reliable (see VERIFICATION.md).
 */
export function ResultView({
  result,
  reportUrl,
}: {
  result: OnPageResult;
  reportUrl: string;
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
        flagged area, is on its way to your inbox. You can also view it right
        now:{" "}
        <a
          href={reportUrl}
          className="font-semibold text-btc-teal-dark underline"
        >
          Open your full report
        </a>
      </p>

      <RiskAssessmentCTA />
      <BookingEmbed bookingUrl={result.bookingUrl} />
      <Disclaimer text={result.disclaimer} />
    </div>
  );
}
