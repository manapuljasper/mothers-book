import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Allow importing from the monorepo root convex folder
  webpack: (config) => {
    config.resolve.alias["@convex"] = path.resolve(__dirname, "../../convex");
    return config;
  },
  // Transpile the convex folder which is outside the app directory
  transpilePackages: [],
};

export default nextConfig;
