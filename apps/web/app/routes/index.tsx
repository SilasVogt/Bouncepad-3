import { createFileRoute } from "@tanstack/react-router";
import {
  SignInButton,
  SignOutButton,
  SignedIn,
  SignedOut,
  useUser,
} from "@clerk/tanstack-start";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { user } = useUser();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-5xl font-bold motion-preset-slide-down">Bouncepad</h1>
      <p className="mt-4 text-xl text-gray-400 motion-preset-fade motion-delay-200">
        RSS-based livestreaming platform
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
