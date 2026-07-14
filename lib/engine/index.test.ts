import { describe, expect, it } from "vitest";
import { scoreComplianceAnswers } from "./index";
import { GRADE_BANDS, MAX_POSSIBLE_SCORE } from "@/data/scoring";
import type { ComplianceAnswers } from "./types";

const CLEANEST: ComplianceAnswers = {
  headcount: "1-9",
  states: "california_only",
  contractorUse: "none",
  salariedClassification: "hourly",
  handbookStatus: "current",
  harassmentTraining: "yes",
  leaveProcess: "yes",
  newHirePaperwork: "complete",
  wageHour: "complete",
  workersComp: "yes",
  hrSupport: "in_house",
};

const RISKIEST: ComplianceAnswers = {
  headcount: "150+",
  states: "multi_state",
  contractorUse: "mostly",
  salariedClassification: "all_salaried",
  handbookStatus: "none",
  harassmentTraining: "no",
  leaveProcess: "no",
  newHirePaperwork: "none",
  wageHour: "none",
  workersComp: "no",
  hrSupport: "none",
};

describe("scoreComplianceAnswers", () => {
  it("scores the all-clean answer set as 0 points and grade A", () => {
    const result = scoreComplianceAnswers(CLEANEST);
    expect(result.score).toBe(0);
    expect(result.grade).toBe("A");
    expect(result.triggeredGapIds).toEqual([]);
    expect(result.categoryRisks).toEqual([]);
  });

  it("scores the all-risky answer set at the maximum and grade F", () => {
    const result = scoreComplianceAnswers(RISKIEST);
    expect(result.score).toBe(MAX_POSSIBLE_SCORE);
    expect(result.grade).toBe("F");
    expect(result.triggeredGapIds.length).toBeGreaterThan(0);
  });

  it("MAX_POSSIBLE_SCORE is 69 given the current first-draft weights", () => {
    // Locks the constant so an accidental weight change is caught explicitly
    // rather than silently shifting every band. Update deliberately if
    // HR-Pro calibration changes any weight. Was 54 before the 2026-07-14
    // rework (WAGE_HOUR_POINTS added, contributing a max of 7;
    // WORKERS_COMP_POINTS added, contributing a max of 8): 54 + 7 + 8 = 69.
    expect(MAX_POSSIBLE_SCORE).toBe(69);
  });

  it("covers every point from 0 to max with exactly one grade band, no gaps or overlaps", () => {
    for (let score = 0; score <= MAX_POSSIBLE_SCORE; score++) {
      const matching = GRADE_BANDS.filter(
        (b) => score >= b.minScore && score <= b.maxScore,
      );
      expect(matching.length).toBe(1);
    }
  });

  it("treats an 'unsure' harassment-training answer as a real, medium gap, not a free pass", () => {
    const result = scoreComplianceAnswers({
      ...CLEANEST,
      harassmentTraining: "unsure",
    });
    expect(result.triggeredGapIds).toContain("gap-training-unsure");
    expect(
      result.categoryRisks.find(
        (c) => c.category === "Harassment Prevention Training",
      )?.severity,
    ).toBe("medium");
    expect(result.score).toBeGreaterThan(0);
  });

  it("distinguishes single-state California, single-state other, and multi-state", () => {
    const caOnly = scoreComplianceAnswers({
      ...CLEANEST,
      states: "california_only",
    });
    const otherState = scoreComplianceAnswers({
      ...CLEANEST,
      states: "one_other_state",
    });
    const multiState = scoreComplianceAnswers({
      ...CLEANEST,
      states: "multi_state",
    });

    expect(caOnly.triggeredGapIds).toEqual([]);
    expect(otherState.triggeredGapIds).toContain("gap-other-state");
    expect(multiState.triggeredGapIds).toContain("gap-multistate");
    expect(multiState.score).toBeGreaterThan(otherState.score);
    expect(otherState.score).toBeGreaterThan(caOnly.score);
  });

  it("never lets question 9 (HR support) move the answer set more than one grade band on its own", () => {
    const withInHouse = scoreComplianceAnswers({
      ...CLEANEST,
      hrSupport: "in_house",
    });
    const withNone = scoreComplianceAnswers({ ...CLEANEST, hrSupport: "none" });

    const bandIndex = (grade: string) =>
      GRADE_BANDS.findIndex((b) => b.grade === grade);
    expect(
      Math.abs(bandIndex(withInHouse.grade) - bandIndex(withNone.grade)),
    ).toBeLessThanOrEqual(1);
    expect(withNone.qualificationTag).toBe("none");
  });

  it("exposes the qualification tag separately from the gap list, it is never itself a gap item", () => {
    const result = scoreComplianceAnswers({ ...CLEANEST, hrSupport: "none" });
    expect(result.qualificationTag).toBe("none");
    expect(
      result.triggeredGapIds.every((id) => !id.includes("hr-support")),
    ).toBe(true);
  });

  it("orders triggered gaps and category risks by severity descending", () => {
    const result = scoreComplianceAnswers(RISKIEST);
    const severities = result.categoryRisks.map((c) => c.severity);
    const rank: Record<string, number> = { high: 3, medium: 2, low: 1 };
    for (let i = 1; i < severities.length; i++) {
      expect(rank[severities[i - 1]!]!).toBeGreaterThanOrEqual(
        rank[severities[i]!]!,
      );
    }
  });

  it("triggers the handbook-none gap only when the handbook is missing, not when merely stale", () => {
    const stale = scoreComplianceAnswers({
      ...CLEANEST,
      handbookStatus: "stale",
    });
    const none = scoreComplianceAnswers({
      ...CLEANEST,
      handbookStatus: "none",
    });
    expect(stale.triggeredGapIds).toContain("gap-handbook-stale");
    expect(stale.triggeredGapIds).not.toContain("gap-handbook-none");
    expect(none.triggeredGapIds).toContain("gap-handbook-none");
    expect(none.triggeredGapIds).not.toContain("gap-handbook-stale");
  });
});
