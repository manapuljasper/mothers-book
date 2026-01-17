import type { NextConfig } from "next";
import path from "path";

const convexPath = path.resolve(__dirname, "../../convex");

const nextConfig: NextConfig = {
  // Turbopack configuration (Next.js 16+ default bundler)
  turbopack: {
    resolveAlias: {
      "@convex": convexPath,
    },
  },
  // Webpack fallback for production builds
  webpack: (config) => {
    config.resolve.alias["@convex"] = convexPath;
    return config;
  },
};

export default nextConfig;
