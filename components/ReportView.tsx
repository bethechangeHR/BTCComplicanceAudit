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
    <div className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-12 flex items-center justify-between border-b border-ink/10 pb-8">
        <Image
          src="/btc-logo-color.png"
          alt="Be the Change HR"
          width={140}
          height={46}
          className="h-auto w-28"
        />
        <div className="text-right text-xs text-btc-gray/70">
          <p className="font-semibold uppercase tracking-wide">
            California HR Risk Audit
          </p>
          <p>Generated {generatedDate}</p>
          {report.company && <p>{report.company}</p>}
        </div>
      </header>

      <section className="mb-14 text-center">
        <GradeBadge grade={report.grade} animated={false} />
        <p className="mt-5 font-display text-2xl italic text-ink">
          {report.verdictLine}
        </p>
        <p className="mt-1 text-sm text-btc-gray/70">
          {report.score} of {report.maxPossibleScore} risk points
        </p>
      </section>

      <section className="mb-12 rounded-xl border border-ink/10 bg-white/60 p-6 text-sm leading-relaxed text-btc-gray">
        {REPORT_INTRO_COPY}
      </section>

      {report.gapSections.length > 0 && (
        <section className="mb-14 space-y-10">
          <h2 className="font-display text-xl text-ink">
            Your flagged risk areas, in full
          </h2>
          {report.gapSections.map((section) => (
            <div key={section.category} className="space-y-6">
              <div className="flex items-center gap-3">
                <h3 className="font-display text-lg text-ink">
                  {section.category}
                </h3>
                <span
                  className={`rounded-full border px-3 py-0.5 text-xs font-semibold uppercase tracking-wide ${SEVERITY_BADGE[section.severity]}`}
                >
                  {section.severity} exposure
                </span>
              </div>
              {section.items.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-ink/10 bg-white p-6 shadow-document"
                >
                  <p className="text-base leading-relaxed text-ink">
                    {item.reportDiagnosis}
                  </p>
                  <div className="mt-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-btc-gray/70">
                      Full scope of work to close this gap
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {item.scopeOfWork.map((task) => (
                        <li
                          key={task}
                          className="flex gap-2 text-sm text-btc-gray"
                        >
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-btc-teal" />
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="mt-4 text-xs italic text-btc-gray/50">
                    Source: {item.sourceRef}
                  </p>
                </article>
              ))}
            </div>
          ))}
        </section>
      )}

      <section className="mb-14 rounded-2xl border border-btc-gold/30 bg-btc-gold/8 p-6 text-center">
        <p className="font-display text-lg text-ink">
          {report.industryContext.framing}
        </p>
        <p className="mt-2 text-xs text-btc-gray/60">
          Source: {report.industryContext.source}
        </p>
      </section>

      <section className="mb-14 space-y-8">
        <CredibilityStrip />
        <BookingEmbed bookingUrl={report.bookingUrl} />
      </section>

      <Disclaimer text={report.disclaimer} />
    </div>
  );
}
