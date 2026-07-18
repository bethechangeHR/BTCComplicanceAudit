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
  states: "multi_state_ca",
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

  it("carries the industry cost-of-inaction anchor, framed as an industry figure not a guarantee, added 2026-07-18 P2.2", () => {
    const onPage = buildOnPageResult(scoreComplianceAnswers(RISKY_ANSWERS));
    expect(onPage.industryContext.amountUsd).toBe(200000);
    expect(onPage.industryContext.framing.toLowerCase()).toContain("not a");
    const serialized = JSON.stringify(onPage);
    expect(serialized).not.toContain("ABC test");
    expect(serialized).not.toContain("scopeOfWork");
    expect(serialized).not.toContain("Labor Code");
  });

  it("carries a lead priority derived from the qualification tag, added 2026-07-18 P2.3", () => {
    const onPage = buildOnPageResult(
      scoreComplianceAnswers({ ...RISKY_ANSWERS, hrSupport: "none" }),
    );
    expect(onPage.leadPriority).toBe("high");
    const inHouse = buildOnPageResult(
      scoreComplianceAnswers({ ...RISKY_ANSWERS, hrSupport: "in_house" }),
    );
    expect(inHouse.leadPriority).toBe("standard");
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

describe("booking URL prefill, added 2026-07-18 P3", () => {
  it("always carries UTM attribution even with no contact info", () => {
    const onPage = buildOnPageResult(scoreComplianceAnswers(RISKY_ANSWERS));
    const url = new URL(onPage.bookingUrl);
    expect(url.searchParams.get("utm_campaign")).toBe("ca-hr-risk-audit");
    expect(url.searchParams.get("utm_source")).toBe("landing-page-cta");
    expect(url.searchParams.get("utm_medium")).toBe("web");
    expect(url.searchParams.has("firstname")).toBe(false);
    expect(url.searchParams.has("email")).toBe(false);
  });

  it("prefills firstname, lastname, email, company, and phone when a contact is given", () => {
    const onPage = buildOnPageResult(scoreComplianceAnswers(RISKY_ANSWERS), {
      name: "Jordan Smith",
      email: "jordan@example.com",
      company: "Acme Co",
      phone: "+15555550100",
    });
    const url = new URL(onPage.bookingUrl);
    expect(url.searchParams.get("firstname")).toBe("Jordan");
    expect(url.searchParams.get("lastname")).toBe("Smith");
    expect(url.searchParams.get("email")).toBe("jordan@example.com");
    expect(url.searchParams.get("company")).toBe("Acme Co");
    expect(url.searchParams.get("phone")).toBe("+15555550100");
    // UTMs are unaffected by prefill.
    expect(url.searchParams.get("utm_campaign")).toBe("ca-hr-risk-audit");
  });

  it("degrades gracefully with only a partial contact, and never appends an empty param", () => {
    const onPage = buildOnPageResult(scoreComplianceAnswers(RISKY_ANSWERS), {
      email: "solo@example.com",
    });
    const url = new URL(onPage.bookingUrl);
    expect(url.searchParams.get("email")).toBe("solo@example.com");
    expect(url.searchParams.has("firstname")).toBe(false);
    expect(url.searchParams.has("lastname")).toBe(false);
    expect(url.searchParams.has("company")).toBe(false);
    expect(url.searchParams.has("phone")).toBe(false);
  });

  it("splits a single name field into firstname and lastname on the hosted report booking link too", () => {
    const report = buildReport(scoreComplianceAnswers(RISKY_ANSWERS), {
      generatedAt: "2026-07-18T00:00:00.000Z",
      contactName: "Taylor Reyes Vega",
      email: "taylor@example.com",
    });
    const url = new URL(report.bookingUrl);
    expect(url.searchParams.get("firstname")).toBe("Taylor");
    expect(url.searchParams.get("lastname")).toBe("Reyes Vega");
  });
});
