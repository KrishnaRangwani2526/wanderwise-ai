import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Sliders, ArrowRight, Sparkles, Check, X } from "lucide-react";
import { DESTINATIONS, type Destination } from "@/data/destinations";
import { estimateCostForDestination, type CostStyle } from "@/lib/engines/cost";
import { optimizeRoute } from "@/lib/engines/route";
import { compareAndRank } from "@/lib/engines/rank";
import { PageHero } from "@/components/PageHero";

interface Search {
  ids?: string;
  days?: number;
  budget?: number;
}

export const Route = createFileRoute("/optimize")({
  head: () => ({
    meta: [
      { title: "Optimize — Tighten your trip | WanderCompanion" },
      { name: "description", content: "Refine destinations, budget, days and must-sees. Get an optimized route and ranked variants." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): Search => ({
    ids: typeof s.ids === "string" ? s.ids : undefined,
    days: typeof s.days === "number" ? s.days : s.days ? Number(s.days) : undefined,
    budget: typeof s.budget === "number" ? s.budget : s.budget ? Number(s.budget) : undefined,
  }),
  component: OptimizePage,
});

const inputCls = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

function OptimizePage() {
  const { ids, days: dDays, budget: dBudget } = Route.useSearch();
  const initialIds = useMemo(() => (ids ? ids.split(",").filter(Boolean) : ["jaipur", "udaipur", "jodhpur"]), [ids]);
  const [selected, setSelected] = useState<string[]>(initialIds);
  const [days, setDays] = useState(dDays || 8);
  const [travelers, setTravelers] = useState(2);
  const [budget, setBudget] = useState(dBudget || 0);
  const [style, setStyle] = useState<CostStyle>("mid");

  const dests = selected.map((id) => DESTINATIONS.find((d) => d.id === id)).filter(Boolean) as Destination[];

  const route = useMemo(() => optimizeRoute({
    stops: dests.map((d) => ({ id: d.id, name: d.name, lat: d.lat, lng: d.lng })),
  }), [dests]);

  const orderedDests = route.order.map((id) => dests.find((d) => d.id === id)!).filter(Boolean);

  const variants = useMemo(() => {
    if (orderedDests.length === 0) return [];
    return [
      { key: "lean", label: "Lean & cheap", style: "budget" as CostStyle, drop: Math.max(0, orderedDests.length - 3), pace: "packed" },
      { key: "balanced", label: "Balanced", style, drop: 0, pace: "balanced" },
      { key: "explore", label: "Slow & explore", style: "comfort" as CostStyle, drop: 0, pace: "easy" },
    ].map((v) => {
      const used = orderedDests.slice(0, orderedDests.length - v.drop);
      const perDest = days / Math.max(1, used.length);
      const cost = used.reduce(
        (s, d) => s + estimateCostForDestination(d, { destination_id: d.id, duration_days: perDest, travelers, style: v.style, include_flight: false }).grand_total_inr,
        0,
      );
      return { ...v, used, cost, days_each: Math.round(perDest * 10) / 10 };
    });
  }, [orderedDests, days, travelers, style]);

  const ranked = useMemo(() => compareAndRank(
    variants.map((v) => ({
      id: v.key, name: v.label, cost_inr: v.cost,
      match_score: budget > 0 ? Math.max(0, 1 - Math.max(0, v.cost - budget) / Math.max(1, budget)) : 0.6,
      duration_fit: 1, crowd_factor: 0.5,
    })),
    { cost: budget > 0 ? 0.55 : 0.35, match: 0.25, duration_fit: 0.1, uniqueness: 0.1, season: 0 },
  ), [variants, budget]);

  function toggle(id: string) {
    setSelected((arr) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]));
  }

  return (
    <div>
      <PageHero
        eyebrow="Step 04 · Optimize"
        icon={<Sliders className="h-3.5 w-3.5" />}
        title={<>Tighten the trip. <span className="text-brand-gradient">Keep the magic.</span></>}
        description="Drop, swap and re-rank destinations against budget, days and must-sees. Route auto-orders for minimum distance."
      />

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-7">
          <div className="mb-4">
            <div className="mb-2 text-sm font-semibold text-foreground">Destinations in your plan ({selected.length})</div>
            <div className="flex flex-wrap gap-2">
              {DESTINATIONS.map((d) => {
                const on = selected.includes(d.id);
                return (
                  <button
                    key={d.id}
                    onClick={() => toggle(d.id)}
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      on
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-background text-foreground hover:border-foreground/40"
                    }`}
                  >
                    {on ? <Check className="h-3 w-3" /> : null}{d.name}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <NumberField label={`Total days: ${days}`} value={days} min={2} max={40} onChange={setDays} />
            <NumberField label={`Travelers: ${travelers}`} value={travelers} min={1} max={10} onChange={setTravelers} />
            <NumberField label={`Budget ₹ (0 = any)`} value={budget} min={0} max={500000} step={5000} onChange={setBudget} />
            <div>
              <div className="mb-2 text-sm font-semibold text-foreground">Style</div>
              <select value={style} onChange={(e) => setStyle(e.target.value as CostStyle)} className={inputCls}>
                {(["shoestring", "budget", "mid", "comfort", "luxury"] as CostStyle[]).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        {orderedDests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center text-sm text-muted-foreground">
            Pick at least one destination to optimize.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-display text-xl font-bold text-foreground">Optimized order</h2>
                <span className="text-xs text-muted-foreground">{route.total_km} km · 2-opt</span>
              </div>
              <p className="text-xs text-muted-foreground">Nearest-neighbor + 2-opt across {orderedDests.length} stops.</p>

              <div className="mt-4 overflow-hidden rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left">#</th>
                      <th className="px-3 py-2 text-left">Stop</th>
                      <th className="px-3 py-2 text-left">State</th>
                      <th className="px-3 py-2 text-right">Leg</th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orderedDests.map((d, i) => {
                      const leg = route.legs[i];
                      return (
                        <tr key={d.id} className="hover:bg-secondary/30">
                          <td className="px-3 py-2 font-display font-bold text-foreground">{i + 1}</td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <img src={d.hero_image} alt="" className="h-8 w-12 rounded object-cover" />
                              <span className="font-semibold text-foreground">{d.name}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">{d.state}</td>
                          <td className="px-3 py-2 text-right text-xs font-semibold text-brand">
                            {leg && i < orderedDests.length - 1 ? `${leg.km} km` : "—"}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <button onClick={() => toggle(d.id)} className="text-muted-foreground hover:text-destructive">
                              <X className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold text-foreground">3 ranked variants</h2>
              {ranked.map((r) => {
                const v = variants.find((x) => x.key === r.id)!;
                return (
                  <article key={r.id} className={`rounded-2xl border bg-card p-5 shadow-soft ${r.rank === 1 ? "border-foreground/30 ring-brand" : "border-border"}`}>
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-xs font-bold uppercase text-brand">#{r.rank}</span>
                        <h3 className="font-display text-lg font-bold text-foreground">{v.label}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Total cost</div>
                        <div className="font-display text-xl font-bold text-foreground">₹{v.cost.toLocaleString("en-IN")}</div>
                      </div>
                    </div>
                    <p className="mt-2 rounded-lg border border-border bg-brand-soft p-2 text-xs text-foreground/80">{r.verdict}</p>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {v.used.length} stops · ~{v.days_each} days each · {v.pace} pace
                    </div>
                    {r.rank === 1 && (
                      <Link
                        to="/travel"
                        search={{ ids: v.used.map((d) => d.id).join(",") }}
                        className="mt-3 inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background"
                      >
                        Open in Travel <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </article>
                );
              })}
              <div className="rounded-xl border border-dashed border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
                <Sparkles className="mb-1 inline h-3.5 w-3.5 text-brand" /> Rank weighs <b className="text-foreground">cost</b> heavier when you set a budget. Lean drops the tail-end stop; Explore stretches days at comfort tier.
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function NumberField({ label, value, onChange, min, max, step }: { label: string; value: number; onChange: (n: number) => void; min: number; max: number; step?: number }) {
  return (
    <div>
      <div className="mb-2 text-sm font-semibold text-foreground">{label}</div>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step ?? 1}
        onChange={(e) => onChange(Number(e.target.value))}
        className={inputCls}
      />
    </div>
  );
}
