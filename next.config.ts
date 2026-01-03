import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['yahoo-finance2'],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
