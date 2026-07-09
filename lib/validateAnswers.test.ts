import { describe, expect, it } from "vitest";
import { isValidEmail, validateComplianceAnswers } from "./validateAnswers";

const VALID_ANSWERS = {
  headcount: "10-49",
  states: "california_only",
  contractorUse: "none",
  salariedClassification: "hourly",
  handbookStatus: "current",
  harassmentTraining: "yes",
  leaveProcess: "yes",
  newHirePaperwork: "complete",
  hrSupport: "in_house",
};

describe("validateComplianceAnswers", () => {
  it("accepts a fully valid answer set", () => {
    expect(validateComplianceAnswers(VALID_ANSWERS)).toEqual(VALID_ANSWERS);
  });

  it("rejects a missing field", () => {
    const { hrSupport, ...missing } = VALID_ANSWERS;
    expect(validateComplianceAnswers(missing)).toBeNull();
  });

  it("rejects an invalid answer value not in the locked option set", () => {
    expect(
      validateComplianceAnswers({ ...VALID_ANSWERS, headcount: "9999" }),
    ).toBeNull();
  });

  it("rejects non-object input", () => {
    expect(validateComplianceAnswers(null)).toBeNull();
    expect(validateComplianceAnswers("a string")).toBeNull();
    expect(validateComplianceAnswers(42)).toBeNull();
  });
});

describe("isValidEmail", () => {
  it("accepts a plausible email", () => {
    expect(isValidEmail("owner@example.com")).toBe(true);
  });

  it("rejects obviously malformed input", () => {
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail(undefined)).toBe(false);
  });
});
