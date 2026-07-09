/**
 * lib/recommendation/types.ts
 *
 * Pure types for the two-payload recommendation layer. No React, no DOM.
 */

import type {
  CategoryRisk,
  HrSupportAnswer,
  RiskGrade,
} from "@/lib/engine/types";
import type { GapItem } from "@/data/gap-library";

export type LeadPriority = "high" | "medium" | "standard";

export interface QualificationTag {
  value: HrSupportAnswer;
  label: string;
  leadPriority: LeadPriority;
}

/**
 * What the gated, instant on-page result is allowed to show. Named
 * categories and severity only, never the diagnosis or scope of work. The
 * fix, and even the reasoning, stays behind the booked call or the emailed
 * report.
 */
export interface OnPageResult {
  grade: RiskGrade;
  score: number;
  maxPossibleScore: number;
  verdictLine: string;
  /** Named exposure-level label for the grade, e.g. "Low exposure" for A,
   * "Severe exposure" for F. See lib/recommendation/copy.ts RISK_TIER_LABELS. */
  riskTierLabel: string;
  categoryRisks: CategoryRisk[];
  disclaimer: string;
  bookingUrl: string;
}

/** One category's full detail for the hosted report, grouped from possibly
 * multiple triggered gap items in that category. */
export interface ReportGapSection {
  category: string;
  severity: CategoryRisk["severity"];
  items: GapItem[];
}

/**
 * The full hosted report payload: complete diagnosis and complete scope of
 * work for every triggered gap, grouped by category, plus industry cost
 * context. Never includes the actual work product / fix.
 */
export interface ReportView {
  grade: RiskGrade;
  score: number;
  maxPossibleScore: number;
  verdictLine: string;
  /** Named exposure-level label for the grade, e.g. "Low exposure" for A,
   * "Severe exposure" for F. See lib/recommendation/copy.ts RISK_TIER_LABELS. */
  riskTierLabel: string;
  gapSections: ReportGapSection[];
  industryContext: {
    amountUsd: number;
    framing: string;
    source: string;
  };
  disclaimer: string;
  bookingUrl: string;
  generatedAt: string;
  contactName?: string;
  company?: string;
}

export interface EmailPayload {
  toEmail: string;
  subject: string;
  previewText: string;
  reportUrl: string;
  bookingUrl: string;
  mergeFields: {
    firstName: string;
    grade: RiskGrade;
    gapCount: number;
    topCategory: string | null;
  };
}
