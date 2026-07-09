/**
 * data/questions.ts
 *
 * The 9 locked questions and their answer copy, keyed to the exact answer
 * literal values in lib/engine/types.ts. The original 8 are locked by
 * btc-paid-ads-campaign-buildspec-v1-2026-07-08.md, question 2's three
 * options are an explicit interpretation flagged in CLAUDE.md. Question 8
 * (newHirePaperwork) was added 2026-07-09 as a deliberate, reviewed spec
 * change, see CLAUDE.md.
 */

import type { ComplianceAnswers } from "@/lib/engine/types";

export interface QuestionOption<V extends string> {
  value: V;
  label: string;
}

export interface Question<
  K extends keyof ComplianceAnswers = keyof ComplianceAnswers,
> {
  key: K;
  prompt: string;
  helper?: string;
  options: QuestionOption<ComplianceAnswers[K]>[];
}

export const QUESTIONS: Question[] = [
  {
    key: "headcount",
    prompt: "How many people work at your company?",
    options: [
      { value: "1-9", label: "1 to 9" },
      { value: "10-49", label: "10 to 49" },
      { value: "50-149", label: "50 to 149" },
      { value: "150+", label: "150 or more" },
    ],
  },
  {
    key: "states",
    prompt: "Where are your employees located?",
    options: [
      { value: "california_only", label: "California only" },
      { value: "one_other_state", label: "One state, not California" },
      { value: "multi_state", label: "More than one state" },
    ],
  },
  {
    key: "contractorUse",
    prompt: "How much does your business rely on 1099 contractors?",
    options: [
      { value: "none", label: "We don't use contractors" },
      { value: "some", label: "Some of our workforce" },
      { value: "mostly", label: "Most of our workforce" },
    ],
  },
  {
    key: "salariedClassification",
    prompt: "How are your employees classified?",
    options: [
      { value: "hourly", label: "All hourly" },
      { value: "mix", label: "A mix of salaried and hourly" },
      { value: "all_salaried", label: "All salaried" },
    ],
  },
  {
    key: "handbookStatus",
    prompt: "What's the state of your employee handbook?",
    options: [
      { value: "current", label: "Current, reviewed in the last 2 years" },
      { value: "stale", label: "Exists, but not updated in 2 or more years" },
      { value: "none", label: "We don't have one" },
    ],
  },
  {
    key: "harassmentTraining",
    prompt:
      "Have you completed harassment-prevention training in the last 2 years?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "unsure", label: "Not sure" },
      { value: "no", label: "No" },
    ],
  },
  {
    key: "leaveProcess",
    prompt:
      "Do you have a documented process for handling employee leave requests?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
  {
    key: "newHirePaperwork",
    prompt: "What's your process for new-hire paperwork?",
    options: [
      {
        value: "complete",
        label:
          "Complete: offer letters, I-9s, and required notices/posters every time",
      },
      { value: "partial", label: "Partial: some of it, inconsistently" },
      { value: "none", label: "We don't have a consistent process" },
    ],
  },
  {
    key: "hrSupport",
    prompt: "What HR support do you currently have?",
    helper:
      "This helps us understand your situation. It won't change your grade.",
    options: [
      { value: "in_house", label: "In-house HR" },
      {
        value: "outside",
        label: "Outside support (consultant, PEO, fractional HR)",
      },
      { value: "none", label: "None right now" },
    ],
  },
];
