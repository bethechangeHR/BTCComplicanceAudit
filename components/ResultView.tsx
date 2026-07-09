import { GradeBadge } from "./GradeBadge";
import { CategoryRiskList } from "./CategoryRiskList";
import { CredibilityStrip } from "./CredibilityStrip";
import { BookingEmbed } from "./BookingEmbed";
import { Disclaimer } from "./Disclaimer";
import type { OnPageResult } from "@/lib/recommendation/types";

export function ResultView({
  result,
  reportUrl,
}: {
  result: OnPageResult;
  reportUrl?: string;
}) {
  return (
    <div className="mx-auto max-w-xl space-y-8 text-center">
      <GradeBadge grade={result.grade} />
      <div className="space-y-2">
        <p className="font-display text-xl italic text-ink sm:text-2xl">
          {result.verdictLine}
        </p>
        <p className="text-sm text-btc-gray/70">
          Score: {result.score} of {result.maxPossibleScore} risk points
        </p>
      </div>

      {result.categoryRisks.length > 0 && (
        <div className="space-y-3 text-left">
          <h3 className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-btc-gray/70">
            Flagged risk categories
          </h3>
          <CategoryRiskList categoryRisks={result.categoryRisks} />
        </div>
      )}

      {reportUrl && (
        <div className="animate-rise-in rounded-xl border border-btc-gold/40 bg-btc-gold/8 px-5 py-4 text-sm text-ink">
          Your full audit report, including the complete reasoning and scope of
          work behind every flagged area, is on its way to your inbox.{" "}
          <a
            href={reportUrl}
            className="font-semibold text-btc-teal-dark underline underline-offset-2"
          >
            View it now
          </a>
          .
        </div>
      )}

      <CredibilityStrip />
      <BookingEmbed bookingUrl={result.bookingUrl} />
      <Disclaimer text={result.disclaimer} />
    </div>
  );
}
