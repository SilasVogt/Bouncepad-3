import { createFileRoute } from "@tanstack/react-router";
import {
  SignInButton,
  SignOutButton,
  SignedIn,
  SignedOut,
  useUser,
} from "@clerk/tanstack-start";
import { useQuery, useMutation } from "convex/react";
import { api } from "@bouncepad/backend/convex/_generated/api";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { user } = useUser();
  const convexStatus = useQuery(api.test.ping);
  const createUser = useMutation(api.users.create);

  // Sync Clerk user to Convex when signed in
  useEffect(() => {
    if (user) {
      createUser({
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress ?? "",
        name: user.fullName ?? undefined,
        imageUrl: user.imageUrl ?? undefined,
      });
    }
  }, [user, createUser]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-5xl font-bold motion-preset-slide-down">Bouncepad</h1>
      <p className="mt-4 text-xl text-gray-400 motion-preset-fade motion-delay-200">
        RSS-based livestreaming platform
      </p>

      <p className="mt-2 text-sm text-gray-500">
        Convex: {convexStatus ? `Connected` : "Loading..."}
      </p>

      <div className="mt-8">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <div className="flex flex-col items-center gap-4">
            <p className="text-green-400">
              Signed in as {user?.emailAddresses[0]?.emailAddress}
            </p>
            <SignOutButton>
              <button className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors">
                Sign Out
              </button>
            </SignOutButton>
          </div>
        </SignedIn>
      </div>
    </div>
  );
}
