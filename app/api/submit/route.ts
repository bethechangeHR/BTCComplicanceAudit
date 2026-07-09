/**
 * app/api/submit/route.ts
 *
 * Receives the email/phone gate submission at the grade reveal. Recomputes
 * the grade server-side from the submitted answers (never trusts a
 * client-computed grade), signs a stateless report token, returns the
 * report URL to the client immediately, and fires the tool_complete event
 * to the private n8n webhook (which upserts the HubSpot contact and
 * triggers the report email, SMS, and nurture) in the background via
 * `after()` so the response is not held up waiting on n8n/webhook latency.
 *
 * `after()` is imported from `next/server` rather than `waitUntil`: this
 * installed Next.js version (15.5.20, confirmed via
 * node_modules/next/server.js) exports `after`, not a standalone
 * `waitUntil`, as its documented API for running work after a response has
 * been sent while keeping the serverless function alive for it. This is
 * the same mechanism the plan's `waitUntil` reference describes, under the
 * name this Next.js version actually ships.
 */

import { NextRequest, NextResponse, after } from "next/server";
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

  try {
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

    // Fire the webhook after the response has been sent, so grade reveal
    // does not wait on n8n latency. Wrapped in its own try/catch: a webhook
    // failure here must never throw unhandled after the client already has
    // its response, it should only be logged server-side.
    after(async () => {
      try {
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
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("[api/submit] background webhook fire failed:", error);
      }
    });

    return NextResponse.json({
      reportUrl,
      onPageResult: buildOnPageResult(result),
    });
  } catch (error) {
    // Most likely cause: REPORT_TOKEN_SECRET is not set in this
    // environment (see lib/token.ts). Log the real error server-side so
    // it's visible in Vercel function logs, but never leak internals to
    // the client.
    // eslint-disable-next-line no-console
    console.error("[api/submit] failed to generate report:", error);
    return NextResponse.json(
      {
        error:
          "We couldn't generate your report right now. Please try again in a moment.",
      },
      { status: 500 },
    );
  }
}
