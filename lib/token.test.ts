import { beforeEach, describe, expect, it } from "vitest";
import { signReportToken, verifyReportToken } from "./token";
import type { ComplianceAnswers } from "./engine/types";

const ANSWERS: ComplianceAnswers = {
  headcount: "10-49",
  states: "california_only",
  contractorUse: "some",
  salariedClassification: "mix",
  handbookStatus: "stale",
  harassmentTraining: "no",
  leaveProcess: "yes",
  newHirePaperwork: "partial",
  hrSupport: "outside",
};

beforeEach(() => {
  process.env.REPORT_TOKEN_SECRET = "test-only-secret-do-not-use-in-production";
});

describe("report token", () => {
  it("round-trips a signed payload back to the original answers", () => {
    const token = signReportToken({
      answers: ANSWERS,
      email: "owner@example.com",
      createdAt: "2026-07-08T00:00:00.000Z",
    });

    const decoded = verifyReportToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.answers).toEqual(ANSWERS);
    expect(decoded?.email).toBe("owner@example.com");
  });

  it("rejects a token whose payload was tampered with", () => {
    const token = signReportToken({
      answers: ANSWERS,
      email: "owner@example.com",
      createdAt: "2026-07-08T00:00:00.000Z",
    });

    const [encodedPayload, signature] = token.split(".");
    const tamperedPayload = Buffer.from(
      JSON.stringify({ ...ANSWERS, headcount: "150+" }),
    ).toString("base64url");
    const tamperedToken = `${tamperedPayload}.${signature}`;

    expect(verifyReportToken(tamperedToken)).toBeNull();
    expect(encodedPayload).not.toBe(tamperedPayload);
  });

  it("rejects a malformed token instead of throwing", () => {
    expect(verifyReportToken("not-a-real-token")).toBeNull();
    expect(verifyReportToken("")).toBeNull();
    expect(verifyReportToken("a.b.c")).toBeNull();
  });

  it("rejects a token signed with a different secret", () => {
    const token = signReportToken({
      answers: ANSWERS,
      email: "owner@example.com",
      createdAt: "2026-07-08T00:00:00.000Z",
    });

    process.env.REPORT_TOKEN_SECRET = "a-different-secret";
    expect(verifyReportToken(token)).toBeNull();
  });
});
