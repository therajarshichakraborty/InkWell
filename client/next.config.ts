import type { NextConfig } from "next";
import { API_URL } from "./lib/env";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: { root: import.meta.dirname },
  images: {
    localPatterns: [{ pathname: "/api/uploads/**" }],
  },
  async rewrites() {
    return {
      beforeFiles: [{ source: "/api/:path*", destination: `${API_URL}/api/:path*` }],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
