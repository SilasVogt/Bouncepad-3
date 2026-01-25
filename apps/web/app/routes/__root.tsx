import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import appCss from "~/app.css?url";
import { Providers } from "~/lib/providers";
import { Navigation } from "~/components/Navigation";
import { MiniPlayer } from "~/components/MiniPlayer";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Bouncepad",
      },
    ],
    links: [
      {
        rel: "preconnect",
        href: "https://fonts.bunny.net",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.bunny.net/css?family=instrument-serif:400,400i|inter:400,500,600,700",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <Providers>
      <RootDocument>
        <Navigation />
        <main className="md:ml-64 pb-24 min-h-screen">
          <Outlet />
        </main>
        <MiniPlayer />
      </RootDocument>
    </Providers>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
