const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

// Get the monorepo root (two levels up from apps/mobile)
const monorepoRoot = path.resolve(__dirname, "../..");

const config = getDefaultConfig(__dirname);

// Watch the root convex folder for changes
config.watchFolders = [
  path.resolve(monorepoRoot, "convex"),
  path.resolve(monorepoRoot, "node_modules"),
];

// Add node_modules locations for monorepo structure
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// Resolve @convex alias to the root convex folder
config.resolver.extraNodeModules = {
  "@convex": path.resolve(monorepoRoot, "convex"),
};

module.exports = withNativeWind(config, { input: "./global.css" });
