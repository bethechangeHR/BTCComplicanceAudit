import Image from "next/image";
import { GradeBadge } from "./GradeBadge";
import { CredibilityStrip } from "./CredibilityStrip";
import { BookingEmbed } from "./BookingEmbed";
import { Disclaimer } from "./Disclaimer";
import { REPORT_INTRO_COPY } from "@/lib/recommendation/copy";
import type { ReportView as ReportViewData } from "@/lib/recommendation/types";

const SEVERITY_BADGE: Record<string, string> = {
  high: "bg-[#b3452f]/10 text-[#8a3421] border-[#b3452f]/30",
  medium: "bg-btc-gold/15 text-[#8f7442] border-btc-gold/35",
  low: "bg-btc-teal/10 text-btc-teal-dark border-btc-teal/30",
};

export function ReportView({ report }: { report: ReportViewData }) {
  const generatedDate = new Date(report.generatedAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  // Every external legal fact keeps its citation, just relocated out of the
  // recommendation cards into a single numbered list at the end of the
  // report, so each card reads clean while every claim stays sourced.
  const sources: string[] = [];
  function sourceNumber(sourceRef: string): number {
    let index = sources.indexOf(sourceRef);
    if (index === -1) {
      sources.push(sourceRef);
      index = sources.length - 1;
    }
    return index + 1;
  }

  return (
    <div>
      {/* Cover band on the deep-teal instrument surface. Logo runs directly
          on the dark band using the white wordmark asset, sized to anchor
          the header rather than float in it. The band is built to be
          information-dense on first view: who this is for, when it was
          run, and the grade, all above the fold. */}
      <header
        className="animate-reveal-in bg-instrument"
        style={{ borderBottom: "1px solid var(--btc-instrument-line)" }}
      >
        <div className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
          <div className="flex flex-wrap items-center justify-between gap-6 border-b border-white/10 pb-8">
            <Image
              src="/btc-logo-white.png"
              alt="Be the Change HR"
              width={168}
              height={56}
              className="h-auto w-36 sm:w-40"
            />
            <div className="text-right">
              <p className="font-display text-2xl text-white sm:text-3xl">
                California HR Risk Audit
              </p>
              <p className="mt-1 text-sm text-white/60">
                Generated {generatedDate}
                {report.company ? ` for ${report.company}` : ""}
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center gap-6 text-center sm:flex-row sm:items-stretch sm:justify-between sm:text-left">
            <div className="sm:max-w-sm sm:py-2">
              {report.contactName && (
                <p className="text-sm font-semibold text-white">
                  {report.contactName}
                  {report.company ? `, ${report.company}` : ""}
                </p>
              )}
              <p className="mt-3 text-lg leading-relaxed text-white sm:text-xl">
                {report.verdictLine}
              </p>
              <p className="mt-4 text-sm text-white/60">
                {report.gapSections.length === 0
                  ? "No flagged risk areas from your answers."
                  : report.gapSections.length === 1
                    ? "1 risk area flagged below, in full."
                    : `${report.gapSections.length} risk areas flagged below, in full.`}
              </p>
            </div>
            <GradeBadge
              grade={report.grade}
              riskTierLabel={report.riskTierLabel}
              flaggedCount={report.gapSections.length}
              animated={false}
            />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-16">
        <section className="mb-16 border-y border-ink/10 py-8">
          <p className="text-base leading-relaxed text-btc-gray">
            {REPORT_INTRO_COPY}
          </p>
        </section>

        {report.gapSections.length > 0 && (
          <section className="mb-16">
            <h2 className="font-display text-2xl text-ink">
              Your flagged risk areas, in full
            </h2>
            <div className="mt-10 space-y-14">
              {report.gapSections.map((section, sectionIndex) => (
                <div
                  key={section.category}
                  className="animate-rise-in space-y-6"
                  style={{ animationDelay: `${sectionIndex * 90}ms` }}
                >
                  <div className="flex flex-wrap items-center gap-3 border-b border-ink/10 pb-4">
                    <h3 className="font-display text-xl text-ink">
                      {section.category}
                    </h3>
                    <span
                      className={`rounded-full border px-3 py-0.5 text-xs font-bold uppercase tracking-wide ${SEVERITY_BADGE[section.severity]}`}
                    >
                      {section.severity} exposure
                    </span>
                  </div>
                  <div className="space-y-6">
                    {section.items.map((item) => (
                      <article
                        key={item.id}
                        className="rounded-2xl bg-white p-8 shadow-document sm:p-10"
                      >
                        <p className="text-base leading-relaxed text-ink">
                          {item.reportDiagnosis}
                          <sup className="ml-0.5 text-btc-teal-dark">
                            [{sourceNumber(item.sourceRef)}]
                          </sup>
                        </p>
                        <div className="mt-6 border-t border-ink/10 pt-6">
                          <p className="text-sm font-semibold text-ink">
                            Full scope of work to close this gap
                          </p>
                          <ul className="mt-3 space-y-2">
                            {item.scopeOfWork.map((task) => (
                              <li
                                key={task}
                                className="flex gap-2.5 text-sm leading-relaxed text-btc-gray"
                              >
                                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-btc-teal" />
                                <span>{task}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mb-16 rounded-2xl border border-btc-gold/30 bg-btc-gold/8 px-8 py-12 text-center sm:px-14 sm:py-14">
          <p className="font-display text-3xl leading-none text-btc-gold sm:text-4xl">
            $200,000
          </p>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-ink sm:text-xl">
            {report.industryContext.framing}
          </p>
        </section>

        <section className="mb-16 space-y-8 rounded-2xl border border-ink/10 bg-white px-8 py-10 text-center shadow-document sm:px-12 sm:py-12">
          <div className="space-y-2">
            <h2 className="font-display text-2xl text-ink">
              Talk it through with a Be the Change HR Pro
            </h2>
            <p className="mx-auto max-w-md text-sm text-btc-gray">
              A free 30-minute call to walk through what closes these gaps
              first, no cost, no obligation.
            </p>
          </div>
          <CredibilityStrip />
          <BookingEmbed bookingUrl={report.bookingUrl} />
        </section>

        <Disclaimer text={report.disclaimer} />

        {sources.length > 0 && (
          <ol className="mx-auto mt-10 max-w-xl space-y-1.5 text-xs text-btc-gray/60">
            {sources.map((source, index) => (
              <li key={source} className="flex gap-2">
                <span className="shrink-0">[{index + 1}]</span>
                <span>{source}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
