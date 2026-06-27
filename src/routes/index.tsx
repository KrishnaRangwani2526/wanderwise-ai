import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  Search,
  Map,
  Sliders,
  Camera,
  Plane,
  Navigation,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Wifi,
  Cpu,
} from "lucide-react";
import { DESTINATIONS } from "@/data/destinations";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WanderCompanion — Plan India trips smarter" },
      {
        name: "description",
        content:
          "Seven focused tools — Dream, Analyze, Plan, Optimize, Sightsee, Book, Travel — for designing better India trips with transparent offline engines.",
      },
      { property: "og:title", content: "WanderCompanion — Plan India trips smarter" },
      {
        property: "og:description",
        content: "Dream, analyze, plan, optimize, sightsee, book and travel — one clean workflow.",
      },
      {
        property: "og:image",
        content: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200",
      },
    ],
  }),
  component: Landing,
});

type Feature = {
  to: string;
  label: string;
  kicker: string;
  desc: string;
  number: string;
  Icon: typeof Sparkles;
};

const FEATURES: Feature[] = [
  { to: "/dream", label: "Dream", kicker: "Discover", number: "01", desc: "Pick your mood — mountains, monsoon, slow week. Get ranked destinations with reasoning shown.", Icon: Sparkles },
  { to: "/analyze", label: "Analyze", kicker: "Audit", number: "02", desc: "Paste a URL, PDF or itinerary text. Extract structure, surface gaps, suggest fixes.", Icon: Search },
  { to: "/plan", label: "Plan", kicker: "Itinerary", number: "03", desc: "Dates, travellers, likes, budget — three ranked day-by-day plans, side by side.", Icon: Map },
  { to: "/optimize", label: "Optimize", kicker: "Refine", number: "04", desc: "Tighten by budget, days or must-sees. Compare ranks every variant transparently.", Icon: Sliders },
  { to: "/sightsee", label: "Sightsee", kicker: "Visual", number: "05", desc: "A clean scenic gallery — proof of why you're going, before you commit.", Icon: Camera },
  { to: "/book", label: "Book", kicker: "One-tap", number: "06", desc: "Save your profile once. Compare flights, trains, hotels — deep-link to the official site.", Icon: Plane },
  { to: "/travel", label: "Travel", kicker: "On-trip", number: "07", desc: "Live map of your route — viewpoints, famous food, detours as you go.", Icon: Navigation },
];

function Landing() {
  const featured = DESTINATIONS.slice(0, 6);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border bg-hero">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand" />
                A field guide to travelling India
              </div>
              <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-[4.25rem]">
                Plan your next trip,
                <br />
                <span className="text-brand-gradient">end&nbsp;to&nbsp;end.</span>
              </h1>
              <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
                Seven focused tools — <strong className="font-semibold text-foreground">Dream, Analyze, Plan, Optimize, Sightsee, Book, Travel</strong>.
                Built on transparent offline engines, sharpened by AI only where it helps. No accounts, no upsells.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/dream"
                  className="group inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90"
                >
                  Start with Dream
                  <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <Link
                  to="/analyze"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-secondary"
                >
                  Audit an itinerary
                </Link>
              </div>
              <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-border pt-6">
                <Stat n="20+" l="Destinations" />
                <Stat n="8" l="Smart engines" />
                <Stat n="0" l="Signups" />
              </dl>
            </div>

            {/* Hero visual: collage with one signature image */}
            <div className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-border bg-secondary shadow-card">
                <img
                  src="https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&q=80"
                  alt="Taj Mahal at dawn"
                  className="h-full w-full object-cover"
                  loading="eager"
                  decoding="async"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent p-5">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-background/80">Featured</div>
                  <div className="font-display text-lg font-semibold text-background">Agra at first light</div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-4 hidden h-40 w-40 overflow-hidden rounded-2xl border-4 border-background shadow-card sm:block">
                <img
                  src="https://images.unsplash.com/photo-1602215890259-bf3a8c534b87?w=600&q=80"
                  alt="Kerala backwaters"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -top-4 -right-3 hidden rounded-2xl border border-border bg-card px-3 py-2 shadow-card sm:flex sm:items-center sm:gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-brand" />
                <span className="text-xs font-semibold text-foreground">Engines running locally</span>
              </div>
            </div>
          </div>

          {/* Trust strip */}
          <div className="mt-12 grid gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:grid-cols-3">
            <TrustItem Icon={Cpu} title="Deterministic engines" sub="Recommend · Cost · Rank · Route" />
            <TrustItem Icon={Wifi} title="AI where it helps" sub="Scraping, extraction, summarisation" />
            <TrustItem Icon={ShieldCheck} title="Privacy by default" sub="No account · No tracking · Local profile" />
          </div>
        </div>
      </section>

      {/* SEVEN TOOLS — clean card grid */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand">The workflow</div>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Seven tools, one journey.
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Each tool stands on its own. Together, they read like chapters — Dream feeds Plan, Plan feeds Optimize, the whole trip lights up on Travel.
            </p>
          </div>
          <Link
            to="/dream"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-foreground hover:text-brand"
          >
            Begin <ArrowRight className="h-4 w-4" />
          </Link>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {FEATURES.map((f) => (
            <Link
              key={f.to}
              to={f.to}
              className="group relative flex flex-col rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-card"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-foreground transition group-hover:bg-brand group-hover:text-white">
                  <f.Icon className="h-5 w-5" />
                </span>
                <span className="font-display text-xs font-bold tracking-wider text-muted-foreground">
                  {f.number}
                </span>
              </div>
              <div className="mt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">
                {f.kicker}
              </div>
              <h3 className="mt-1 font-display text-xl font-bold tracking-tight text-foreground">
                {f.label}
              </h3>
              <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-muted-foreground">
                {f.desc}
              </p>
              <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-foreground/80 transition group-hover:gap-2 group-hover:text-brand">
                Open <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED DESTINATIONS */}
      <section className="border-y border-border bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand">Destinations</div>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Six places to begin with.
              </h2>
            </div>
            <Link
              to="/sightsee"
              className="inline-flex items-center gap-1 text-sm font-semibold text-foreground hover:text-brand"
            >
              See the full gallery <ArrowRight className="h-4 w-4" />
            </Link>
          </header>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((d) => (
              <Link
                key={d.id}
                to="/plan"
                search={{ dest: d.id }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-0.5 hover:shadow-card"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                  <img
                    src={d.hero_image}
                    alt={d.name}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                  />
                  <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/95 px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-soft">
                    ₹{d.cost_per_day_inr}/day
                  </div>
                </div>
                <div className="p-5">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {d.state}
                  </div>
                  <h3 className="mt-1 font-display text-lg font-bold tracking-tight text-foreground">
                    {d.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{d.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand">
            Ready when you are
          </div>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            Compose a trip that actually <span className="text-brand-gradient">fits you.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Start with what you love. End with a route, a budget, and a booking flow you can trust.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/dream"
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:opacity-90"
            >
              Start with Dream <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              to="/plan"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-secondary"
            >
              Jump to Plan
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
      <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{l}</dt>
      <dd className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {n}
      </dd>
    </div>
  );
}

function TrustItem({ Icon, title, sub }: { Icon: typeof Sparkles; title: string; sub: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary text-foreground">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
    </div>
  );
}
