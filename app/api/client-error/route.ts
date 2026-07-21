/**
 * app/api/client-error/route.ts
 *
 * Added 2026-07-21. Receives caught client-side errors from
 * components/ClientErrorBeacon.tsx and logs them server-side so they are
 * visible in Vercel logs even when no webhook URL is configured. This is the
 * server-visible half of crash detection: a frozen in-app WebView can swallow
 * a browser-only beacon, so the fact that the POST arrives (and its userAgent)
 * is itself the signal. This exists to catch the exact failure class that once
 * took a campaign from 223 landing views to 0 ToolStart (see channels/pixel.ts).
 * No PII.
 */

import { NextRequest, NextResponse } from "next/server";
import { fireClientErrorWebhook } from "@/channels/webhook";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const message =
    typeof body.message === "string" ? body.message.slice(0, 500) : "unknown";
  const source = typeof body.source === "string" ? body.source : undefined;
  const url = typeof body.url === "string" ? body.url : undefined;
  // Prefer the request header UA (server-observed) and fall back to the
  // client-reported one only if the header is missing.
  const userAgent =
    request.headers.get("user-agent") ??
    (typeof body.userAgent === "string" ? body.userAgent : undefined);

  // eslint-disable-next-line no-console
  console.error("[client_error]", { message, source, url, userAgent });

  await fireClientErrorWebhook({
    message,
    source,
    url,
    userAgent,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
