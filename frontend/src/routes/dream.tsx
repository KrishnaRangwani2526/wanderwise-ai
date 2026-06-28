import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Sparkles, Loader2, MapPin, Star, ArrowRight } from "lucide-react";
import {
  INTEREST_LABELS,
  SEASON_LABELS,
  DESTINATIONS,
  type Interest,
  type Season,
} from "@/data/destinations";
import { api } from "@/lib/api";
import { PageHero } from "@/components/PageHero";

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

const getHeroImage = (id: string) => {
  const dest = DESTINATIONS.find(d => d.id === id);
  return dest?.hero_image || "";
};

interface DreamResultItem {
  id: string;
  name: string;
  state: string;
  tagline: string;
  interests: Interest[];
  best_seasons: Season[];
  score: number;
  reasons: string[];
  estimated_cost_inr: number;
  per_person_per_day_inr: number;
  hero_image: string;
  ranked: {
    rank: number;
    total_score: number;
    verdict: string;
  };
}

function DreamPage() {
  const [interests, setInterests] = useState<Interest[]>(["mountains"]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [days, setDays] = useState(5);
  const [travelers, setTravelers] = useState(2);
  const [maxBudget, setMaxBudget] = useState(0);
  const [avoidCrowds, setAvoidCrowds] = useState(false);
  const [style, setStyle] = useState<string>("mid");

  const mutation = useMutation({
    mutationFn: async (req: any) => api.dream(req),
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
    <div>
      <PageHero
        eyebrow="Step 01 · Dream"
        icon={<Sparkles className="h-3.5 w-3.5" />}
        title={<>What does your trip <span className="text-brand-gradient">feel like?</span></>}
        description="Pick your interests, when you can go, and how long you have. We rank Indian destinations that fit — with reasons, costs and a transparent score."
      />

      <section className="mx-auto max-w-5xl px-4 py-8">
        <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-7">
          <Field label="I'm into…" hint="Pick one or more">
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((i) => (
                <Chip key={i} active={interests.includes(i)} onClick={() => toggle(interests, i, setInterests)}>
                  {INTEREST_LABELS[i]}
                </Chip>
              ))}
            </div>
          </Field>

          <Field label="Best months" hint="Optional — best-season bonus">
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
              <input type="range" min={1} max={20} value={days} onChange={(e) => setDays(Number(e.target.value))} className="w-full accent-[var(--brand)]" />
            </Field>
            <Field label={`Travelers: ${travelers}`}>
              <input type="range" min={1} max={10} value={travelers} onChange={(e) => setTravelers(Number(e.target.value))} className="w-full accent-[var(--brand)]" />
            </Field>
            <Field label="Travel style">
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className={selectCls}
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
                className={selectCls}
              />
            </Field>
          </div>

          <label className="mt-5 flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={avoidCrowds}
              onChange={(e) => setAvoidCrowds(e.target.checked)}
              className="h-4 w-4 accent-[var(--brand)]"
            />
            Steer me away from the most touristy places
          </label>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
            <p className="text-xs text-muted-foreground">
              Engines: <b className="text-foreground">recommendation</b> · <b className="text-foreground">cost</b> · <b className="text-foreground">compare-rank</b>
            </p>
            <button
              type="submit"
              disabled={mutation.isPending || interests.length === 0}
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:opacity-90 disabled:opacity-50"
            >
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Find my destinations
            </button>
          </div>
        </form>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        {mutation.isError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Something went wrong. Please try again.
          </div>
        )}
        {mutation.isSuccess && mutation.data && <Results results={mutation.data.results} />}
        {!mutation.data && !mutation.isPending && <EmptyHint />}
      </section>
    </div>
  );
}

const selectCls = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="mb-2 flex items-baseline justify-between">
        <label className="text-sm font-semibold text-foreground">{label}</label>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-background text-foreground hover:border-foreground/40 hover:bg-secondary"
      }`}
    >
      {children}
    </button>
  );
}

function EmptyHint() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center text-sm text-muted-foreground">
      Pick what you love and hit <b className="text-foreground">Find my destinations</b>. Results will appear here, ranked.
    </div>
  );
}

function Results({ results }: { results: DreamResultItem[] }) {
  if (results.length === 0) {
    return <p className="text-center text-muted-foreground">No matches. Try widening your filters.</p>;
  }
  const resultsWithImages = results.map(r => ({ ...r, hero_image: getHeroImage(r.id) }));
  const [top, ...rest] = resultsWithImages;

  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    setAiInsight(null);
    setLoadingAi(true);
    api.ai.dreamEnhance({ name: top.name, interests: top.interests })
      .then(res => setAiInsight(res.text))
      .catch(() => setAiInsight("Unable to load AI insight at this time."))
      .finally(() => setLoadingAi(false));
  }, [top.id]);

  return (
    <div>
      <div className="mb-6 flex items-baseline justify-between">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">Your ranked picks</h2>
        <span className="text-sm text-muted-foreground">{results.length} matches</span>
      </div>

      {/* Top card — featured */}
      <article className="mb-8 grid overflow-hidden rounded-2xl border border-border bg-card shadow-card md:grid-cols-[1.2fr_1fr]">
        <div className="relative h-64 md:h-auto">
          <img src={top.hero_image} alt={top.name} className="h-full w-full object-cover" />
          <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1 text-xs font-bold text-background">
            <Star className="h-3 w-3 fill-current" /> Rank #1 · {Math.round(top.ranked.total_score * 100)}/100
          </span>
        </div>
        <div className="p-6 sm:p-8">
          <div className="text-sm font-medium text-muted-foreground">
            <MapPin className="mr-1 inline h-3.5 w-3.5" />
            {top.state}
          </div>
          <h3 className="mt-1 font-display text-3xl font-bold tracking-tight">{top.name}</h3>
          <p className="mt-1 text-muted-foreground">{top.tagline}</p>
          <p className="mt-3 rounded-lg border border-border bg-brand-soft p-3 text-sm font-medium text-foreground">
            ✨ {top.ranked.verdict}
          </p>
          
          {loadingAi ? (
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.3 animate-spin" /> Curating AI insights...
            </div>
          ) : aiInsight && (
            <div className="mt-4 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/50 p-4">
              <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700">
                <Sparkles className="h-3 w-3" /> AI Perspective
              </div>
              <p className="text-sm italic text-indigo-900/80 leading-relaxed">
                "{aiInsight}"
              </p>
            </div>
          )}

          <ul className="mt-4 space-y-1 text-sm text-foreground/80">
            {top.reasons.map((r) => (
              <li key={r}>· {r}</li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <div>
              <div className="text-xs text-muted-foreground">Estimated trip cost</div>
              <div className="font-display text-2xl font-bold text-foreground">
                ₹{top.estimated_cost_inr.toLocaleString("en-IN")}
              </div>
              <div className="text-xs text-muted-foreground">
                ~₹{top.per_person_per_day_inr.toLocaleString("en-IN")} per person / day
              </div>
            </div>
            <Link
              to="/plan"
              search={{ dest: top.id }}
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90"
            >
              Plan this trip <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </article>

      {/* Comparison table */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border bg-secondary/50 px-5 py-3">
          <h3 className="font-display text-sm font-semibold text-foreground">Full ranking — comparison</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-secondary/30 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Destination</th>
                <th className="px-4 py-3 text-left">State</th>
                <th className="px-4 py-3 text-right">Score</th>
                <th className="px-4 py-3 text-right">Cost</th>
                <th className="px-4 py-3 text-right">/Person/day</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {results.map((r) => (
                <tr key={r.id} className="hover:bg-secondary/40">
                  <td className="px-4 py-3 font-display font-bold text-foreground">{r.ranked.rank}</td>
                  <td className="px-4 py-3 font-semibold text-foreground">{r.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.state}</td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">{Math.round(r.ranked.total_score * 100)}</td>
                  <td className="px-4 py-3 text-right text-foreground">₹{r.estimated_cost_inr.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">₹{r.per_person_per_day_inr.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right">
                    <Link to="/plan" search={{ dest: r.id }} className="text-xs font-semibold text-brand hover:underline">
                      Plan →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((r) => (
          <Link
            key={r.id}
            to="/plan"
            search={{ dest: r.id }}
            className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-0.5 hover:shadow-card"
          >
            <div className="relative h-40">
              <img src={r.hero_image} alt={r.name} className="h-full w-full object-cover" />
              <span className="absolute left-3 top-3 rounded-full bg-background/95 px-2 py-0.5 text-xs font-bold text-foreground">
                #{r.ranked.rank} · {Math.round(r.ranked.total_score * 100)}/100
              </span>
            </div>
            <div className="p-4">
              <div className="flex items-baseline justify-between">
                <h3 className="font-display font-bold text-foreground">{r.name}</h3>
                <span className="text-xs text-muted-foreground">{r.state}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.tagline}</p>
              <p className="mt-2 text-xs font-medium text-brand">{r.ranked.verdict}</p>
              <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
                <span className="text-sm font-semibold">₹{r.estimated_cost_inr.toLocaleString("en-IN")}</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand">
                  Plan <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-dashed border-border bg-secondary/40 p-5 text-sm text-foreground/80">
        <b className="text-foreground">How we rank:</b> a weighted blend of interest match, season fit, duration fit,
        total cost and uniqueness (lower crowd factor). Cost weight increases when you set a budget; uniqueness
        weight increases when you ask to avoid crowds. No hidden picks, no paid placements.
      </div>
    </div>
  );
}
