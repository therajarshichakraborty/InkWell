import type { NextConfig } from "next";
import { API_URL } from "./lib/env";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: { root: import.meta.dirname },
  experimental: {
    // Reuse recently visited dynamic pages on back/forward and repeat navigations;
    // router.refresh() after a mutation still clears this cache.
    staleTimes: { dynamic: 30 },
  },
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
