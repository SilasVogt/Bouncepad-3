import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Bouncepad",
  slug: "bouncepad",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  scheme: "bouncepad",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#0a0a0a",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.bouncepad.app",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#0a0a0a",
    },
    package: "com.bouncepad.app",
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/favicon.png",
  },
  plugins: ["expo-router", "expo-secure-store"],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    clerkPublishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    convexUrl: process.env.EXPO_PUBLIC_CONVEX_URL,
  },
});
