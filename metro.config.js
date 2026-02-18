const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const os = require('os');

// Polyfill for Node.js compatibility
if (!os.availableParallelism) {
  os.availableParallelism = () => os.cpus().length;
}

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
