/**
 * channels/types.ts
 *
 * Thin adapter types for the two channel modes. Paid mode ships now and is
 * fully built. Email mode is a stubbed future seam only, see CLAUDE.md.
 *
 * Deviation from the btc-hr-cost-calculator sibling's pattern, documented
 * here rather than silently diverging: that app posts its webhook events
 * directly from the browser to a NEXT_PUBLIC webhook URL. This app instead
 * routes every event through a Next.js API route (app/api/track,
 * app/api/submit) that posts server-side to a private (non-public)
 * COMPLIANCE_CHECK_WEBHOOK_URL. Two reasons: the gated submission carries
 * PII (email, phone) and needs server-side HMAC token signing anyway, and
 * keeping the webhook URL private end-to-end is a stronger default for a
 * pipeline that also upserts a HubSpot contact.
 */

import type {
  ComplianceAnswers,
  HrSupportAnswer,
  RiskGrade,
} from "@/lib/engine/types";

export type ChannelMode = "email" | "paid";

export interface EmailModePrefill {
  company?: string;
  state?: string;
  headcount?: number;
  name?: string;
}

/**
 * tool_viewed (aka calculator_viewed in the shared BTC event-naming
 * convention). Fires on tool load, ungated, carries no PII. A click alone
 * is an interest signal and must be logged even if the visitor never
 * completes the tool.
 */
export interface ToolViewedPayload {
  mode: ChannelMode;
  timestamp: string;
  fbclid?: string;
}

/**
 * tool_complete (aka calculator_completed). Fires server-side, only after
 * the email gate validates and the report token is signed. This is the
 * payload posted to the n8n webhook that upserts the HubSpot contact and
 * triggers the report email, SMS, and nurture sequence.
 */
export interface SubmitPayload {
  mode: ChannelMode;
  timestamp: string;
  email: string;
  phone?: string;
  smsOptIn: boolean;
  company?: string;
  name?: string;
  fbclid?: string;
  answers: ComplianceAnswers;
  grade: RiskGrade;
  score: number;
  maxPossibleScore: number;
  triggeredGapIds: string[];
  qualificationTag: HrSupportAnswer;
  reportUrl: string;
  source: "meta-paid" | "email";
}
