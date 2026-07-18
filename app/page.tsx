import { ComplianceCheckApp } from "@/components/ComplianceCheckApp";
import { resolveChannelMode, captureFbclid } from "@/channels/resolveMode";
import { resolveHeadlineVariant } from "@/lib/copy/headline";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") usp.set(key, value);
  }

  const mode = resolveChannelMode(usp);
  const fbclid = captureFbclid(usp);
  // Ad-level A/B seam, see lib/copy/headline.ts. ?v=dream selects the
  // dream-outcome headline variant, anything else (including no param)
  // falls back to the control fear-frame headline.
  const headlineVariant = resolveHeadlineVariant(usp.get("v") ?? undefined);

  return (
    <ComplianceCheckApp
      mode={mode}
      fbclid={fbclid}
      headlineVariant={headlineVariant}
    />
  );
}
