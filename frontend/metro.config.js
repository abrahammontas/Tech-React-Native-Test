const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Force Metro to avoid Node-only builds (like axios/dist/node/*)
config.resolver.resolverMainFields = ["react-native", "browser", "main"];

// IMPORTANT: avoid resolving via package "exports" that may pick "node"
config.resolver.unstable_enablePackageExports = false;

module.exports = config;