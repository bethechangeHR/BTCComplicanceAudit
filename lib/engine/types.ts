/**
 * lib/engine/types.ts
 *
 * Pure types for the compliance risk scoring engine. No React, no DOM, no
 * network. The 8 questions and their answer options are locked by
 * btc-paid-ads-campaign-buildspec-v1-2026-07-08.md.
 */

export type HeadcountAnswer = "1-9" | "10-49" | "50-149" | "150+";

/**
 * The buildspec's shorthand for question 2 is "(one / CA / multi-state)".
 * That is ambiguous on its own (a single state could be California or not),
 * so this is an explicit interpretation, flagged for HR-Pro review: the
 * three real-world buckets a CA-focused paid-ads visitor can be in.
 */
export type StatesAnswer =
  "california_only" | "one_other_state" | "multi_state";

export type ContractorUseAnswer = "none" | "some" | "mostly";

export type SalariedClassificationAnswer = "hourly" | "mix" | "all_salaried";

export type HandbookStatusAnswer = "current" | "stale" | "none";

export type HarassmentTrainingAnswer = "yes" | "unsure" | "no";

export type LeaveProcessAnswer = "yes" | "no";

/**
 * The qualifying screen (question 8). Tags the lead for BTC's own follow-up
 * qualification. Carries only a small, intentionally non-material scoring
 * weight, see data/scoring.ts HR_SUPPORT_POINTS.
 */
export type HrSupportAnswer = "in_house" | "outside" | "none";

export interface ComplianceAnswers {
  headcount: HeadcountAnswer;
  states: StatesAnswer;
  contractorUse: ContractorUseAnswer;
  salariedClassification: SalariedClassificationAnswer;
  handbookStatus: HandbookStatusAnswer;
  harassmentTraining: HarassmentTrainingAnswer;
  leaveProcess: LeaveProcessAnswer;
  hrSupport: HrSupportAnswer;
}

export type RiskGrade = "A" | "B" | "C" | "D" | "F";

export type GapCategory =
  | "Worker Classification"
  | "Handbook & Written Policies"
  | "Harassment Prevention Training"
  | "Leave & Accommodation Process"
  | "Multi-State Compliance";

export type GapSeverity = "low" | "medium" | "high";

export type GapJurisdiction =
  "CA" | "federal" | "multi-state" | "not-legal-requirement";

/** One row's worth of scoring output, before gap content is attached. */
export interface CategoryRisk {
  category: GapCategory;
  severity: GapSeverity;
}

export interface EngineResult {
  score: number;
  maxPossibleScore: number;
  grade: RiskGrade;
  /** Named categories only, deduped, ordered by severity descending. This is
   * what the on-page result is allowed to show, never the full gap detail. */
  categoryRisks: CategoryRisk[];
  /** Ordered by severity descending. Full detail lives in
   * data/gap-library.ts, looked up by id. Never rendered on-page in full;
   * the hosted report is the only surface that shows the full item. */
  triggeredGapIds: string[];
  qualificationTag: HrSupportAnswer;
}
