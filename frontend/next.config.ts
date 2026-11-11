import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emits a minimal self-contained server in .next/standalone (used by frontend/Dockerfile).
  output: "standalone",
};

export default nextConfig;
