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
  Star,
} from "lucide-react";
import { DESTINATIONS } from "@/data/destinations";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WanderCompanion — A field guide to travelling India" },
      {
        name: "description",
        content:
          "Editorial-grade trip planning for India. Dream by mood, analyze any itinerary, plan ranked options, optimize for budget, and travel with a live route map — all powered by transparent offline engines.",
      },
      { property: "og:title", content: "WanderCompanion — A field guide to travelling India" },
      {
        property: "og:description",
        content:
          "Dream, analyze, plan, optimize, sightsee, book and travel — seven focused tools, one editorial workflow.",
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
  kicker: string;
  desc: string;
  number: string;
  Icon: typeof Sparkles;
};

const FEATURES: Feature[] = [
  {
    to: "/dream",
    label: "Dream",
    kicker: "Discovery",
    number: "01",
    desc: "Tell us your mood — mountains, monsoon, a slow week. Get ranked matches with the reasoning shown.",
    Icon: Sparkles,
  },
  {
    to: "/analyze",
    label: "Analyze",
    kicker: "Audit",
    number: "02",
    desc: "Paste a URL, PDF or pasted itinerary. We extract the structure and suggest what's missing.",
    Icon: Search,
  },
  {
    to: "/plan",
    label: "Plan",
    kicker: "Itinerary",
    number: "03",
    desc: "Dates, travellers, likes, budget — three ranked plans you can actually live with.",
    Icon: Map,
  },
  {
    to: "/optimize",
    label: "Optimize",
    kicker: "Refine",
    number: "04",
    desc: "Tighten by budget, days or must-see places. The compare engine ranks every variant.",
    Icon: Sliders,
  },
  {
    to: "/sightsee",
    label: "Sightsee",
    kicker: "Gallery",
    number: "05",
    desc: "A scenic gallery scraped and curated from across the web — proof of why you're going.",
    Icon: Camera,
  },
  {
    to: "/book",
    label: "Book",
    kicker: "One-click",
    number: "06",
    desc: "Save your traveller profile once. Compare flights, trains and hotels, then deep-link to book.",
    Icon: Plane,
  },
  {
    to: "/travel",
    label: "Travel",
    kicker: "On the road",
    number: "07",
    desc: "Live map of your route — viewpoints, famous food and detours, surfaced as you go.",
    Icon: Navigation,
  },
];

const COVER =
  "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1600&q=80";
const COVER_SIDE =
  "https://images.unsplash.com/photo-1602215890259-bf3a8c534b87?w=900&q=80";

const TICKER = [
  { src: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600", label: "Agra · Uttar Pradesh" },
  { src: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600", label: "Varanasi · UP" },
  { src: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600", label: "Hampi · Karnataka" },
  { src: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600", label: "Jaipur · Rajasthan" },
  { src: "https://images.unsplash.com/photo-1602215890259-bf3a8c534b87?w=600", label: "Alleppey · Kerala" },
  { src: "https://images.unsplash.com/photo-1589793907316-f94025b46850?w=600", label: "Leh · Ladakh" },
  { src: "https://images.unsplash.com/photo-1583407723467-9b2d22504831?w=600", label: "Munnar · Kerala" },
  { src: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=600", label: "Goa coast" },
];

function Landing() {
  const featured = DESTINATIONS.slice(0, 6);

  return (
    <div className="bg-background">
      {/* HERO — editorial cover */}
      <section className="border-b border-foreground/15">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-10 md:pt-16">
          <div className="grid items-end gap-10 md:grid-cols-[1.05fr_1fr]">
            <div className="md:pr-6">
              <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
                <span className="h-px w-10 bg-primary" />
                Volume 01 · The India field guide
              </div>
              <h1 className="mt-6 font-display text-[2.6rem] font-black leading-[0.98] tracking-[-0.02em] text-foreground sm:text-6xl md:text-[5.25rem]">
                A trip,
                <br />
                <span className="italic font-medium">considered.</span>
              </h1>
              <p className="mt-7 max-w-xl text-[15px] leading-relaxed text-foreground/75 sm:text-base">
                WanderCompanion is a seven-step workshop for travelling India well —
                <em className="not-italic font-semibold text-foreground"> Dream, Analyze, Plan, Optimize,
                Sightsee, Book, Travel.</em>{" "}
                Built on transparent offline engines, sharpened by AI only where it
                helps. No accounts, no upsells, no infinite scroll.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link
                  to="/dream"
                  className="inline-flex items-center gap-2 rounded-sm bg-foreground px-5 py-3 text-[12px] font-bold uppercase tracking-[0.18em] text-background transition hover:bg-primary"
                >
                  Begin with a dream <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  to="/analyze"
                  className="inline-flex items-center gap-2 rounded-sm border border-foreground/30 px-5 py-3 text-[12px] font-bold uppercase tracking-[0.18em] text-foreground transition hover:border-foreground hover:bg-secondary"
                >
                  Audit my itinerary
                </Link>
              </div>
              <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-foreground/15 pt-6">
                <Stat n="20+" l="Destinations" />
                <Stat n="8" l="Smart engines" />
                <Stat n="0" l="Signups" />
              </dl>
            </div>

            {/* Cover image stack */}
            <figure className="relative">
              <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
                <img
                  src={COVER}
                  alt="The Taj Mahal at dawn"
                  className="h-full w-full object-cover"
                  loading="eager"
                  decoding="async"
                />
                <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-foreground/80 to-transparent p-5 text-background">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.25em] opacity-80">Cover story</div>
                    <div className="font-display text-lg font-semibold">Agra at first light</div>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.25em] opacity-80">No. 01</span>
                </figcaption>
              </div>
              <div className="absolute -bottom-8 -left-6 hidden h-44 w-44 overflow-hidden border-8 border-background shadow-card md:block">
                <img src={COVER_SIDE} alt="Kerala backwaters at dusk" className="h-full w-full object-cover" />
              </div>
            </figure>
          </div>
        </div>
      </section>

      {/* MARQUEE — restrained, monochrome captions */}
      <section className="mask-fade-x overflow-hidden border-b border-foreground/15 bg-secondary/60 py-5">
        <div className="animate-marquee flex w-max gap-3">
          {[...TICKER, ...TICKER].map((t, i) => (
            <figure key={i} className="relative h-24 w-40 shrink-0 overflow-hidden">
              <img
                src={t.src}
                alt={t.label}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/85 to-transparent p-1.5 text-[9px] uppercase tracking-[0.15em] text-background">
                {t.label}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* TABLE OF CONTENTS — the seven tools */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <header className="grid gap-6 border-b border-foreground/15 pb-6 md:grid-cols-[auto_1fr] md:items-end">
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
            Table of contents
          </div>
          <div className="md:text-right">
            <h2 className="font-display text-3xl font-black tracking-tight sm:text-5xl">
              Seven tools, one workflow.
            </h2>
            <p className="mt-3 max-w-xl text-foreground/70 md:ml-auto">
              Each tool stands alone. Together, they read like chapters — Dream feeds Plan,
              Plan feeds Optimize, the whole trip lights up on Travel.
            </p>
          </div>
        </header>

        <ol className="mt-10 divide-y divide-foreground/10 border-y border-foreground/10">
          {FEATURES.map((f) => (
            <li key={f.to}>
              <Link
                to={f.to}
                className="group grid grid-cols-[3rem_1fr_auto] items-center gap-6 py-6 transition hover:bg-secondary/50 sm:grid-cols-[4rem_8rem_1fr_auto] sm:gap-8"
              >
                <span className="font-display text-2xl font-black text-primary sm:text-3xl">{f.number}</span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground sm:order-2 sm:col-span-1">
                  {f.kicker}
                </span>
                <div className="col-span-1 sm:col-start-3">
                  <div className="flex items-center gap-2">
                    <f.Icon className="h-4 w-4 text-foreground/60" />
                    <h3 className="font-display text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
                      {f.label}
                    </h3>
                  </div>
                  <p className="mt-1.5 max-w-2xl text-sm text-foreground/70 sm:text-[15px]">{f.desc}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-foreground/40 transition group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* FEATURED DESTINATIONS — editorial photo grid */}
      <section className="border-y border-foreground/15 bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <header className="grid gap-3 border-b border-foreground/15 pb-6 md:grid-cols-[auto_1fr_auto] md:items-end">
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
              The dossier
            </div>
            <h2 className="font-display text-3xl font-black tracking-tight sm:text-4xl">
              Six destinations to begin with.
            </h2>
            <Link
              to="/dream"
              className="hidden text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/70 hover:text-foreground sm:inline-flex"
            >
              See the full set →
            </Link>
          </header>
          <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((d, i) => (
              <article key={d.id} className="group">
                <div className="relative aspect-[4/5] overflow-hidden bg-foreground/10">
                  <img
                    src={d.hero_image}
                    alt={d.name}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                  />
                  <span className="absolute left-0 top-0 bg-background px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
                    No. {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="mt-4 flex items-start justify-between gap-3 border-b border-foreground/15 pb-3">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      {d.state}
                    </div>
                    <h3 className="font-display text-xl font-bold leading-tight tracking-tight text-foreground">
                      {d.name}
                    </h3>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-foreground">
                    <Star className="h-3 w-3 fill-primary text-primary" /> ₹{d.cost_per_day_inr}/day
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-foreground/70">{d.tagline}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CLOSING — masthead-style CTA */}
      <section className="border-b border-foreground/15">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 py-20 text-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
            Editor's note
          </div>
          <p className="mx-auto max-w-3xl font-display text-3xl font-medium leading-[1.15] tracking-tight text-foreground sm:text-5xl">
            “The best trips are not booked. They are{" "}
            <span className="italic text-primary">composed</span> —
            a sequence of small, decided things.”
          </p>
          <div className="mx-auto h-px w-12 bg-foreground/30" />
          <div>
            <Link
              to="/dream"
              className="inline-flex items-center gap-2 rounded-sm bg-foreground px-6 py-3 text-[12px] font-bold uppercase tracking-[0.2em] text-background transition hover:bg-primary"
            >
              Compose yours <ArrowRight className="h-3.5 w-3.5" />
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
      <dt className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">{l}</dt>
      <dd className="mt-1 font-display text-3xl font-black text-foreground">{n}</dd>
    </div>
  );
}
