import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Photos are served straight from Vercel Blob (or the local dev store) as plain <img>,
  // so no remotePatterns are needed.
};

export default nextConfig;
