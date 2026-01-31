// clerkClient is pre-configured by @clerk/tanstack-start
export { clerkClient } from "@clerk/tanstack-start/server";

export function getClerkEnv() {
  return {
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY!,
  };
}
