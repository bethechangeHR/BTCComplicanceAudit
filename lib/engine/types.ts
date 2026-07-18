/**
 * lib/engine/types.ts
 *
 * Pure types for the compliance risk scoring engine. No React, no DOM, no
 * network. The original 8 questions and their answer options are locked by
 * btc-paid-ads-campaign-buildspec-v1-2026-07-08.md. A 9th question,
 * newHirePaperwork, was added 2026-07-09 as a deliberate, reviewed spec
 * change, see CLAUDE.md and data/scoring.ts. Two more, wageHour and
 * workersComp, were added 2026-07-14 per LEGAL-RESEARCH-2026-07-14.md items 8
 * and 9, bringing the total to 11.
 */

export type HeadcountAnswer = "1-9" | "10-49" | "50-149" | "150+";

/**
 * The buildspec's shorthand for question 2 is "(one / CA / multi-state)".
 * That is ambiguous on its own (a single state could be California or not),
 * so this is an explicit interpretation, flagged for HR-Pro review: the
 * real-world buckets a CA-focused paid-ads visitor can be in. Split
 * 2026-07-15 per LeiLani's feedback: multi-state needs to distinguish
 * whether California is one of the states or not, since the ABC test and
 * other CA-specific facts only apply if CA is actually in the mix.
 */
export type StatesAnswer =
  | "california_only"
  | "one_other_state"
  | "multi_state_ca"
  | "multi_state_no_ca";

export type ContractorUseAnswer = "none" | "some" | "mostly";

export type SalariedClassificationAnswer = "hourly" | "mix" | "all_salaried";

export type HandbookStatusAnswer = "current" | "stale" | "none";

export type HarassmentTrainingAnswer = "yes" | "unsure" | "no";

export type LeaveProcessAnswer = "yes" | "no";

/**
 * Question 8, added 2026-07-09. A risk question: adds points, see
 * data/scoring.ts NEW_HIRE_PAPERWORK_POINTS.
 */
export type NewHirePaperworkAnswer = "complete" | "partial" | "none";

/**
 * Question 9, added 2026-07-14 per LEGAL-RESEARCH-2026-07-14.md item 8. The
 * single highest-volume CA wage-and-hour litigation area. A risk question:
 * adds points, see data/scoring.ts WAGE_HOUR_POINTS.
 */
export type WageHourAnswer = "complete" | "partial" | "none";

/**
 * Question 10, added 2026-07-14 per LEGAL-RESEARCH-2026-07-14.md item 9. A
 * bright-line legal mandate (Labor Code Section 3700). A risk question: adds
 * points, see data/scoring.ts WORKERS_COMP_POINTS.
 */
export type WorkersCompAnswer = "yes" | "unsure" | "no";

/**
 * The qualifying screen (question 11, last in the flow). Tags the lead for
 * BTC's own follow-up qualification. As of 2026-07-09 it carries zero
 * scoring weight (pure lead-fit tag, does not move the grade at all), see
 * data/scoring.ts HR_SUPPORT_POINTS. `self_no_pro` added 2026-07-14 per
 * LeiLani's request, distinct from `none`: the owner is handling HR
 * themselves rather than having no support at all.
 */
export type HrSupportAnswer = "in_house" | "outside" | "self_no_pro" | "none";

export interface ComplianceAnswers {
  headcount: HeadcountAnswer;
  states: StatesAnswer;
  contractorUse: ContractorUseAnswer;
  salariedClassification: SalariedClassificationAnswer;
  handbookStatus: HandbookStatusAnswer;
  harassmentTraining: HarassmentTrainingAnswer;
  leaveProcess: LeaveProcessAnswer;
  newHirePaperwork: NewHirePaperworkAnswer;
  wageHour: WageHourAnswer;
  workersComp: WorkersCompAnswer;
  hrSupport: HrSupportAnswer;
}

export type RiskGrade = "A" | "B" | "C" | "D" | "F";

export type GapCategory =
  | "Worker Classification"
  | "Handbook & Written Policies"
  | "Harassment Prevention Training"
  | "Leave & Accommodation Process"
  | "Multi-State Compliance"
  | "New-Hire Paperwork & Notices"
  | "Wage & Hour"
  | "Workers' Compensation";

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
