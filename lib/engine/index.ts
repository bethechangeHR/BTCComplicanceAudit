/**
 * lib/engine/index.ts
 *
 * Pure, UI-free, deterministic compliance risk scoring engine. Answers in,
 * structured result out. No React, no DOM, no network, no LLM. Every weight
 * is imported from data/scoring.ts, never inlined here.
 */

import {
  ANSWER_GAP_TRIGGERS,
  MAX_POSSIBLE_SCORE,
  computeAnswersScore,
  scoreToGrade,
} from "@/data/scoring";
import { getGapItem } from "@/data/gap-library";
import type {
  CategoryRisk,
  ComplianceAnswers,
  EngineResult,
  GapSeverity,
} from "./types";

const SEVERITY_RANK: Record<GapSeverity, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

function computeTriggeredGapIds(answers: ComplianceAnswers): string[] {
  const ids: string[] = [];
  for (const trigger of ANSWER_GAP_TRIGGERS) {
    const givenAnswer = answers[trigger.question];
    if (givenAnswer === trigger.answer) {
      ids.push(...trigger.gapIds);
    }
  }
  return ids;
}

function computeCategoryRisks(triggeredGapIds: string[]): CategoryRisk[] {
  const bestSeverityByCategory = new Map<string, GapSeverity>();

  for (const id of triggeredGapIds) {
    const item = getGapItem(id);
    const current = bestSeverityByCategory.get(item.category);
    if (!current || SEVERITY_RANK[item.severity] > SEVERITY_RANK[current]) {
      bestSeverityByCategory.set(item.category, item.severity);
    }
  }

  return Array.from(bestSeverityByCategory.entries())
    .map(([category, severity]) => ({
      category: category as CategoryRisk["category"],
      severity,
    }))
    .sort((a, b) => {
      const bySeverity = SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity];
      if (bySeverity !== 0) return bySeverity;
      return a.category.localeCompare(b.category);
    });
}

function sortGapIdsBySeverityDescending(ids: string[]): string[] {
  return [...ids].sort((a, b) => {
    const severityDiff =
      SEVERITY_RANK[getGapItem(b).severity] -
      SEVERITY_RANK[getGapItem(a).severity];
    if (severityDiff !== 0) return severityDiff;
    return a.localeCompare(b);
  });
}

export function scoreComplianceAnswers(
  answers: ComplianceAnswers,
): EngineResult {
  const score = computeAnswersScore(answers);
  const triggeredGapIds = sortGapIdsBySeverityDescending(
    computeTriggeredGapIds(answers),
  );

  return {
    score,
    maxPossibleScore: MAX_POSSIBLE_SCORE,
    grade: scoreToGrade(score),
    categoryRisks: computeCategoryRisks(triggeredGapIds),
    triggeredGapIds,
    qualificationTag: answers.hrSupport,
  };
}

export * from "./types";
