/**
 * channels/resolveMode.ts
 *
 * Resolves the channel mode and captures fbclid from URL search params.
 * Email mode requires an explicit mode=email param (a targeted, pre-filled
 * future link). Paid mode is the default for any anonymous visitor,
 * including a bare visit with no mode param at all.
 */

import type { ChannelMode } from "./types";

export function resolveChannelMode(searchParams: URLSearchParams): ChannelMode {
  const mode = searchParams.get("mode");
  if (mode === "email") return "email";
  return "paid";
}

/**
 * Captures fbclid from the landing URL so it can be stored with the
 * eventual HubSpot contact. Without it, Meta cannot attribute a later
 * booked call back to the ad. Read once on first page load and threaded
 * through client state, since fbclid disappears from the URL after any
 * client-side navigation.
 */
export function captureFbclid(
  searchParams: URLSearchParams,
): string | undefined {
  return searchParams.get("fbclid") ?? undefined;
}
