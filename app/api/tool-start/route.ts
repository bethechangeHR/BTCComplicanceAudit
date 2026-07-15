/**
 * app/api/tool-start/route.ts
 *
 * Added 2026-07-14 for the Meta launch (btc-meta-launch-tracking-plan
 * Section 3b/3c). Receives the ToolStart signal the client fires the first
 * time a visitor answers Q1 (components/ComplianceCheckApp.tsx), the same
 * moment trackPixelEvent("ToolStart", ...) fires the browser Pixel event.
 * This route is the server-side CAPI twin: it captures IP and user agent
 * server-side (never trust a client-reported IP), forwards fbp/fbc/eventId
 * as-is, and posts to n8n, which sends the matching server-side ToolStart
 * event to Meta CAPI using the same eventId so the pair dedupes into one
 * event instead of two.
 *
 * No PII here, mirrors app/api/track/route.ts's shape and reasoning for why
 * this is a server route rather than a direct client-to-n8n post.
 */

import { NextRequest, NextResponse } from "next/server";
import { fireToolStartWebhook } from "@/channels/webhook";
import type { ChannelMode } from "@/channels/types";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const mode: ChannelMode = body.mode === "email" ? "email" : "paid";
  const fbclid = typeof body.fbclid === "string" ? body.fbclid : undefined;
  const eventId = typeof body.eventId === "string" ? body.eventId : undefined;
  const fbp = typeof body.fbp === "string" ? body.fbp : undefined;
  const fbc = typeof body.fbc === "string" ? body.fbc : undefined;

  const ipAddress: string | undefined =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    undefined;
  const userAgent = request.headers.get("user-agent") ?? undefined;

  const result = await fireToolStartWebhook({
    mode,
    timestamp: new Date().toISOString(),
    fbclid,
    eventId,
    fbp,
    fbc,
    ipAddress,
    userAgent,
  });

  return NextResponse.json({ ok: true, sent: result.sent });
}
