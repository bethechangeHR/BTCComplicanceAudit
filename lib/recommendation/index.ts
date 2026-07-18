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
 * HubSpot meeting links prefill their form fields from matching query
 * params (firstname, lastname, email; company and phone prefill only if
 * those fields are enabled on the meeting's booking form). All optional and
 * degrade gracefully: a net-new lead who only gave an email still gets that
 * one field prefilled, nothing errors on a missing field.
 */
interface BookingPrefill {
  firstName?: string;
  lastName?: string;
  email?: string;
  company?: string;
  phone?: string;
}

/**
 * Splits a single captured name field into HubSpot's separate firstname
 * and lastname prefill params. The gate only ever captures one name field
 * (components/EmailGateStep.tsx), so this is done at the call site, not
 * upstream.
 */
function splitName(name: string | undefined): {
  firstName?: string;
  lastName?: string;
} {
  const trimmed = name?.trim();
  if (!trimmed) return {};
  const [firstName, ...rest] = trimmed.split(/\s+/);
  return { firstName, lastName: rest.join(" ") || undefined };
}

/**
 * HubSpot's meetings tool auto-populates engagements_last_meeting_booked_
 * campaign/source/medium from UTM params on the link the visitor books
 * through, no extra wiring needed. utm_campaign stays constant so every
 * booked call from this funnel rolls up to one campaign; utm_source/medium
 * identify which touchpoint (landing page, hosted report, or which email)
 * actually drove the booking. prefill (added 2026-07-18, P3) saves the
 * visitor from re-entering contact info the tool already captured;
 * URLSearchParams.set already URL-encodes every value.
 */
function bookingUrlWithAttribution(
  source: string,
  medium: string,
  prefill?: BookingPrefill,
): string {
  const url = new URL(BOOKING_URL);
  url.searchParams.set("utm_campaign", "ca-hr-risk-audit");
  url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_medium", medium);
  if (prefill?.firstName) url.searchParams.set("firstname", prefill.firstName);
  if (prefill?.lastName) url.searchParams.set("lastname", prefill.lastName);
  if (prefill?.email) url.searchParams.set("email", prefill.email);
  if (prefill?.company) url.searchParams.set("company", prefill.company);
  if (prefill?.phone) url.searchParams.set("phone", prefill.phone);
  return url.toString();
}

export function buildQualificationTag(
  hrSupport: HrSupportAnswer,
): QualificationTag {
  return QUALIFICATION_TAGS[hrSupport];
}

export function buildOnPageResult(
  result: EngineResult,
  contact?: { name?: string; email?: string; company?: string; phone?: string },
): OnPageResult {
  const { firstName, lastName } = splitName(contact?.name);
  return {
    grade: result.grade,
    score: result.score,
    maxPossibleScore: result.maxPossibleScore,
    verdictLine: GRADE_VERDICT_COPY[result.grade],
    riskTierLabel: RISK_TIER_LABELS[result.grade],
    categoryRisks: result.categoryRisks,
    disclaimer: RESULT_DISCLAIMER,
    bookingUrl: bookingUrlWithAttribution("landing-page-cta", "web", {
      firstName,
      lastName,
      email: contact?.email,
      company: contact?.company,
      phone: contact?.phone,
    }),
    industryContext: {
      amountUsd: INDUSTRY_LAWSUIT_ANCHOR.amountUsd,
      framing: INDUSTRY_LAWSUIT_ANCHOR.framing,
      source: INDUSTRY_LAWSUIT_ANCHOR.source,
    },
    leadPriority: buildQualificationTag(result.qualificationTag).leadPriority,
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
  context: {
    generatedAt: string;
    contactName?: string;
    company?: string;
    email?: string;
    phone?: string;
  },
): ReportView {
  const { firstName, lastName } = splitName(context.contactName);
  return {
    grade: result.grade,
    score: result.score,
    maxPossibleScore: result.maxPossibleScore,
    verdictLine: GRADE_VERDICT_COPY[result.grade],
    riskTierLabel: RISK_TIER_LABELS[result.grade],
    gapSections: groupGapSections(result),
    industryContext: {
      amountUsd: INDUSTRY_LAWSUIT_ANCHOR.amountUsd,
      framing: INDUSTRY_LAWSUIT_ANCHOR.framing,
      source: INDUSTRY_LAWSUIT_ANCHOR.source,
    },
    disclaimer: RESULT_DISCLAIMER,
    bookingUrl: bookingUrlWithAttribution("hosted-report", "web", {
      firstName,
      lastName,
      email: context.email,
      company: context.company,
      phone: context.phone,
    }),
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
    bookingUrl: bookingUrlWithAttribution("transactional-email", "email", {
      firstName: context.firstName,
      email: context.toEmail,
    }),
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
