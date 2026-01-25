import { ConvexReactClient } from "convex/react";

// In Expo SDK 50+, EXPO_PUBLIC_* env vars are available directly via process.env
const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;

// Allow app to run without Convex configured (for initial development)
export const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;
