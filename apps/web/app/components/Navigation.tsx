import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Compass, UserPlus, Search, User } from "lucide-react";
import {
  SignInButton,
  SignedIn,
  SignedOut,
  useUser,
  ClerkLoaded,
} from "@clerk/tanstack-start";
import { useQuery } from "convex/react";
import { api } from "@bouncepad/backend/convex/_generated/api";
import { Avatar } from "~/components/ui";

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { path: "/", label: "Home", icon: <Home size={20} /> },
  { path: "/explore", label: "Explore", icon: <Compass size={20} /> },
  { path: "/following", label: "Following", icon: <UserPlus size={20} /> },
  { path: "/search", label: "Search", icon: <Search size={20} /> },
];

function DesktopUserButton() {
  const { user } = useUser();
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const isActive = currentPath === "/settings";
  const convexUser = useQuery(
    api.users.getByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const label = convexUser?.username
    ? `@${convexUser.username}`
    : user?.fullName || "Profile";

  return (
    <ClerkLoaded>
      <SignedIn>
        <Link
          to="/settings"
          className={`
            flex items-center gap-2 px-4 h-10 rounded-lg font-medium text-sm
            [transform:none!important]
            ${isActive
              ? "solid-button-3d text-[var(--accent-text)]"
              : "glass-button text-[var(--foreground)]"
            }
          `}
        >
          <span className="shrink-0 flex items-center">
            {user?.imageUrl ? (
              <Avatar src={user.imageUrl} fallback="U" size="xs" />
            ) : (
              <User size={20} />
            )}
          </span>
          <span className="truncate">{label}</span>
        </Link>
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal">
          <button
            className={`
              flex items-center gap-2 px-4 h-10 rounded-lg font-medium text-sm
              [transform:none!important] w-full cursor-pointer
              glass-button text-[var(--foreground)]
            `}
          >
            <span className="shrink-0"><User size={20} /></span>
            <span>Sign In</span>
          </button>
        </SignInButton>
      </SignedOut>
    </ClerkLoaded>
  );
}

function MobileUserButton() {
  const { user } = useUser();
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const isActive = currentPath === "/settings";

  return (
    <ClerkLoaded>
      <SignedIn>
        <Link
          to="/settings"
          className={`
            flex flex-col items-center gap-1 px-4 py-3 rounded-lg
            transition-colors duration-150
            ${isActive
              ? "text-accent"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }
          `}
        >
          {user?.imageUrl ? (
            <Avatar src={user.imageUrl} fallback="U" size="xs" />
          ) : (
            <User size={20} />
          )}
          <span className="text-xs font-medium">Profile</span>
        </Link>
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal">
          <button
            className="flex flex-col items-center gap-1 px-4 py-3 rounded-lg
              transition-colors duration-150
              text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
          >
            <User size={20} />
            <span className="text-xs font-medium">Sign In</span>
          </button>
        </SignInButton>
      </SignedOut>
    </ClerkLoaded>
  );
}

export function Navigation() {
  const currentPath = useRouterState({ select: (s) => s.location.pathname });

  return (
    <>
      {/* Sidebar for large screens */}
      <nav className="hidden md:block fixed left-0 top-0 bottom-0 w-64 border-r border-[var(--border)] bg-[var(--background)] p-4">
        {/* Logo/branding at top */}
        <div className="px-3 mb-4">
          <h1 className="text-xl font-bold">Bouncepad</h1>
          <p className="text-sm text-[var(--muted)]">Jump into the livescape.</p>
        </div>

        {/* Nav items anchored to bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-2 px-4 h-10 rounded-lg font-medium text-sm
                  [transform:none!important]
                  ${isActive
                    ? "solid-button-3d text-[var(--accent-text)]"
                    : "glass-button text-[var(--foreground)]"
                  }
                `}
              >
                <span className="shrink-0">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
          <DesktopUserButton />
        </div>
      </nav>

      {/* Bottom bar for small screens */}
      <nav className="bottom-nav md:hidden fixed bottom-0 left-0 right-0 border-t border-[var(--border)] bg-[var(--background)] px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex flex-col items-center gap-1 px-4 py-3 rounded-lg
                  transition-colors duration-150
                  ${isActive
                    ? "text-accent"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }
                `}
              >
                {item.icon}
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
          <MobileUserButton />
        </div>
      </nav>
    </>
  );
}
