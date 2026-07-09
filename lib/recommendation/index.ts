/**
 * lib/recommendation/index.ts
 *
 * Pure, tested. Builds the two payloads from a single engine result: the
 * gated on-page result (named categories only) and the full hosted report
 * (complete diagnosis and scope of work, never the fix). See CLAUDE.md,
 * "Report philosophy," for why the split exists and what belongs on each
 * side of it.
 */

import { getGapItem, INDUSTRY_LAWSUIT_ANCHOR } from "@/data/gap-library";
import type { EngineResult, HrSupportAnswer } from "@/lib/engine/types";
import {
  GRADE_VERDICT_COPY,
  QUALIFICATION_TAGS,
  RESULT_DISCLAIMER,
  RISK_TIER_LABELS,
} from "./copy";
import type {
  EmailPayload,
  OnPageResult,
  QualificationTag,
  ReportGapSection,
  ReportView,
} from "./types";

const BOOKING_URL =
  process.env.NEXT_PUBLIC_BOOKING_URL ??
  "https://meetings.hubspot.com/bethechangehr/discoverycall";

/**
 * HubSpot's meetings tool auto-populates engagements_last_meeting_booked_
 * campaign/source/medium from UTM params on the link the visitor books
 * through, no extra wiring needed. utm_campaign stays constant so every
 * booked call from this funnel rolls up to one campaign; utm_source/medium
 * identify which touchpoint (landing page, hosted report, or which email)
 * actually drove the booking.
 */
function bookingUrlWithAttribution(source: string, medium: string): string {
  const url = new URL(BOOKING_URL);
  url.searchParams.set("utm_campaign", "ca-hr-risk-audit");
  url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_medium", medium);
  return url.toString();
}

export function buildQualificationTag(
  hrSupport: HrSupportAnswer,
): QualificationTag {
  return QUALIFICATION_TAGS[hrSupport];
}

export function buildOnPageResult(result: EngineResult): OnPageResult {
  return {
    grade: result.grade,
    score: result.score,
    maxPossibleScore: result.maxPossibleScore,
    verdictLine: GRADE_VERDICT_COPY[result.grade],
    riskTierLabel: RISK_TIER_LABELS[result.grade],
    categoryRisks: result.categoryRisks,
    disclaimer: RESULT_DISCLAIMER,
    bookingUrl: bookingUrlWithAttribution("landing-page-cta", "web"),
  };
}

function groupGapSections(result: EngineResult): ReportGapSection[] {
  return result.categoryRisks.map((categoryRisk) => {
    const items = result.triggeredGapIds
      .map((id) => getGapItem(id))
      .filter((item) => item.category === categoryRisk.category);

    return {
      category: categoryRisk.category,
      severity: categoryRisk.severity,
      items,
    };
  });
}

export function buildReport(
  result: EngineResult,
  context: { generatedAt: string; contactName?: string; company?: string },
): ReportView {
  return {
    grade: result.grade,
    score: result.score,
    maxPossibleScore: result.maxPossibleScore,
    verdictLine: GRADE_VERDICT_COPY[result.grade],
    gapSections: groupGapSections(result),
    industryContext: {
      amountUsd: INDUSTRY_LAWSUIT_ANCHOR.amountUsd,
      framing: INDUSTRY_LAWSUIT_ANCHOR.framing,
      source: INDUSTRY_LAWSUIT_ANCHOR.source,
    },
    disclaimer: RESULT_DISCLAIMER,
    bookingUrl: bookingUrlWithAttribution("hosted-report", "web"),
    generatedAt: context.generatedAt,
    contactName: context.contactName,
    company: context.company,
  };
}

export function buildEmailPayload(
  result: EngineResult,
  context: { toEmail: string; reportUrl: string; firstName?: string },
): EmailPayload {
  const topCategory = result.categoryRisks[0]?.category ?? null;
  const firstName = context.firstName?.trim() || "there";

  return {
    toEmail: context.toEmail,
    subject: `Your California HR Risk Audit result: grade ${result.grade}`,
    previewText:
      result.categoryRisks.length > 0
        ? `Your full breakdown, including ${result.categoryRisks.length} flagged area${result.categoryRisks.length === 1 ? "" : "s"}, is ready.`
        : "Your full compliance breakdown is ready.",
    reportUrl: context.reportUrl,
    bookingUrl: bookingUrlWithAttribution("transactional-email", "email"),
    mergeFields: {
      firstName,
      grade: result.grade,
      gapCount: result.triggeredGapIds.length,
      topCategory,
    },
  };
}

export * from "./types";
export {
  GRADE_VERDICT_COPY,
  RESULT_DISCLAIMER,
  QUALIFICATION_TAGS,
  RISK_TIER_LABELS,
} from "./copy";
