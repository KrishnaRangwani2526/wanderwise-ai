import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Search, Map, Sliders, Camera, Plane, Navigation, ArrowRight, Star } from "lucide-react";
import { DESTINATIONS } from "@/data/destinations";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WanderCompanion — Dream, plan and travel India" },
      {
        name: "description",
        content:
          "Discover Indian destinations, build smart itineraries, optimize routes and book flights, trains and hotels — powered by transparent offline engines.",
      },
      { property: "og:title", content: "WanderCompanion — Dream, plan and travel India" },
      {
        property: "og:description",
        content: "Smart, offline travel engines for India.",
      },
      {
        property: "og:image",
        content:
          "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200",
      },
    ],
  }),
  component: Landing,
});

type Feature = {
  to: string;
  label: string;
  tag: string;
  desc: string;
  Icon: typeof Sparkles;
};

const FEATURES: Feature[] = [
  { to: "/dream", label: "Dream", tag: "Discover", desc: "Tell us your mood and get ranked destination matches with clear reasoning.", Icon: Sparkles },
  { to: "/analyze", label: "Analyze", tag: "Audit a plan", desc: "Paste an itinerary, URL or reel — get suggestions, budget and best-season insights.", Icon: Search },
  { to: "/plan", label: "Plan", tag: "Build itineraries", desc: "Dates, members, likes, budget — three ranked itinerary options.", Icon: Map },
  { to: "/optimize", label: "Optimize", tag: "Refine", desc: "Tighten by budget, days or must-see places. Keep the best, drop the rest.", Icon: Sliders },
  { to: "/sightsee", label: "Sightsee", tag: "Gallery", desc: "A scenic gallery of every place to lock in the inspiration.", Icon: Camera },
  { to: "/book", label: "Book", tag: "One-click agent", desc: "Flights, trains and hotels with a single saved profile.", Icon: Plane },
  { to: "/travel", label: "Travel", tag: "On the road", desc: "Live map, route optimization, viewpoints and famous food nearby.", Icon: Navigation },
];

const HERO_BG =
  "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1600&q=70";

const TICKER_IMAGES = [
  "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600",
  "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600",
  "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600",
  "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600",
  "https://images.unsplash.com/photo-1602215890259-bf3a8c534b87?w=600",
  "https://images.unsplash.com/photo-1589793907316-f94025b46850?w=600",
  "https://images.unsplash.com/photo-1583407723467-9b2d22504831?w=600",
  "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=600",
];

function Landing() {
  const featured = DESTINATIONS.slice(0, 8);

  return (
    <div className="bg-background">
      {/* HERO — white-first with a soft warm image behind glass */}
      <section className="relative isolate overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url(${HERO_BG})` }}
        />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-background/40 via-background/80 to-background" />

        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 md:grid-cols-[1.15fr_1fr] md:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-3 py-1 text-xs font-medium text-foreground/70 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Offline travel engines · India-focused
            </span>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Your whole India trip,
              <br />
              <span className="text-primary">from daydream to doorstep.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Dream by mood, analyze any itinerary, plan with ranked options, optimize for
              budget, and travel with a live map of viewpoints, food and stays.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/dream"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90"
              >
                Start dreaming <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/plan"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
              >
                Build an itinerary
              </Link>
            </div>
            <div className="mt-10 grid max-w-md grid-cols-3 gap-3">
              <Stat n="20+" l="Destinations" />
              <Stat n="8" l="Smart engines" />
              <Stat n="0" l="Signups" />
            </div>
          </div>

          {/* Glass image collage */}
          <div className="relative hidden h-[460px] md:block">
            <GlassImage img="https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600" label="Agra · Taj" className="left-2 top-2 h-44 w-60 rotate-[-3deg]" />
            <GlassImage img="https://images.unsplash.com/photo-1602215890259-bf3a8c534b87?w=600" label="Kerala backwaters" className="right-0 top-10 h-52 w-64 rotate-[4deg] animate-float" />
            <GlassImage img="https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600" label="Jaipur · Hawa Mahal" className="bottom-12 left-10 h-48 w-56 rotate-[2deg]" />
            <GlassImage img="https://images.unsplash.com/photo-1589793907316-f94025b46850?w=600" label="Ladakh" className="bottom-0 right-8 h-44 w-60 rotate-[-2deg] animate-float" />
          </div>
        </div>

        {/* Mode pill row */}
        <div className="mx-auto -mt-4 max-w-7xl px-4 pb-12">
          <div className="glass mx-auto flex max-w-fit flex-wrap items-center justify-center gap-2 rounded-2xl px-3 py-2 shadow-glass">
            {FEATURES.map((f) => (
              <Link
                key={f.to}
                to={f.to}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-foreground/80 transition hover:text-foreground hover:shadow-soft"
              >
                <f.Icon className="h-3.5 w-3.5 text-primary" /> {f.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* MOVING TICKER */}
      <section className="mask-fade-x overflow-hidden border-y border-border bg-muted/40 py-5">
        <div className="animate-marquee flex w-max gap-3">
          {[...TICKER_IMAGES, ...TICKER_IMAGES].map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-20 w-32 shrink-0 rounded-xl object-cover shadow-soft sm:h-24 sm:w-40"
            />
          ))}
        </div>
      </section>

      {/* FEATURES — clean white grid, single accent */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <header className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Seven ways to travel smarter</h2>
          <p className="mt-3 text-muted-foreground">
            Each tile is a focused tool. They feed into each other — Dream's picks flow into Plan,
            Plan into Optimize, and the whole route lights up on Travel.
          </p>
        </header>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Link
              key={f.to}
              to={f.to}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card"
            >
              <div>
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-primary">
                  <f.Icon className="h-5 w-5" />
                </div>
                <div className="mt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {f.tag}
                </div>
                <h3 className="mt-1 text-xl font-semibold text-foreground">{f.label}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
              <div className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Open {f.label} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED DESTINATIONS — glass overlays */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <header className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Popular India picks</h2>
              <p className="mt-2 text-muted-foreground">A taste of what's inside the Dream engine.</p>
            </div>
            <Link
              to="/dream"
              className="hidden shrink-0 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted sm:inline-flex"
            >
              See all
            </Link>
          </header>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((d) => (
              <article
                key={d.id}
                className="group relative h-72 overflow-hidden rounded-2xl shadow-soft transition hover:-translate-y-0.5 hover:shadow-card"
              >
                <img
                  src={d.hero_image}
                  alt={d.name}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                {/* Glass info card pinned bottom */}
                <div className="glass absolute inset-x-3 bottom-3 rounded-xl p-3 shadow-glass">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-foreground">{d.name}</h3>
                      <p className="truncate text-[11px] text-muted-foreground">{d.state}</p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-foreground">
                      <Star className="h-3 w-3 fill-primary text-primary" /> ₹{d.cost_per_day_inr}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-border bg-card p-10 shadow-card sm:p-14">
          <div aria-hidden className="bg-hero absolute inset-0 opacity-15" />
          <div className="relative">
            <h3 className="text-3xl font-semibold tracking-tight sm:text-4xl">Ready when your wanderlust is.</h3>
            <p className="mt-3 max-w-xl text-muted-foreground">
              No signups, no waiting — start with a dream and we'll handle the rest.
            </p>
            <Link
              to="/dream"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90"
            >
              Start dreaming <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="text-2xl font-semibold text-foreground">{n}</div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{l}</div>
    </div>
  );
}

function GlassImage({ img, label, className }: { img: string; label: string; className: string }) {
  return (
    <div className={`absolute overflow-hidden rounded-2xl shadow-glass ring-1 ring-white/50 ${className}`}>
      <img src={img} alt={label} loading="lazy" decoding="async" className="h-full w-full object-cover" />
      <div className="glass absolute inset-x-2 bottom-2 rounded-lg px-2 py-1 text-xs font-semibold text-foreground">
        {label}
      </div>
    </div>
  );
}
