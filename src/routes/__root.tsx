import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Menu, X, Compass } from "lucide-react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

const NAV = [
  { to: "/dream", label: "Dream" },
  { to: "/analyze", label: "Analyze" },
  { to: "/plan", label: "Plan" },
  { to: "/optimize", label: "Optimize" },
  { to: "/sightsee", label: "Sightsee" },
  { to: "/book", label: "Book" },
  { to: "/travel", label: "Travel" },
] as const;

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          That trail led nowhere. Let's get you back on the map.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Try again, or head home.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "WanderCompanion — Dream, plan and travel India" },
      {
        name: "description",
        content:
          "Discover, plan and optimize Indian trips with smart engines: recommendations, costs, routes, hotels, flights & trains.",
      },
      { property: "og:title", content: "WanderCompanion — Dream, plan and travel India" },
      {
        property: "og:description",
        content: "Smart, hardcoded travel engines. No subscriptions, no signups.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700;9..144,900&family=Inter:wght@400;500;600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
        integrity: "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=",
        crossOrigin: "",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
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

function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-foreground/15 bg-background/85 backdrop-blur">
      {/* Editorial top rail */}
      <div className="hidden border-b border-foreground/10 text-[10px] uppercase tracking-[0.25em] text-muted-foreground md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5">
          <span>Issue · India · 2026</span>
          <span>A field guide for considered travel</span>
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 sm:flex sm:justify-between">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-sm border border-foreground/80 bg-foreground text-background">
            <Compass className="h-4 w-4" />
          </span>
          <span className="truncate font-display text-xl font-black uppercase tracking-[0.18em] text-foreground">
            Wander<span className="text-primary">·</span>Companion
          </span>
        </Link>
        <nav className="hidden items-center gap-0.5 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-none border-b-2 border-transparent px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/70 transition hover:text-foreground"
              activeProps={{ className: "rounded-none border-b-2 border-primary px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((o) => !o)}
          className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-sm border border-foreground/30 md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-foreground/15 bg-background md:hidden">
          <ul className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {NAV.map((n) => (
              <li key={n.to}>
                <Link
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-sm px-3 py-2 text-sm font-semibold uppercase tracking-[0.15em] text-foreground/80 hover:bg-secondary"
                  activeProps={{ className: "block rounded-sm px-3 py-2 text-sm font-semibold uppercase tracking-[0.15em] bg-foreground text-background" }}
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 text-sm sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 font-bold">
            <Compass className="h-4 w-4 text-primary" /> WanderCompanion
          </div>
          <p className="mt-2 text-muted-foreground">
            A travel guide & itinerary maker powered by deterministic, offline engines. No accounts, no
            tracking.
          </p>
        </div>
        <div>
          <div className="font-semibold">Explore</div>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            {NAV.slice(0, 4).map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="hover:text-foreground">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-semibold">Trip tools</div>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            {NAV.slice(4).map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="hover:text-foreground">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} WanderCompanion. Crafted for travelers.
      </div>
    </footer>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <Outlet />
        </main>
        <SiteFooter />
      </div>
    </QueryClientProvider>
  );
}
