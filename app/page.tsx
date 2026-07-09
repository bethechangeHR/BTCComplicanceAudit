import { ComplianceCheckApp } from "@/components/ComplianceCheckApp";
import { resolveChannelMode, captureFbclid } from "@/channels/resolveMode";

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

  return <ComplianceCheckApp mode={mode} fbclid={fbclid} />;
}
