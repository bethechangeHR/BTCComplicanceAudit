/**
 * app/api/submit/route.ts
 *
 * Receives the email/phone gate submission at the grade reveal. Recomputes
 * the grade server-side from the submitted answers (never trusts a
 * client-computed grade), signs a stateless report token, fires the
 * tool_complete event to the private n8n webhook with the full submission
 * (which upserts the HubSpot contact and triggers the report email, SMS,
 * and nurture), and returns the report URL to the client.
 */

import { NextRequest, NextResponse } from "next/server";
import { scoreComplianceAnswers } from "@/lib/engine";
import { buildOnPageResult } from "@/lib/recommendation";
import { validateComplianceAnswers, isValidEmail } from "@/lib/validateAnswers";
import { signReportToken } from "@/lib/token";
import { fireToolCompleteWebhook } from "@/channels/webhook";
import type { ChannelMode } from "@/channels/types";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const answers = validateComplianceAnswers(body.answers);
  if (!answers) {
    return NextResponse.json(
      { error: "Invalid or incomplete answers" },
      { status: 400 },
    );
  }

  if (!isValidEmail(body.email)) {
    return NextResponse.json(
      { error: "A valid email is required" },
      { status: 400 },
    );
  }

  const mode: ChannelMode = body.mode === "email" ? "email" : "paid";
  const email: string = body.email;
  const phone: string | undefined =
    typeof body.phone === "string" ? body.phone : undefined;
  const smsOptIn: boolean = Boolean(body.smsOptIn) && Boolean(phone);
  const company: string | undefined =
    typeof body.company === "string" ? body.company : undefined;
  const name: string | undefined =
    typeof body.name === "string" ? body.name : undefined;
  const fbclid: string | undefined =
    typeof body.fbclid === "string" ? body.fbclid : undefined;

  const result = scoreComplianceAnswers(answers);
  const createdAt = new Date().toISOString();

  const token = signReportToken({
    answers,
    email,
    company,
    name,
    phone,
    smsOptIn,
    createdAt,
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const reportUrl = `${siteUrl.replace(/\/$/, "")}/report/${token}`;

  await fireToolCompleteWebhook({
    mode,
    timestamp: createdAt,
    email,
    phone,
    smsOptIn,
    company,
    name,
    fbclid,
    answers,
    grade: result.grade,
    score: result.score,
    maxPossibleScore: result.maxPossibleScore,
    triggeredGapIds: result.triggeredGapIds,
    qualificationTag: result.qualificationTag,
    reportUrl,
    source: "meta-paid",
  });

  return NextResponse.json({
    reportUrl,
    onPageResult: buildOnPageResult(result),
  });
}
