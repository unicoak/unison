import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Homework attachments (photos/video) are uploaded through a server
      // action; on some hosts the platform's own proxy still caps request
      // bodies regardless of this setting.
      bodySizeLimit: "210mb",
    },
  },
};

export default nextConfig;
