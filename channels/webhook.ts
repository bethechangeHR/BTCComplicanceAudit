/**
 * channels/webhook.ts
 *
 * Fires tool events to a configurable outbound n8n webhook URL read from a
 * private (non-public) environment variable. Never hardcode a URL. Called
 * only from server-side API routes (app/api/track, app/api/submit), never
 * directly from client components, see channels/types.ts for why.
 *
 * If the env var is unset (local dev, or not yet configured), logs the
 * payload to the console instead of throwing, so local development and the
 * /preview QA route never require a live endpoint.
 */

import type {
  SubmitPayload,
  ToolStartPayload,
  ToolViewedPayload,
} from "./types";

type WebhookResult = { sent: boolean; reason?: string };

async function postEvent(
  event: string,
  payload: Record<string, unknown>,
): Promise<WebhookResult> {
  const url = process.env.COMPLIANCE_CHECK_WEBHOOK_URL;

  if (!url) {
    // eslint-disable-next-line no-console
    console.log(
      `[${event}] COMPLIANCE_CHECK_WEBHOOK_URL is not set, logging payload instead of sending:`,
      payload,
    );
    return { sent: false, reason: "webhook_url_not_configured" };
  }

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, ...payload }),
    });
    return { sent: true };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`[${event}] webhook send failed:`, error);
    return { sent: false, reason: "network_error" };
  }
}

export async function fireToolViewedWebhook(
  payload: ToolViewedPayload,
): Promise<WebhookResult> {
  return postEvent("tool_viewed", { ...payload });
}

export async function fireToolCompleteWebhook(
  payload: SubmitPayload,
): Promise<WebhookResult> {
  return postEvent("tool_complete", { ...payload });
}

/**
 * tool_start, added 2026-07-14. This is the launch plan's ToolStart
 * optimization event (Section 4), the one the prospecting ad set actually
 * optimizes on at $30/day. Fires once, the first time a visitor answers Q1,
 * from app/api/tool-start/route.ts. Carries the CAPI match keys so n8n can
 * send the server-side twin of the client Pixel fire.
 */
export async function fireToolStartWebhook(
  payload: ToolStartPayload,
): Promise<WebhookResult> {
  return postEvent("tool_start", { ...payload });
}
