import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Fixes the multiple lockfile / workspace root warning
  outputFileTracingRoot: path.join(__dirname, "."),

  // Image domains / remote patterns for Clerk avatars
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
        port: "",
        pathname: "/**",
      },
    ],
  },

  eslint: {
    ignoreDuringBuilds: true, // optional: ignore ESLint errors in dev
  },
};

export default nextConfig;
