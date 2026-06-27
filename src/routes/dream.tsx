import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Loader2, MapPin, Star, ArrowRight } from "lucide-react";
import {
  INTEREST_LABELS,
  SEASON_LABELS,
  type Interest,
  type Season,
} from "@/data/destinations";
import { dreamDestinations, type DreamRequest, type DreamResultItem } from "@/lib/dream.functions";

export const Route = createFileRoute("/dream")({
  head: () => ({
    meta: [
      { title: "Dream — Discover India by your mood | WanderCompanion" },
      {
        name: "description",
        content:
          "Pick interests, duration, season and budget. Get ranked Indian destinations with reasons, costs and best season.",
      },
      { property: "og:title", content: "Dream — Discover India by your mood" },
      {
        property: "og:description",
        content: "Ranked destinations matching your interests, season and budget.",
      },
    ],
  }),
  component: DreamPage,
});

const INTERESTS = Object.keys(INTEREST_LABELS) as Interest[];
const SEASONS = Object.keys(SEASON_LABELS) as Season[];

function DreamPage() {
  const dreamFn = useServerFn(dreamDestinations);
  const [interests, setInterests] = useState<Interest[]>(["mountains"]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [days, setDays] = useState(5);
  const [travelers, setTravelers] = useState(2);
  const [maxBudget, setMaxBudget] = useState(0);
  const [avoidCrowds, setAvoidCrowds] = useState(false);
  const [style, setStyle] = useState<DreamRequest["style"]>("mid");

  const mutation = useMutation({
    mutationFn: async (req: DreamRequest) => dreamFn({ data: req }),
  });

  const toggle = <T extends string>(arr: T[], v: T, set: (a: T[]) => void) => {
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  };

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (interests.length === 0) return;
    mutation.mutate({
      interests,
      seasons: seasons.length ? seasons : undefined,
      duration_days: days,
      travelers,
      max_budget_per_day_inr: maxBudget > 0 ? maxBudget : undefined,
      avoid_crowds: avoidCrowds,
      style,
    });
  }

  return (
    <div className="bg-muted/30">
      <section className="bg-sunset px-4 py-12 text-white sm:py-16">
        <div className="mx-auto max-w-5xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Step 1 — Dream
          </span>
          <h1 className="mt-3 text-3xl font-black sm:text-5xl">What does your trip feel like?</h1>
          <p className="mt-2 max-w-2xl text-white/90">
            Pick your interests, when you can go, and how long you have. We'll rank Indian
            destinations that fit — with reasons, costs and a fair compare-rank.
          </p>
        </div>
      </section>

      <section className="mx-auto -mt-6 max-w-5xl px-4">
        <form
          onSubmit={onSubmit}
          className="shadow-card rounded-3xl border border-border bg-card p-5 sm:p-7"
        >
          <Field label="I'm into…" hint="Pick one or more">
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((i) => (
                <Chip key={i} active={interests.includes(i)} onClick={() => toggle(interests, i, setInterests)}>
                  {INTEREST_LABELS[i]}
                </Chip>
              ))}
            </div>
          </Field>

          <Field label="Best months" hint="Optional — we'll factor in best-season bonus">
            <div className="flex flex-wrap gap-2">
              {SEASONS.map((s) => (
                <Chip key={s} active={seasons.includes(s)} onClick={() => toggle(seasons, s, setSeasons)}>
                  {SEASON_LABELS[s]}
                </Chip>
              ))}
            </div>
          </Field>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Field label={`Days: ${days}`}>
              <input
                type="range"
                min={1}
                max={20}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </Field>
            <Field label={`Travelers: ${travelers}`}>
              <input
                type="range"
                min={1}
                max={10}
                value={travelers}
                onChange={(e) => setTravelers(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </Field>
            <Field label="Travel style">
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value as DreamRequest["style"])}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="shoestring">Shoestring</option>
                <option value="budget">Budget</option>
                <option value="mid">Mid</option>
                <option value="comfort">Comfort</option>
                <option value="luxury">Luxury</option>
              </select>
            </Field>
            <Field label="Max ₹/day (0 = any)">
              <input
                type="number"
                min={0}
                step={500}
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </Field>
          </div>

          <label className="mt-5 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={avoidCrowds}
              onChange={(e) => setAvoidCrowds(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            Steer me away from the most touristy places
          </label>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Engines used: <b>recommendation</b> · <b>cost</b> · <b>compare-rank</b>
            </p>
            <button
              type="submit"
              disabled={mutation.isPending || interests.length === 0}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-primary/90 disabled:opacity-50"
            >
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Find my destinations
            </button>
          </div>
        </form>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        {mutation.isError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Something went wrong. Please try again.
          </div>
        )}
        {mutation.isSuccess && mutation.data && (
          <Results results={mutation.data.results} />
        )}
        {!mutation.data && !mutation.isPending && <EmptyHint />}
      </section>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="mb-2 flex items-baseline justify-between">
        <label className="text-sm font-semibold">{label}</label>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm transition ${
        active
          ? "border-primary bg-primary text-primary-foreground shadow-soft"
          : "border-border bg-background hover:border-primary/50"
      }`}
    >
      {children}
    </button>
  );
}

function EmptyHint() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center text-sm text-muted-foreground">
      Pick what you love and hit <b>Find my destinations</b>. Results will appear here, ranked.
    </div>
  );
}

function Results({ results }: { results: DreamResultItem[] }) {
  if (results.length === 0) {
    return <p className="text-center text-muted-foreground">No matches. Try widening your filters.</p>;
  }
  const [top, ...rest] = results;
  return (
    <div>
      <div className="mb-6 flex items-baseline justify-between">
        <h2 className="text-2xl font-black sm:text-3xl">Your ranked picks</h2>
        <span className="text-sm text-muted-foreground">{results.length} matches</span>
      </div>

      {/* Top card — featured */}
      <article className="shadow-card mb-6 grid overflow-hidden rounded-3xl bg-card md:grid-cols-[1.2fr_1fr]">
        <div className="relative h-64 md:h-auto">
          <img src={top.hero_image} alt={top.name} className="h-full w-full object-cover" />
          <span className="bg-spice-grad absolute left-4 top-4 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-white">
            <Star className="h-3 w-3 fill-white" /> Rank #1 · {Math.round(top.ranked.total_score * 100)}/100
          </span>
        </div>
        <div className="p-6 sm:p-8">
          <div className="text-sm font-medium text-muted-foreground">
            <MapPin className="mr-1 inline h-3.5 w-3.5" />
            {top.state}
          </div>
          <h3 className="mt-1 text-3xl font-black">{top.name}</h3>
          <p className="mt-1 text-muted-foreground">{top.tagline}</p>
          <p className="mt-3 rounded-lg bg-accent/30 p-3 text-sm font-medium">
            ✨ {top.ranked.verdict}
          </p>
          <ul className="mt-3 space-y-1 text-sm">
            {top.reasons.map((r) => (
              <li key={r}>· {r}</li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <div>
              <div className="text-xs text-muted-foreground">Estimated trip cost</div>
              <div className="text-2xl font-black text-primary">
                ₹{top.estimated_cost_inr.toLocaleString("en-IN")}
              </div>
              <div className="text-xs text-muted-foreground">
                ~₹{top.per_person_per_day_inr.toLocaleString("en-IN")} per person / day
              </div>
            </div>
            <Link
              to="/plan"
              search={{ dest: top.id }}
              className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Plan this trip <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </article>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((r) => (
          <Link
            key={r.id}
            to="/plan"
            search={{ dest: r.id }}
            className="shadow-card group overflow-hidden rounded-2xl bg-card transition hover:-translate-y-0.5"
          >
            <div className="relative h-40">
              <img src={r.hero_image} alt={r.name} className="h-full w-full object-cover" />
              <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2 py-0.5 text-xs font-bold">
                #{r.ranked.rank} · {Math.round(r.ranked.total_score * 100)}/100
              </span>
            </div>
            <div className="p-4">
              <div className="flex items-baseline justify-between">
                <h3 className="font-bold">{r.name}</h3>
                <span className="text-xs text-muted-foreground">{r.state}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.tagline}</p>
              <p className="mt-2 text-xs font-medium text-primary">{r.ranked.verdict}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {r.reasons.slice(0, 2).map((reason) => (
                  <span key={reason} className="rounded-full bg-muted px-2 py-0.5 text-[11px]">
                    {reason}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
                <span className="text-sm font-semibold">
                  ₹{r.estimated_cost_inr.toLocaleString("en-IN")}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  Plan <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-5 text-sm">
        <b>How we rank:</b> a weighted blend of interest match, season fit, duration fit, total cost
        and uniqueness (lower crowd factor). Cost weight increases when you set a budget; uniqueness
        weight increases when you ask to avoid crowds. No hidden picks, no paid placements.
      </div>
    </div>
  );
}
