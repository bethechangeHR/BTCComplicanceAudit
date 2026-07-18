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
 * shared event_id convention. Per the 2026-07-14 launch plan (Section 3c),
 * ToolStart and Lead both need a server-side CAPI twin sharing this same
 * id, so callers that post to a server route (app/api/tool-start,
 * app/api/submit) must generate the id once and pass it to BOTH
 * trackPixelEvent() and the server POST body, not let trackPixelEvent
 * generate its own. ToolComplete and PageView stay client-only (PageView
 * fires from the base snippet in components/MetaPixel.tsx, ToolComplete is
 * not part of the plan's 3-event set), so trackPixelEvent still generates
 * its own id when the caller does not supply one.
 *
 * getFbCookies() / buildFbcFromClickId() read/derive the fbp and fbc
 * match-key values Meta's CAPI matching wants alongside hashed email/phone
 * (Section 3d, EMQ 6+ target). fbp is set by the base pixel snippet itself;
 * fbc is set by the base snippet too when it sees an fbclid in the URL, so
 * the cookie is preferred. buildFbcFromClickId() is the fallback for the
 * rare race where a server POST fires before the base snippet has had a
 * chance to set the _fbc cookie yet.
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

/**
 * Builds a v4-shaped UUID from crypto.getRandomValues, for runtimes that
 * have the Web Crypto API but not the newer randomUUID() convenience method
 * (older WebView builds in particular). Sets the version (4) and variant
 * bits per RFC 4122 section 4.4, formatted as the standard 8-4-4-4-12 hex
 * string.
 */
function uuidFromRandomValues(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
    "",
  );
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * Must never throw. This id is generated synchronously on the first answer
 * tap (see components/ComplianceCheckApp.tsx handleAnswer), and older
 * in-app WebViews (Facebook/Instagram browser, iOS below 15.4) can lack
 * crypto.randomUUID entirely. A throw here used to freeze the tool on
 * question 1 before the UI could advance, which is what took a real Meta
 * campaign from 223 landing views to 0 ToolStart events, all on mobile
 * in-app browsers. The fallback chain only needs to produce a string that
 * is shared between the browser Pixel fire and the server-side CAPI twin
 * for dedup, it does not need to be a spec-perfect UUID.
 */
export function generateEventId(): string {
  try {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return crypto.randomUUID();
    }
  } catch {
    // Fall through to the next strategy.
  }
  try {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.getRandomValues === "function"
    ) {
      return uuidFromRandomValues();
    }
  } catch {
    // Fall through to the final strategy.
  }
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Reads the _fbp and _fbc cookies the Meta base pixel snippet sets on this
 * domain. Returns undefined for either that is not present (pixel disabled,
 * ad blocker, or the fbc race described above). Browser-only, no-ops to {}
 * on the server.
 */
export function getFbCookies(): { fbp?: string; fbc?: string } {
  if (typeof document === "undefined") return {};
  const cookies = document.cookie
    .split(";")
    .reduce<Record<string, string>>((acc, part) => {
      const [key, ...rest] = part.trim().split("=");
      if (key) acc[key] = rest.join("=");
      return acc;
    }, {});
  return { fbp: cookies["_fbp"], fbc: cookies["_fbc"] };
}

/**
 * Builds an fbc value from a raw fbclid per Meta's documented format
 * (fb.1.<click_timestamp_ms>.<fbclid>), for the fallback case where no
 * _fbc cookie exists yet. subdomainIndex is fixed at 1 per Meta's own
 * example, this is not a real subdomain depth count.
 */
export function buildFbcFromClickId(fbclid: string): string {
  return `fb.1.${Date.now()}.${fbclid}`;
}

/**
 * Safely fires a Meta Pixel custom event. No-ops silently (never throws)
 * unless the pixel is enabled, running in the browser, and the base snippet
 * has already defined window.fbq. Never pass PII (email, phone, name) in
 * params, these are marketing conversion events, not the data pipeline.
 *
 * Pass eventId explicitly for any event that also gets sent server-side via
 * CAPI (ToolStart, Lead) so Meta dedupes the pair instead of double
 * counting. Omit it for client-only events (ToolComplete) and one will be
 * generated internally.
 */
export function trackPixelEvent(
  eventName: string,
  params?: Record<string, unknown>,
  eventId?: string,
): void {
  if (!isPixelEnabled()) return;
  if (typeof window === "undefined") return;
  if (typeof window.fbq !== "function") return;
  window.fbq("track", eventName, params, {
    eventID: eventId ?? generateEventId(),
  });
}
