import type { NextConfig } from "next";
import { execSync } from "child_process";
import pkg from "./package.json";

// Shown in the footer so a deploy can be recognised: the version is bumped by
// hand in package.json, the build time/commit are filled in on every build.
function gitCommit() {
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return "";
  }
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version,
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
    NEXT_PUBLIC_GIT_COMMIT: gitCommit(),
  },
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
