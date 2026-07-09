import { scoreComplianceAnswers } from "@/lib/engine";
import { buildOnPageResult } from "@/lib/recommendation";
import { signReportToken } from "@/lib/token";
import type { ComplianceAnswers } from "@/lib/engine/types";

export const dynamic = "force-dynamic";

const SCENARIOS: {
  label: string;
  description: string;
  answers: ComplianceAnswers;
}[] = [
  {
    label: "Genuinely clean business",
    description:
      "Small, single-state, doing everything right. Proves the grade is not rigged to fail everyone.",
    answers: {
      headcount: "1-9",
      states: "california_only",
      contractorUse: "none",
      salariedClassification: "hourly",
      handbookStatus: "current",
      harassmentTraining: "yes",
      leaveProcess: "yes",
      newHirePaperwork: "complete",
      hrSupport: "in_house",
    },
  },
  {
    label: "Buildspec scenario 1: 6-employee shop, no handbook, mostly 1099s",
    description: "Golden master, expected score 36, grade D.",
    answers: {
      headcount: "1-9",
      states: "california_only",
      contractorUse: "mostly",
      salariedClassification: "hourly",
      handbookStatus: "none",
      harassmentTraining: "no",
      leaveProcess: "no",
      newHirePaperwork: "none",
      hrSupport: "none",
    },
  },
  {
    label: "Buildspec scenario 2: 40-employee CA, all salaried, no training",
    description: "Golden master, expected score 24, grade C.",
    answers: {
      headcount: "10-49",
      states: "california_only",
      contractorUse: "none",
      salariedClassification: "all_salaried",
      handbookStatus: "stale",
      harassmentTraining: "no",
      leaveProcess: "yes",
      newHirePaperwork: "partial",
      hrSupport: "outside",
    },
  },
  {
    label:
      "Buildspec scenario 3: 120-employee multi-state, current handbook, documented leave",
    description:
      "Golden master, expected score 17, grade C, driven by structure not practice gaps.",
    answers: {
      headcount: "50-149",
      states: "multi_state",
      contractorUse: "some",
      salariedClassification: "mix",
      handbookStatus: "current",
      harassmentTraining: "yes",
      leaveProcess: "yes",
      newHirePaperwork: "complete",
      hrSupport: "in_house",
    },
  },
  {
    label: "All-risky business",
    description: "Every worst answer. Proves the ceiling grade is F.",
    answers: {
      headcount: "150+",
      states: "multi_state",
      contractorUse: "mostly",
      salariedClassification: "all_salaried",
      handbookStatus: "none",
      harassmentTraining: "no",
      leaveProcess: "no",
      newHirePaperwork: "none",
      hrSupport: "none",
    },
  },
];

export default function PreviewPage() {
  const rows = SCENARIOS.map((scenario) => {
    const result = scoreComplianceAnswers(scenario.answers);
    const onPage = buildOnPageResult(result);
    const token = signReportToken({
      answers: scenario.answers,
      email: "preview@example.com",
      name: "Preview",
      createdAt: new Date(0).toISOString(),
    });
    return { scenario, onPage, token };
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-2xl text-ink">
        Preview: seeded scenarios
      </h1>
      <p className="mt-2 text-sm text-btc-gray">
        Local QA only. Not linked from the live tool. Requires
        REPORT_TOKEN_SECRET to be set.
      </p>
      <div className="mt-10 space-y-6">
        {rows.map(({ scenario, onPage, token }) => (
          <div
            key={scenario.label}
            className="rounded-xl border border-ink/10 bg-white p-6 shadow-document"
          >
            <p className="font-display text-lg text-ink">{scenario.label}</p>
            <p className="mt-1 text-sm text-btc-gray">{scenario.description}</p>
            <p className="mt-3 text-sm">
              Grade <strong>{onPage.grade}</strong>, score {onPage.score} of{" "}
              {onPage.maxPossibleScore}, {onPage.categoryRisks.length} categor
              {onPage.categoryRisks.length === 1 ? "y" : "ies"} flagged
            </p>
            <a
              href={`/report/${token}`}
              className="mt-3 inline-block text-sm font-semibold text-btc-teal-dark underline underline-offset-2"
            >
              View hosted report
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
