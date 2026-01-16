import { ConvexReactClient } from "convex/react";

const convexUrl = import.meta.env.VITE_CONVEX_URL;

// Allow app to run without Convex configured (for initial development)
export const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;
