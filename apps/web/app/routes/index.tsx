import { createFileRoute } from "@tanstack/react-router";
import {
  SignInButton,
  SignOutButton,
  SignedIn,
  SignedOut,
  useUser,
  ClerkLoaded,
} from "@clerk/tanstack-start";
import { useQuery, useMutation } from "convex/react";
import { api } from "@bouncepad/backend/convex/_generated/api";
import { useEffect } from "react";
import { AccentColorPicker } from "~/components/AccentColorPicker";
import { useTheme } from "~/lib/theme";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <ClerkLoaded>
      <HomeContent />
    </ClerkLoaded>
  );
}

function HomeContent() {
  const { user } = useUser();
  const convexStatus = useQuery(api.test.ping);
  const createUser = useMutation(api.users.create);
  const { setMode, mode } = useTheme();

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
    <div className="flex flex-col items-center justify-center p-8 min-h-[80vh]">
      <h1 className="text-5xl font-bold motion-preset-slide-down">Bouncepad</h1>
      <p className="mt-4 text-xl text-[var(--muted)] motion-preset-fade motion-delay-200">
        RSS-based livestreaming platform
      </p>

      <p className="mt-2 text-sm text-[var(--muted)]">
        Convex: {convexStatus ? `Connected` : "Loading..."}
      </p>

      <div className="mt-8">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="px-6 py-3 bg-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <div className="flex flex-col items-center gap-4">
            <p className="text-accent">
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

      {/* Theme Settings */}
      <div className="mt-12 p-6 rounded-xl border border-[var(--border)] bg-[var(--background)]">
        <h2 className="text-lg font-semibold mb-4">Theme Settings</h2>

        <div className="mb-4">
          <p className="text-sm text-[var(--muted)] mb-2">Mode</p>
          <div className="flex gap-2">
            {(["system", "light", "dark"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                  mode === m
                    ? "bg-accent text-white"
                    : "bg-[var(--border)] hover:bg-[var(--muted)]"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm text-[var(--muted)] mb-2">Accent Color</p>
          <AccentColorPicker />
        </div>
      </div>
    </div>
  );
}
