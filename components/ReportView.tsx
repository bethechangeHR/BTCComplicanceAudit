import Image from "next/image";
import { GradeBadge } from "./GradeBadge";
import { CredibilityStrip } from "./CredibilityStrip";
import { BookingEmbed } from "./BookingEmbed";
import { Disclaimer } from "./Disclaimer";
import { REPORT_INTRO_COPY } from "@/lib/recommendation/copy";
import type { ReportView as ReportViewData } from "@/lib/recommendation/types";

const SEVERITY_BADGE: Record<string, string> = {
  high: "bg-[#b3452f]/10 text-[#8a3421] border-[#b3452f]/25",
  medium: "bg-btc-gold/12 text-[#8f7442] border-btc-gold/30",
  low: "bg-btc-teal/10 text-btc-teal-dark border-btc-teal/25",
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

  return (
    <div>
      {/* Cover band on the deep-teal instrument surface, the same surface
          used for the grade-reveal scorecard. This is the visual anchor
          that has to clearly out-value the on-page teaser result. The
          logo asset's wordmark is dark gray, which does not read against
          this surface, so it sits on its own light plate rather than
          being placed directly on the dark band. */}
      <header
        className="animate-reveal-in bg-instrument"
        style={{ borderBottom: "1px solid var(--btc-instrument-line)" }}
      >
        <div className="mx-auto max-w-3xl px-6 py-14 sm:py-20">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="rounded-xl bg-white px-4 py-3 shadow-document">
              <Image
                src="/btc-logo-color.png"
                alt="Be the Change HR"
                width={140}
                height={46}
                className="h-auto w-28"
              />
            </div>
            <div className="text-right">
              <p className="font-display text-2xl text-white sm:text-3xl">
                California HR Risk Audit
              </p>
              <p className="mt-2 text-sm text-white/60">
                Generated {generatedDate}
              </p>
              {report.contactName && (
                <p className="text-sm text-white/60">{report.contactName}</p>
              )}
              {report.company && (
                <p className="text-sm text-white/60">{report.company}</p>
              )}
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center gap-6 text-center sm:mt-16">
            <GradeBadge
              grade={report.grade}
              riskTierLabel={report.riskTierLabel}
              flaggedCount={report.gapSections.length}
              animated={false}
            />
            <p className="max-w-xl text-lg leading-relaxed text-white sm:text-xl">
              {report.verdictLine}
            </p>
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
                      className={`rounded-full border px-3 py-0.5 text-xs font-semibold uppercase tracking-wide ${SEVERITY_BADGE[section.severity]}`}
                    >
                      {section.severity} exposure
                    </span>
                  </div>
                  <div className="space-y-8">
                    {section.items.map((item) => (
                      <article
                        key={item.id}
                        className="rounded-2xl bg-white p-8 shadow-document sm:p-10"
                      >
                        <p className="text-base leading-relaxed text-ink">
                          {item.reportDiagnosis}
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
                        <p className="mt-6 text-xs italic text-btc-gray/50">
                          Source: {item.sourceRef}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mb-16 rounded-2xl border border-btc-gold/25 bg-btc-gold/8 px-8 py-10 text-center sm:px-12">
          <p className="font-display text-xl leading-snug text-ink">
            {report.industryContext.framing}
          </p>
          <p className="mt-3 text-xs text-btc-gray/60">
            Source: {report.industryContext.source}
          </p>
        </section>

        <section className="mb-16 space-y-10">
          <CredibilityStrip />
          <BookingEmbed bookingUrl={report.bookingUrl} />
        </section>

        <Disclaimer text={report.disclaimer} />
      </div>
    </div>
  );
}
