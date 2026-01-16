import { createClerkClient } from "@clerk/tanstack-start/server";

export const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
});

export function getClerkEnv() {
  return {
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY!,
  };
}
