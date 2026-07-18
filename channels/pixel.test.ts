import { describe, expect, it, vi, afterEach } from "vitest";
import { generateEventId } from "./pixel";

describe("generateEventId", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a real UUID when crypto.randomUUID is available", () => {
    const id = generateEventId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it("falls back to crypto.getRandomValues when randomUUID throws, this is the mobile in-app-browser bug scenario", () => {
    const original = crypto.randomUUID;
    vi.spyOn(crypto, "randomUUID").mockImplementation(() => {
      throw new Error("randomUUID not supported");
    });

    const id = generateEventId();
    expect(id.length).toBeGreaterThan(0);
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );

    crypto.randomUUID = original;
  });

  it("falls back to a Date.now/Math.random string when neither crypto API is usable, and never throws", () => {
    const originalRandomUUID = crypto.randomUUID;
    const originalGetRandomValues = crypto.getRandomValues;
    vi.spyOn(crypto, "randomUUID").mockImplementation(() => {
      throw new Error("not supported");
    });
    vi.spyOn(crypto, "getRandomValues").mockImplementation(() => {
      throw new Error("not supported");
    });

    let id = "";
    expect(() => {
      id = generateEventId();
    }).not.toThrow();
    expect(id.length).toBeGreaterThan(0);
    expect(id).toMatch(/^evt-\d+-[0-9a-z]+$/);

    crypto.randomUUID = originalRandomUUID;
    crypto.getRandomValues = originalGetRandomValues;
  });

  it("produces a different id on every call, so two events never accidentally dedupe against each other", () => {
    const a = generateEventId();
    const b = generateEventId();
    expect(a).not.toBe(b);
  });
});
