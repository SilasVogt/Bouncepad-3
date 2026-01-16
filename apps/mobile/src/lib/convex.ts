import { ConvexReactClient } from "convex/react";
import Constants from "expo-constants";

const convexUrl = Constants.expoConfig?.extra?.convexUrl as string | undefined;

// Allow app to run without Convex configured (for initial development)
export const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;
