const { getDefaultConfig } = require("expo/metro-config");
const { withUniwindConfig } = require("uniwind/metro");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

// Get the default Expo config first
const defaultConfig = getDefaultConfig(projectRoot);

// Configure for monorepo
const config = {
  ...defaultConfig,
  projectRoot,
  watchFolders: [monorepoRoot],
  resolver: {
    ...defaultConfig.resolver,
    nodeModulesPaths: [
      path.resolve(projectRoot, "node_modules"),
      path.resolve(monorepoRoot, "node_modules"),
    ],
    // DO NOT disable hierarchical lookup - we need it for transitive deps
    disableHierarchicalLookup: false,
  },
};

module.exports = withUniwindConfig(config, {
  cssEntryFile: "./src/global.css",
  dtsFile: "./src/uniwind-types.d.ts",
});
