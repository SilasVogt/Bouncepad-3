import { query } from "./_generated/server";

// Simple test query to verify Convex connection
export const ping = query({
  args: {},
  handler: async () => {
    return { status: "connected", timestamp: Date.now() };
  },
});
