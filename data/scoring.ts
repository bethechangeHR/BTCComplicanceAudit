/**
 * data/scoring.ts
 *
 * Every question's risk points and the A-F band cutoffs. This is a
 * first-draft proposal, not a finalized scoring model. Every weight below
 * is a named, changeable constant pending HR-Pro calibration (LeiLani or
 * Genevieve), see REVIEW.md. The engine (lib/engine/index.ts) imports every
 * number from here and never inlines a weight.
 *
 * Design principle (why headcount and multi-state carry real points even
 * absent an overt violation): both are structural exposure, not practice
 * quality. A larger or multi-state employer has more ways to be
 * non-compliant even when diligent, since more laws attach and more
 * jurisdictions must be separately satisfied. Practice-level answers
 * (handbook, training, classification, leave) measure whether the business
 * is actually doing the required things; headcount and state measure how
 * much is required of them in the first place. Both belong in an honest
 * audit grade. This is why a genuinely clean small single-state business
 * scores an A (see lib/engine/goldenMaster.test.ts, the "clean business"
 * scenario) while a well-run multi-state business can still land in a
 * middle band on structural complexity alone, not a rigged bad grade.
 */

import type {
  ComplianceAnswers,
  ContractorUseAnswer,
  GapCategory,
  HandbookStatusAnswer,
  HarassmentTrainingAnswer,
  HeadcountAnswer,
  HrSupportAnswer,
  LeaveProcessAnswer,
  NewHirePaperworkAnswer,
  RiskGrade,
  SalariedClassificationAnswer,
  StatesAnswer,
} from "@/lib/engine/types";

export const HEADCOUNT_POINTS: Record<HeadcountAnswer, number> = {
  "1-9": 0,
  "10-49": 2,
  "50-149": 4,
  "150+": 6,
};

export const STATES_POINTS: Record<StatesAnswer, number> = {
  california_only: 0,
  one_other_state: 2,
  multi_state: 6,
};

export const CONTRACTOR_USE_POINTS: Record<ContractorUseAnswer, number> = {
  none: 0,
  some: 4,
  mostly: 8,
};

export const SALARIED_CLASSIFICATION_POINTS: Record<
  SalariedClassificationAnswer,
  number
> = {
  hourly: 0,
  mix: 3,
  all_salaried: 6,
};

export const HANDBOOK_STATUS_POINTS: Record<HandbookStatusAnswer, number> = {
  current: 0,
  stale: 5,
  none: 8,
};

export const HARASSMENT_TRAINING_POINTS: Record<
  HarassmentTrainingAnswer,
  number
> = {
  yes: 0,
  unsure: 4,
  no: 7,
};

export const LEAVE_PROCESS_POINTS: Record<LeaveProcessAnswer, number> = {
  yes: 0,
  no: 6,
};

/**
 * Question 8, added 2026-07-09. TODO-flagged first-draft proposal, pending
 * HR-Pro calibration, same as every other weight in this file. New-hire
 * paperwork (offer letters, Form I-9, required notices/posters) is a
 * practice-level answer, same family as handbook status and training: it
 * measures whether the business is actually doing the required things, not
 * structural exposure. See data/gap-library.ts gap-newhire-none and
 * gap-newhire-partial for the cited legal basis.
 */
export const NEW_HIRE_PAPERWORK_POINTS: Record<NewHirePaperworkAnswer, number> =
  {
    complete: 0,
    partial: 4,
    none: 7,
  };

/**
 * Zeroed out 2026-07-09, a deliberate spec change (see CLAUDE.md). Question
 * 9 is now purely the qualifying screen, it tags the lead for BTC's own
 * follow-up (see lib/recommendation/qualification.ts) and contributes
 * nothing to the grade. buildQualificationTag() / qualificationTag still
 * read this answer directly for lead-fit tagging, independent of scoring.
 * Kept as a Record (rather than deleted) so the engine and validateAnswers
 * still reference a single source of truth and the question stays wired
 * for a future scoring reinstatement if HR-Pro decides otherwise.
 */
export const HR_SUPPORT_POINTS: Record<HrSupportAnswer, number> = {
  in_house: 0,
  outside: 0,
  none: 0,
};

export const MAX_POSSIBLE_SCORE =
  Math.max(...Object.values(HEADCOUNT_POINTS)) +
  Math.max(...Object.values(STATES_POINTS)) +
  Math.max(...Object.values(CONTRACTOR_USE_POINTS)) +
  Math.max(...Object.values(SALARIED_CLASSIFICATION_POINTS)) +
  Math.max(...Object.values(HANDBOOK_STATUS_POINTS)) +
  Math.max(...Object.values(HARASSMENT_TRAINING_POINTS)) +
  Math.max(...Object.values(LEAVE_PROCESS_POINTS)) +
  Math.max(...Object.values(NEW_HIRE_PAPERWORK_POINTS)) +
  Math.max(...Object.values(HR_SUPPORT_POINTS));

/**
 * A-F band cutoffs, expressed as inclusive point ranges out of
 * MAX_POSSIBLE_SCORE (54 as currently weighted, up from 49 after the
 * 2026-07-09 rework: HR_SUPPORT_POINTS zeroed out, losing a max of 2, and
 * NEW_HIRE_PAPERWORK_POINTS added, contributing a max of 7). Cutoffs are
 * re-derived proportionally against the new max, preserving each band's
 * original share of the range. First-draft proposal, pending HR-Pro
 * calibration. Verified honest by construction: an all-lowest-risk answer
 * set scores 0 (A) and an all-highest-risk answer set scores 54 (F), see
 * lib/engine/goldenMaster.test.ts.
 */
export const GRADE_BANDS: {
  grade: RiskGrade;
  minScore: number;
  maxScore: number;
}[] = [
  { grade: "A", minScore: 0, maxScore: 7 },
  { grade: "B", minScore: 8, maxScore: 15 },
  { grade: "C", minScore: 16, maxScore: 26 },
  { grade: "D", minScore: 27, maxScore: 37 },
  { grade: "F", minScore: 38, maxScore: MAX_POSSIBLE_SCORE },
];

export function scoreToGrade(score: number): RiskGrade {
  const band = GRADE_BANDS.find(
    (b) => score >= b.minScore && score <= b.maxScore,
  );
  if (!band) {
    throw new Error(`Score ${score} out of bounds 0-${MAX_POSSIBLE_SCORE}`);
  }
  return band.grade;
}

/**
 * Maps each answer to zero or more gap-library item ids it triggers, and
 * the category that gap belongs to (for the on-page, named-category-only
 * view). Content for each id lives in data/gap-library.ts, this file only
 * owns the trigger condition and the points.
 */
export const ANSWER_GAP_TRIGGERS: {
  question: keyof ComplianceAnswers;
  answer: string;
  gapIds: string[];
  category: GapCategory;
}[] = [
  {
    question: "contractorUse",
    answer: "some",
    gapIds: ["gap-1099-some"],
    category: "Worker Classification",
  },
  {
    question: "contractorUse",
    answer: "mostly",
    gapIds: ["gap-1099-mostly"],
    category: "Worker Classification",
  },
  {
    question: "salariedClassification",
    answer: "mix",
    gapIds: ["gap-exempt-mix"],
    category: "Worker Classification",
  },
  {
    question: "salariedClassification",
    answer: "all_salaried",
    gapIds: ["gap-exempt-all"],
    category: "Worker Classification",
  },
  {
    question: "handbookStatus",
    answer: "stale",
    gapIds: ["gap-handbook-stale"],
    category: "Handbook & Written Policies",
  },
  {
    question: "handbookStatus",
    answer: "none",
    gapIds: ["gap-handbook-none"],
    category: "Handbook & Written Policies",
  },
  {
    question: "harassmentTraining",
    answer: "unsure",
    gapIds: ["gap-training-unsure"],
    category: "Harassment Prevention Training",
  },
  {
    question: "harassmentTraining",
    answer: "no",
    gapIds: ["gap-training-none"],
    category: "Harassment Prevention Training",
  },
  {
    question: "leaveProcess",
    answer: "no",
    gapIds: ["gap-leave-none"],
    category: "Leave & Accommodation Process",
  },
  {
    question: "states",
    answer: "multi_state",
    gapIds: ["gap-multistate"],
    category: "Multi-State Compliance",
  },
  {
    question: "states",
    answer: "one_other_state",
    gapIds: ["gap-other-state"],
    category: "Multi-State Compliance",
  },
  {
    question: "newHirePaperwork",
    answer: "partial",
    gapIds: ["gap-newhire-partial"],
    category: "New-Hire Paperwork & Notices",
  },
  {
    question: "newHirePaperwork",
    answer: "none",
    gapIds: ["gap-newhire-none"],
    category: "New-Hire Paperwork & Notices",
  },
];
