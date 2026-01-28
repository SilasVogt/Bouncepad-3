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

// Inline script that runs before first paint to prevent theme flash (FOUC).
// Must be a plain string — no imports, no modules, no React.
const themeInitScript = `(function(){try{
var ac={red:["#fecaca","#ef4444","#991b1b"],orange:["#fed7aa","#f97316","#9a3412"],amber:["#fde68a","#f59e0b","#92400e"],yellow:["#fef08a","#eab308","#854d0e"],lime:["#d9f99d","#84cc16","#3f6212"],green:["#bbf7d0","#22c55e","#166534"],emerald:["#a7f3d0","#10b981","#065f46"],teal:["#99f6e4","#14b8a6","#115e59"],cyan:["#a5f3fc","#06b6d4","#155e75"],sky:["#bae6fd","#0ea5e9","#075985"],blue:["#bfdbfe","#3b82f6","#1e40af"],indigo:["#c7d2fe","#6366f1","#3730a3"],violet:["#ddd6fe","#8b5cf6","#5b21b6"],purple:["#e9d5ff","#a855f7","#6b21a8"],fuchsia:["#f5d0fe","#d946ef","#86198f"],pink:["#fbcfe8","#ec4899","#9d174d"],rose:["#fecdd3","#f43f5e","#9f1239"],slate:["#e2e8f0","#64748b","#1e293b"]};
var mode=localStorage.getItem("bouncepad-theme-mode")||"system";
var accent=localStorage.getItem("bouncepad-accent-color")||"blue";
var dark=mode==="dark"||(mode==="system"&&window.matchMedia("(prefers-color-scheme:dark)").matches);
var d=document.documentElement;
if(dark)d.classList.add("dark");
var c=ac[accent]||ac.blue;
var s=d.style;
s.setProperty("--accent-light",c[0]);
s.setProperty("--accent-main",c[1]);
s.setProperty("--accent-dark",c[2]);
s.setProperty("--background",dark?"#0a0a0a":"#fafafa");
s.setProperty("--foreground",dark?"#ededed":"#171717");
s.setProperty("--muted",dark?"#737373":"#a3a3a3");
s.setProperty("--border",dark?"#262626":"#e5e5e5");
}catch(e){}})()`;

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
