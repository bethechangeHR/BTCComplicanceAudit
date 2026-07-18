import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pins the tracing root to this project instead of letting Next.js walk
  // up looking for a workspace root. Without this, output file tracing on
  // Windows can misresolve entries several directories up this repo's deep
  // nested folder tree (apps/.../BTC/...) and throw EISDIR on readlink.
  outputFileTracingRoot: path.join(process.cwd()),
  // Branded booking link for A2P/SMS compliance. Every sample message and the
  // campaign description must use a URL on the registered brand domain, not a
  // third-party domain like meetings.hubspot.com (that mismatch is what got the
  // A2P campaign rejected under Twilio error 30886). audit.bethechangehr.com is
  // a subdomain of the registered brand domain, so /book satisfies the rule and
  // 307-redirects to the live HubSpot scheduler. Kept temporary (not permanent)
  // so the destination can be repointed later without fighting browser cache.
  async redirects() {
    return [
      {
        source: "/book",
        destination:
          "https://meetings.hubspot.com/bethechangehr/discoverycall",
        permanent: false,
      },
    ];
  },
  webpack: (config) => {
    // Disables webpack's persistent filesystem cache. Suspected implicated
    // in a Windows-only "EISDIR: illegal operation on a directory, readlink"
    // build failure seen locally with Node 24; see VERIFICATION.md open
    // items. Does not affect correctness, only local build cache reuse.
    config.cache = false;
    return config;
  },
};

export default nextConfig;
