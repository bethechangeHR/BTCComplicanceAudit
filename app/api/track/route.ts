/**
 * app/api/track/route.ts
 *
 * Receives the ungated tool_viewed event from the client on tool load. No
 * PII, no gate. A click alone is an interest signal and must be logged even
 * if the visitor never completes the tool. Posts server-side to the
 * private n8n webhook, see channels/webhook.ts for why this is server-side
 * rather than a direct client-to-n8n post.
 */

import { NextRequest, NextResponse } from "next/server";
import { fireToolViewedWebhook } from "@/channels/webhook";
import type { ChannelMode } from "@/channels/types";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const mode: ChannelMode = body.mode === "email" ? "email" : "paid";
  const fbclid = typeof body.fbclid === "string" ? body.fbclid : undefined;

  const result = await fireToolViewedWebhook({
    mode,
    timestamp: new Date().toISOString(),
    fbclid,
  });

  return NextResponse.json({ ok: true, sent: result.sent });
}
