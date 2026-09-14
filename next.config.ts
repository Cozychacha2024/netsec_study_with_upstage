import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return ["/sw.js", "/pwa-precache.js"].map(source => ({
      source,
      headers: [
        { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Service-Worker-Allowed", value: "/" },
      ],
    }));
  },
};

export default nextConfig;
