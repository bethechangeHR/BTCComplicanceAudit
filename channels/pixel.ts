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
 */

export function isPixelEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_PIXEL === "true";
}

export function getMetaPixelId(): string | undefined {
  return process.env.NEXT_PUBLIC_META_PIXEL_ID || undefined;
}

export function generateEventId(): string {
  return crypto.randomUUID();
}
