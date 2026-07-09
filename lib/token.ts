/**
 * lib/token.ts
 *
 * HMAC-signs the answer set (plus minimal contact context) into a URL-safe
 * token so the hosted report page (app/report/[token]) is stateless: no
 * database, the page recomputes the grade and report by re-running the pure
 * engine on the decoded answers. Tamper-evident: editing the token
 * invalidates the signature rather than silently changing the grade shown.
 */

import { createHmac, timingSafeEqual } from "crypto";
import type { ComplianceAnswers } from "./engine/types";

export interface ReportTokenPayload {
  answers: ComplianceAnswers;
  email: string;
  company?: string;
  name?: string;
  phone?: string;
  smsOptIn?: boolean;
  /** ISO timestamp, when this report was generated. */
  createdAt: string;
}

function getSecret(): string {
  const secret = process.env.REPORT_TOKEN_SECRET;
  if (!secret) {
    throw new Error(
      "REPORT_TOKEN_SECRET is not set. Set it in .env.local for development " +
        "and as a real random secret in production, see .env.example.",
    );
  }
  return secret;
}

function sign(encodedPayload: string): string {
  return createHmac("sha256", getSecret())
    .update(encodedPayload)
    .digest("base64url");
}

function timingSafeEqualStrings(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function signReportToken(payload: ReportTokenPayload): string {
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

/**
 * Returns the decoded payload if the token's signature is valid, otherwise
 * null. Never throws on malformed or tampered input, callers treat null as
 * "report not found."
 */
export function verifyReportToken(token: string): ReportTokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [encodedPayload, signature] = parts;
  if (!encodedPayload || !signature) return null;

  if (!timingSafeEqualStrings(signature, sign(encodedPayload))) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    );
    return parsed as ReportTokenPayload;
  } catch {
    return null;
  }
}
