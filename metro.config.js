const path = require('path');

const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

function escapeRegExp(value) {
  return value.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
}

function pathToPattern(value) {
  return value
    .split(path.sep)
    .map(escapeRegExp)
    .join('[\\\\/]');
}

function createNestedNodeModulesPattern(relativePath) {
  const absolutePath = path.resolve(__dirname, relativePath);

  return new RegExp(`^${pathToPattern(absolutePath)}(?:[\\\\/].*)?$`);
}

config.resolver.blockList = [
  ...config.resolver.blockList,
  // The local file: dependency is copied with its package-local test node_modules.
  // Blocking those paths prevents Metro from pulling duplicate React / Expo copies.
  createNestedNodeModulesPattern(
    'node_modules/@fishonfire/bubbles-expo/node_modules',
  ),
  createNestedNodeModulesPattern('bubbles-notifications-expo/node_modules'),
];

module.exports = config;
