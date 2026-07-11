import { GradeBadge } from "./GradeBadge";
import { CategoryRiskList } from "./CategoryRiskList";
import { RiskAssessmentCTA } from "./RiskAssessmentCTA";
import { BookingEmbed } from "./BookingEmbed";
import { Disclaimer } from "./Disclaimer";
import type { OnPageResult } from "@/lib/recommendation/types";

export function ResultView({ result }: { result: OnPageResult }) {
  return (
    <div className="animate-reveal-in mx-auto max-w-xl space-y-10">
      <div className="space-y-6 text-center">
        <GradeBadge
          grade={result.grade}
          riskTierLabel={result.riskTierLabel}
          flaggedCount={result.categoryRisks.length}
        />

        <p className="font-display text-xl text-ink sm:text-2xl">
          {result.verdictLine}
        </p>
      </div>

      {result.categoryRisks.length > 0 && (
        <div
          className="animate-rise-in space-y-3 text-left"
          style={{ animationDelay: "120ms" }}
        >
          <h3 className="text-center text-base font-semibold text-ink sm:text-lg">
            Flagged risk categories
          </h3>
          <CategoryRiskList categoryRisks={result.categoryRisks} />
        </div>
      )}

      <p
        className="animate-rise-in text-center text-sm text-btc-gray"
        style={{ animationDelay: "220ms" }}
      >
        Your full audit report is being sent to your inbox.
      </p>

      <div
        className="animate-rise-in space-y-8"
        style={{ animationDelay: "300ms" }}
      >
        <RiskAssessmentCTA />
        <BookingEmbed bookingUrl={result.bookingUrl} />
        <Disclaimer text={result.disclaimer} />
      </div>
    </div>
  );
}
