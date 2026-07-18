import Link from "next/link";
import { verifyReportToken } from "@/lib/token";
import { scoreComplianceAnswers } from "@/lib/engine";
import { buildReport } from "@/lib/recommendation";
import { ReportView } from "@/components/ReportView";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const payload = verifyReportToken(token);

  if (!payload) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-2xl text-ink">
          This report link is invalid or has expired.
        </h1>
        <p className="mt-3 text-sm text-btc-gray">
          Retake the free California HR Risk Audit to get a fresh report.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-lg bg-btc-teal px-6 py-3 text-sm font-semibold text-white shadow-seal"
        >
          Start the risk audit
        </Link>
      </div>
    );
  }

  const engineResult = scoreComplianceAnswers(payload.answers);
  const report = buildReport(engineResult, {
    generatedAt: payload.createdAt,
    contactName: payload.name,
    company: payload.company,
    email: payload.email,
    phone: payload.phone,
  });

  return <ReportView report={report} />;
}
