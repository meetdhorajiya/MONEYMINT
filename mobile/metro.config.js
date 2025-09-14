// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// ✅ wrap with withNativeWind
module.exports = withNativeWind(config, { input: "./app/global.css" });