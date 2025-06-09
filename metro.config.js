const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ajustes para compatibilidade com Firebase Auth
config.resolver.sourceExts.push('cjs');
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
