import type { NextConfig } from "next";
import { withPostHogConfig } from "@posthog/nextjs-config";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      }
    ]
  },
  cacheComponents: true,
  reactCompiler: true,
  /* config options here */
};

export default withPostHogConfig(nextConfig, {
  personalApiKey: 'phx_p5kl3u6UCEorbO8DRTO08bLJjkcO2qmHnvwxp5rWbs025Bd', // Your personal API key from PostHog settings
  envId: '117102', // Your environment ID (project ID)
  host: 'https://eu.i.posthog.com', // Optional: Your PostHog instance URL, defaults to https://us.posthog.com
  sourcemaps: { // Optional
    enabled: true, // Optional: Enable sourcemaps generation and upload, defaults to true on production builds
    project: "dev", // Optional: Project name, defaults to git repository name
    version: "1.0.0", // Optional: Release version, defaults to current git commit
    deleteAfterUpload: true, // Optional: Delete sourcemaps after upload, defaults to true
  },
});

