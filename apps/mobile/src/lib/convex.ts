import { ConvexReactClient } from "convex/react";
import Constants from "expo-constants";

const convexUrl = Constants.expoConfig?.extra?.convexUrl as string;

if (!convexUrl) {
  throw new Error("Missing CONVEX_URL in app.config extra");
}

export const convex = new ConvexReactClient(convexUrl);
