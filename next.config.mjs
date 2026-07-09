import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pins the tracing root to this project instead of letting Next.js walk
  // up looking for a workspace root. Without this, output file tracing on
  // Windows can misresolve entries several directories up this repo's deep
  // nested folder tree (apps/.../BTC/...) and throw EISDIR on readlink.
  outputFileTracingRoot: path.join(process.cwd()),
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
