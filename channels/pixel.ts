/**
 * channels/pixel.ts
 *
 * Feature-flagged Meta Pixel + Conversions API (CAPI) hooks. OFF by default
 * (NEXT_PUBLIC_ENABLE_PIXEL unset or not "true"). Never hardwire a pixel ID.
 * Do not enable in any real environment before the Hard Gates in CLAUDE.md
 * clear (pixel/CAPI events live before spend is gate 5).
 *
 * generateEventId() produces the shared id used to dedupe the browser
 * Pixel fire against the server-side CAPI fire, per the BTC funnel spec's
 * shared event_id convention.
 *
 * Event wiring (client-side Pixel only, no server-side CAPI yet, that is a
 * future phase): PageView fires automatically from the base snippet in
 * components/MetaPixel.tsx. ToolStart, Lead, and ToolComplete are fired via
 * trackPixelEvent() below from components/ComplianceCheckApp.tsx.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function isPixelEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_PIXEL === "true";
}

export function getMetaPixelId(): string | undefined {
  return process.env.NEXT_PUBLIC_META_PIXEL_ID || undefined;
}

export function generateEventId(): string {
  return crypto.randomUUID();
}

/**
 * Safely fires a Meta Pixel custom event. No-ops silently (never throws)
 * unless the pixel is enabled, running in the browser, and the base snippet
 * has already defined window.fbq. Never pass PII (email, phone, name) in
 * params, these are marketing conversion events, not the data pipeline.
 */
export function trackPixelEvent(
  eventName: string,
  params?: Record<string, unknown>,
): void {
  if (!isPixelEnabled()) return;
  if (typeof window === "undefined") return;
  if (typeof window.fbq !== "function") return;
  window.fbq("track", eventName, params, { eventID: generateEventId() });
}
