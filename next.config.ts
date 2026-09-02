import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  experimental: {
    serverActions: {
      // Homework attachments (video in particular) are uploaded through a
      // server action today. On Vercel this still rides the platform's own
      // function payload cap regardless of this setting — see README for
      // the direct-to-Blob client upload upgrade needed before relying on
      // large video submissions in production.
      bodySizeLimit: "210mb",
    },
  },
};

export default nextConfig;
