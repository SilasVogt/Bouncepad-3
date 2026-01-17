import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Compass, UserPlus, Search } from "lucide-react";

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { path: "/", label: "Home", icon: <Home size={24} /> },
  { path: "/explore", label: "Explore", icon: <Compass size={24} /> },
  { path: "/following", label: "Following", icon: <UserPlus size={24} /> },
  { path: "/search", label: "Search", icon: <Search size={24} /> },
];

export function Navigation() {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  return (
    <>
      {/* Sidebar for large screens */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-64 flex-col border-r border-[var(--border)] bg-[var(--background)] p-4">
        {/* Logo/branding at top */}
        <div className="px-3 mb-4">
          <h1 className="text-xl font-bold">Bouncepad</h1>
          <p className="text-sm text-[var(--muted)]">Jump into the livescape.</p>
        </div>

        {/* Spacer to push nav to bottom */}
        <div className="flex-1" />

        {/* Nav items at bottom */}
        <div className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                  isActive
                    ? "bg-accent text-white"
                    : "text-[var(--foreground)] hover:bg-[var(--border)]"
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
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
                className={`flex flex-col items-center gap-1 px-4 py-3 transition-colors ${
                  isActive ? "text-accent" : "text-[var(--muted)]"
                }`}
              >
                {item.icon}
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
