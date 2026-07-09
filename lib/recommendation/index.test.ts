import { describe, expect, it } from "vitest";
import { scoreComplianceAnswers } from "@/lib/engine";
import type { ComplianceAnswers } from "@/lib/engine/types";
import {
  buildEmailPayload,
  buildOnPageResult,
  buildQualificationTag,
  buildReport,
} from "./index";

const RISKY_ANSWERS: ComplianceAnswers = {
  headcount: "50-149",
  states: "multi_state",
  contractorUse: "mostly",
  salariedClassification: "all_salaried",
  handbookStatus: "none",
  harassmentTraining: "no",
  leaveProcess: "no",
  hrSupport: "none",
};

describe("buildOnPageResult", () => {
  it("exposes only named categories and severity, never the diagnosis or scope of work", () => {
    const engineResult = scoreComplianceAnswers(RISKY_ANSWERS);
    const onPage = buildOnPageResult(engineResult);
    const serialized = JSON.stringify(onPage);

    expect(onPage.categoryRisks.length).toBeGreaterThan(0);
    // Spot-check that no report-only text leaked into the gated view.
    expect(serialized).not.toContain("ABC test");
    expect(serialized).not.toContain("scopeOfWork");
    expect(serialized).not.toContain("Labor Code");
  });

  it("carries the booking URL and a visible not-legal-advice disclaimer", () => {
    const onPage = buildOnPageResult(scoreComplianceAnswers(RISKY_ANSWERS));
    expect(onPage.bookingUrl).toContain(
      "meetings.hubspot.com/bethechangehr/discoverycall",
    );
    expect(onPage.disclaimer.toLowerCase()).toContain("not legal advice");
  });
});

describe("buildReport", () => {
  it("includes the full diagnosis and full scope of work for every triggered gap", () => {
    const engineResult = scoreComplianceAnswers(RISKY_ANSWERS);
    const report = buildReport(engineResult, {
      generatedAt: "2026-07-08T00:00:00.000Z",
    });

    expect(report.gapSections.length).toBeGreaterThan(0);
    for (const section of report.gapSections) {
      for (const item of section.items) {
        expect(item.reportDiagnosis.length).toBeGreaterThan(0);
        expect(item.scopeOfWork.length).toBeGreaterThan(0);
        expect(item.sourceRef.length).toBeGreaterThan(0);
      }
    }
  });

  it("includes the $200K industry anchor framed as an industry figure, not a guarantee", () => {
    const report = buildReport(scoreComplianceAnswers(RISKY_ANSWERS), {
      generatedAt: "2026-07-08T00:00:00.000Z",
    });
    expect(report.industryContext.amountUsd).toBe(200000);
    expect(report.industryContext.framing.toLowerCase()).toContain("not a");
  });

  it("groups gap items under their category, matching the engine's category risks", () => {
    const engineResult = scoreComplianceAnswers(RISKY_ANSWERS);
    const report = buildReport(engineResult, {
      generatedAt: "2026-07-08T00:00:00.000Z",
    });
    const reportCategories = report.gapSections.map((s) => s.category).sort();
    const engineCategories = engineResult.categoryRisks
      .map((c) => c.category)
      .sort();
    expect(reportCategories).toEqual(engineCategories);
  });
});

describe("buildEmailPayload", () => {
  it("builds merge fields from the engine result and includes the report URL", () => {
    const engineResult = scoreComplianceAnswers(RISKY_ANSWERS);
    const payload = buildEmailPayload(engineResult, {
      toEmail: "owner@example.com",
      reportUrl: "https://example.com/report/abc123",
      firstName: "Jordan",
    });

    expect(payload.toEmail).toBe("owner@example.com");
    expect(payload.reportUrl).toBe("https://example.com/report/abc123");
    expect(payload.mergeFields.firstName).toBe("Jordan");
    expect(payload.mergeFields.grade).toBe(engineResult.grade);
    expect(payload.mergeFields.gapCount).toBe(
      engineResult.triggeredGapIds.length,
    );
  });

  it("falls back to a generic greeting when no first name is given", () => {
    const payload = buildEmailPayload(scoreComplianceAnswers(RISKY_ANSWERS), {
      toEmail: "owner@example.com",
      reportUrl: "https://example.com/report/abc123",
    });
    expect(payload.mergeFields.firstName).toBe("there");
  });
});

describe("buildQualificationTag", () => {
  it("tags no-HR-support as the highest lead priority", () => {
    expect(buildQualificationTag("none").leadPriority).toBe("high");
    expect(buildQualificationTag("outside").leadPriority).toBe("medium");
    expect(buildQualificationTag("in_house").leadPriority).toBe("standard");
  });
});
