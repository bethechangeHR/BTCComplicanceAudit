/**
 * lib/recommendation/copy.ts
 *
 * Fixed, non-legal, non-BTC-fact presentation copy: grade verdict lines,
 * the disclaimer, and qualification tag labels. Written to the voice rules
 * in CLAUDE.md (direct, a little urgent on risk, no banned words, no em or
 * en dashes). This is marketing/UX copy, not a sourced legal claim, so it
 * does not carry a sourceRef the way data/gap-library.ts does.
 */

import type { RiskGrade, HrSupportAnswer } from "@/lib/engine/types";
import type { QualificationTag } from "./types";

export const GRADE_VERDICT_COPY: Record<RiskGrade, string> = {
  A: "Your HR practices are in strong shape overall. A few areas are still worth a second look.",
  B: "You are mostly covered, but real gaps remain that could still cost you.",
  C: "You have compliance exposure worth addressing soon, before it becomes a claim.",
  D: "Your business carries serious HR compliance risk right now.",
  F: "Your business is significantly exposed across multiple compliance areas. This needs attention now.",
};

/**
 * Named risk tier shown on the scorecard next to the letter grade, per the
 * plan's Part B3. Short, real exposure-level language, not a euphemism, and
 * not a caps-tracked eyebrow label in the component that renders it.
 */
export const RISK_TIER_LABELS: Record<RiskGrade, string> = {
  A: "Low exposure",
  B: "Some exposure",
  C: "Moderate exposure",
  D: "High exposure",
  F: "Severe exposure",
};

export const RESULT_DISCLAIMER =
  "This is an educational estimate and a directional risk indicator, not legal advice. It does not tell you which laws apply to your specific business as settled fact. For a full review of your actual exposure, book a free 30-minute HR risk assessment with a Be the Change HR Pro.";

export const QUALIFICATION_TAGS: Record<HrSupportAnswer, QualificationTag> = {
  none: {
    value: "none",
    label: "No current HR support",
    leadPriority: "high",
  },
  outside: {
    value: "outside",
    label: "Uses outside or contract HR support",
    leadPriority: "medium",
  },
  in_house: {
    value: "in_house",
    label: "Has in-house HR support",
    leadPriority: "standard",
  },
};

export const REPORT_INTRO_COPY =
  "This report names every general risk area your answers point to, the reasoning behind each one, and the full scope of work it would take to close it. It does not include the specific fixes themselves, the compliant policy language, the reclassification steps, or the training rollout. That is what a Be the Change HR Pro builds with you on a call.";
