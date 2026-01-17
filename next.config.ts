import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack configuration
  serverExternalPackages: ["buffer"],
};

export default nextConfig;
