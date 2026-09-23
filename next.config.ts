import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  cacheLife: {
    // Public season data: admin saves refresh it at once via updateTag; this bounds anything else.
    events: { stale: 30, revalidate: 300, expire: 3600 },
  },
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;
