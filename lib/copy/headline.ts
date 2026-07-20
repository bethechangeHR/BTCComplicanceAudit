/**
 * lib/copy/headline.ts
 *
 * Centralized landing headline copy, split by variant so a Meta ad can point
 * at ?v=<slug> and roll up through the existing UTM/fbclid capture with no
 * experiment framework or client-side randomization. Add a new variant here,
 * link a new ad to it, done. "control" is the default and the fallback for
 * an unknown or missing param, see channels/resolveMode.ts resolveHeadlineVariant.
 * Voice rules per CLAUDE.md: direct, a little urgent, no banned words
 * (navigate, clarity, high-touch, values-driven, thoughtful, meaningful,
 * empower, journey, holistic, elevate, impactful, foster), no em or en dashes,
 * no pricing, no company-specific legal claim.
 */

export type HeadlineVariant = "control" | "dream";

export interface HeadlineCopy {
  headline: string;
}

export const DEFAULT_HEADLINE_VARIANT: HeadlineVariant = "control";

export const HEADLINE_VARIANTS: Record<HeadlineVariant, HeadlineCopy> = {
  control: {
    headline:
      "The HR gaps exposing your California business, before they become a claim.",
  },
  dream: {
    headline:
      "Know exactly where your California HR stands, in about 90 seconds.",
  },
};

export function resolveHeadlineVariant(
  value: string | undefined,
): HeadlineVariant {
  if (value === "dream") return "dream";
  return DEFAULT_HEADLINE_VARIANT;
}
