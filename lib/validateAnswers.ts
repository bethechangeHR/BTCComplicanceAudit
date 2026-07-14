/**
 * lib/validateAnswers.ts
 *
 * Validates an arbitrary JSON body against the 9 locked answer options
 * before it ever reaches the scoring engine. This is a system boundary
 * (an HTTP request body), so validation belongs here, not inside the pure
 * engine, which is entitled to trust its typed input.
 */

import {
  CONTRACTOR_USE_POINTS,
  HANDBOOK_STATUS_POINTS,
  HARASSMENT_TRAINING_POINTS,
  HEADCOUNT_POINTS,
  HR_SUPPORT_POINTS,
  LEAVE_PROCESS_POINTS,
  NEW_HIRE_PAPERWORK_POINTS,
  SALARIED_CLASSIFICATION_POINTS,
  STATES_POINTS,
  WAGE_HOUR_POINTS,
  WORKERS_COMP_POINTS,
} from "@/data/scoring";
import type { ComplianceAnswers } from "@/lib/engine/types";

function isValid<T extends string>(
  value: unknown,
  allowed: Record<T, number>,
): value is T {
  return typeof value === "string" && value in allowed;
}

export function validateComplianceAnswers(
  input: unknown,
): ComplianceAnswers | null {
  if (typeof input !== "object" || input === null) return null;
  const a = input as Record<string, unknown>;

  if (
    isValid(a.headcount, HEADCOUNT_POINTS) &&
    isValid(a.states, STATES_POINTS) &&
    isValid(a.contractorUse, CONTRACTOR_USE_POINTS) &&
    isValid(a.salariedClassification, SALARIED_CLASSIFICATION_POINTS) &&
    isValid(a.handbookStatus, HANDBOOK_STATUS_POINTS) &&
    isValid(a.harassmentTraining, HARASSMENT_TRAINING_POINTS) &&
    isValid(a.leaveProcess, LEAVE_PROCESS_POINTS) &&
    isValid(a.newHirePaperwork, NEW_HIRE_PAPERWORK_POINTS) &&
    isValid(a.wageHour, WAGE_HOUR_POINTS) &&
    isValid(a.workersComp, WORKERS_COMP_POINTS) &&
    isValid(a.hrSupport, HR_SUPPORT_POINTS)
  ) {
    return {
      headcount: a.headcount,
      states: a.states,
      contractorUse: a.contractorUse,
      salariedClassification: a.salariedClassification,
      handbookStatus: a.handbookStatus,
      harassmentTraining: a.harassmentTraining,
      leaveProcess: a.leaveProcess,
      newHirePaperwork: a.newHirePaperwork,
      wageHour: a.wageHour,
      workersComp: a.workersComp,
      hrSupport: a.hrSupport,
    };
  }

  return null;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && EMAIL_PATTERN.test(value);
}
