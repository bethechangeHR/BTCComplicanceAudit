/**
 * lib/engine/goldenMaster.test.ts
 *
 * Locks the graded output of the three scenarios named in the buildspec's
 * verification requirement (section 7), plus a fourth "genuinely clean
 * business" scenario required separately by the verification gate (section
 * 11: "Proof the tool can award a high grade for a genuinely clean
 * business"). Each scenario's point-by-point hand reconciliation is
 * reproduced in VERIFICATION.md. If a future change to data/scoring.ts
 * shifts any of these results, that is a deliberate, reviewed change, not a
 * silent drift, since these tests will fail loudly.
 *
 * Where the source scenario description did not specify every one of the 9
 * answers (including newHirePaperwork, added 2026-07-09), the unstated
 * fields are filled with an explicit, documented assumption (never the most
 * flattering guess) so the scenario is fully defined. Each assumption is
 * called out in its own comment.
 */

import { describe, expect, it } from "vitest";
import { scoreComplianceAnswers } from "./index";
import type { ComplianceAnswers } from "./types";

describe("golden master: buildspec scenario 1", () => {
  // "A 6-employee single-state shop with no handbook and mostly 1099s."
  // Unstated, assumed: single state read as California (this tool is CA-
  // targeted); the remaining non-contractor staff assumed hourly, not
  // salaried, since a contractor-heavy shop rarely has a formal salaried
  // exempt structure; no stated training or leave process assumed absent,
  // matching a very small, informally-run shop profile. New-hire paperwork
  // (question 8, added 2026-07-09) assumed "none", consistent with the same
  // informally-run profile that has no handbook, no training, and no leave
  // process. HR support (question 9) no longer scores, kept as "none" since
  // that also matches the profile.
  const scenario1: ComplianceAnswers = {
    headcount: "1-9",
    states: "california_only",
    contractorUse: "mostly",
    salariedClassification: "hourly",
    handbookStatus: "none",
    harassmentTraining: "no",
    leaveProcess: "no",
    newHirePaperwork: "none",
    hrSupport: "none",
  };

  it("reconciles to 36 points, grade D", () => {
    // 0 (1-9) + 0 (CA only) + 8 (mostly 1099) + 0 (hourly) + 8 (no handbook)
    // + 7 (no training) + 6 (no leave process) + 7 (no new-hire paperwork)
    // + 0 (HR support no longer scores) = 36
    const result = scoreComplianceAnswers(scenario1);
    expect(result.score).toBe(36);
    expect(result.grade).toBe("D");
    expect(result.triggeredGapIds).toEqual(
      expect.arrayContaining([
        "gap-1099-mostly",
        "gap-handbook-none",
        "gap-training-none",
        "gap-leave-none",
        "gap-newhire-none",
      ]),
    );
  });
});

describe("golden master: buildspec scenario 2", () => {
  // "A 40-employee California company, all salaried, no harassment
  // training." Unstated, assumed: no independent contractor use (the
  // scenario emphasizes an all-salaried employee model, not a contractor
  // model); handbook assumed stale rather than current or absent, a neutral
  // middle assumption since nothing was said about it; leave process
  // assumed documented (yes) and HR support assumed outsourced, reflecting
  // a company past the earliest startup stage. New-hire paperwork (question
  // 8, added 2026-07-09) assumed "partial": a company that lets its
  // handbook go stale and skips harassment training plausibly also runs
  // new-hire paperwork inconsistently rather than either perfectly or not
  // at all, a documented, non-flattering middle assumption.
  const scenario2: ComplianceAnswers = {
    headcount: "10-49",
    states: "california_only",
    contractorUse: "none",
    salariedClassification: "all_salaried",
    handbookStatus: "stale",
    harassmentTraining: "no",
    leaveProcess: "yes",
    newHirePaperwork: "partial",
    hrSupport: "outside",
  };

  it("reconciles to 24 points, grade C", () => {
    // 2 (10-49) + 0 (CA only) + 0 (no contractors) + 6 (all salaried)
    // + 5 (stale handbook) + 7 (no training) + 0 (documented leave)
    // + 4 (partial new-hire paperwork) + 0 (HR support no longer scores)
    // = 24
    const result = scoreComplianceAnswers(scenario2);
    expect(result.score).toBe(24);
    expect(result.grade).toBe("C");
    expect(result.triggeredGapIds).toEqual(
      expect.arrayContaining([
        "gap-exempt-all",
        "gap-handbook-stale",
        "gap-training-none",
        "gap-newhire-partial",
      ]),
    );
  });
});

describe("golden master: buildspec scenario 3", () => {
  // "A 120-employee multi-state company with current handbook and
  // documented leave." Unstated, assumed: some independent contractor use
  // and a mixed salaried/hourly workforce, typical of a company at this
  // size; harassment training assumed current (yes) and HR support assumed
  // in-house, consistent with a company that is otherwise clearly
  // maintaining its handbook and leave process deliberately. New-hire
  // paperwork (question 8, added 2026-07-09) assumed "complete", the same
  // deliberately-well-run profile that keeps its handbook current and its
  // leave process documented.
  const scenario3: ComplianceAnswers = {
    headcount: "50-149",
    states: "multi_state",
    contractorUse: "some",
    salariedClassification: "mix",
    handbookStatus: "current",
    harassmentTraining: "yes",
    leaveProcess: "yes",
    newHirePaperwork: "complete",
    hrSupport: "in_house",
  };

  it("reconciles to 17 points, grade C, driven by structural complexity not practice gaps", () => {
    // 4 (50-149) + 6 (multi-state) + 4 (some 1099) + 3 (mixed salaried)
    // + 0 (current handbook) + 0 (training current) + 0 (documented leave)
    // + 0 (complete new-hire paperwork) + 0 (HR support no longer scores)
    // = 17
    // Two thirds of this score (10 of 17 points) comes from headcount tier
    // and multi-state structure, not from any practice failure: this
    // company is doing the actual work right (current handbook, trained,
    // documented leave, complete new-hire paperwork) but still carries real
    // structural complexity risk from its size and footprint. That is an
    // honest C, not a rigged one.
    const result = scoreComplianceAnswers(scenario3);
    expect(result.score).toBe(17);
    expect(result.grade).toBe("C");
    expect(result.triggeredGapIds).toEqual(
      expect.arrayContaining([
        "gap-multistate",
        "gap-1099-some",
        "gap-exempt-mix",
      ]),
    );
    expect(result.triggeredGapIds).not.toContain("gap-handbook-none");
    expect(result.triggeredGapIds).not.toContain("gap-training-none");
    expect(result.triggeredGapIds).not.toContain("gap-leave-none");
    expect(result.triggeredGapIds).not.toContain("gap-newhire-none");
    expect(result.triggeredGapIds).not.toContain("gap-newhire-partial");
  });
});

describe("golden master: genuinely clean business (verification gate requirement)", () => {
  // A small, single-state California business doing everything right: no
  // contractors, hourly staff, current handbook, trained, documented leave,
  // complete new-hire paperwork, in-house HR support. Required proof that
  // the scoring model is not rigged to fail everyone regardless of actual
  // compliance posture.
  const cleanBusiness: ComplianceAnswers = {
    headcount: "1-9",
    states: "california_only",
    contractorUse: "none",
    salariedClassification: "hourly",
    handbookStatus: "current",
    harassmentTraining: "yes",
    leaveProcess: "yes",
    newHirePaperwork: "complete",
    hrSupport: "in_house",
  };

  it("scores 0 points and earns an A, with zero triggered gaps", () => {
    const result = scoreComplianceAnswers(cleanBusiness);
    expect(result.score).toBe(0);
    expect(result.grade).toBe("A");
    expect(result.triggeredGapIds).toEqual([]);
    expect(result.categoryRisks).toEqual([]);
  });
});
