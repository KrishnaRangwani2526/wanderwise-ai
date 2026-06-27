import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CalendarDays, Loader2, MapPin, Sparkles, Trophy, Users, Wallet } from "lucide-react";
import { DESTINATIONS } from "@/data/destinations";
import { planTrip, type PlanRequest } from "@/lib/plan.functions";

export const Route = createFileRoute("/plan")({
  validateSearch: (s: Record<string, unknown>) => ({
    dest: typeof s.dest === "string" ? s.dest : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Plan — 3 ranked itineraries | WanderCompanion" },
      { name: "description", content: "Pick dates, travelers and budget. Get three day-by-day itineraries ranked for you." },
      { property: "og:title", content: "Plan — Build a smart itinerary" },
      { property: "og:description", content: "Three ranked itinerary options under your constraints." },
    ],
  }),
  component: PlanPage,
});

const PACE_TINT: Record<string, string> = {
  easy: "bg-emerald-100 text-emerald-800",
  balanced: "bg-sky-100 text-sky-800",
  packed: "bg-amber-100 text-amber-800",
};

function PlanPage() {
  const { dest: destFromSearch } = Route.useSearch();
  const planFn = useServerFn(planTrip);

  const [destId, setDestId] = useState(destFromSearch ?? DESTINATIONS[0].id);
  const [startDate, setStartDate] = useState("");
  const [days, setDays] = useState(5);
  const [travelers, setTravelers] = useState(2);
  const [style, setStyle] = useState<PlanRequest["style"]>("mid");
  const [budget, setBudget] = useState(0);
  const [likes, setLikes] = useState("food, scenic views");
  const [dislikes, setDislikes] = useState("crowds");
  const [includeFlight, setIncludeFlight] = useState(true);

  const dest = useMemo(() => DESTINATIONS.find((d) => d.id === destId)!, [destId]);

  const mutation = useMutation({
    mutationFn: async (req: PlanRequest) => planFn({ data: req }),
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate({
      destination_id: destId,
      start_date: startDate || undefined,
      duration_days: days,
      travelers,
      style,
      budget_inr: budget > 0 ? budget : undefined,
      likes: likes.split(",").map((s) => s.trim()).filter(Boolean),
      dislikes: dislikes.split(",").map((s) => s.trim()).filter(Boolean),
      include_flight: includeFlight,
    });
  }

  const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  return (
    <div className="bg-muted/30">
      <section className="bg-jungle px-4 py-12 text-white sm:py-16">
        <div className="mx-auto max-w-5xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Step 2 — Plan
          </span>
          <h1 className="mt-3 text-3xl font-black sm:text-5xl">Three itineraries, ranked.</h1>
          <p className="mt-2 max-w-2xl text-white/90">
            Pick a destination (or pull one from Dream), tell us about your trip — we'll generate
            three day-by-day options and rank them for you with reasons.
          </p>
        </div>
      </section>

      <section className="mx-auto -mt-6 max-w-5xl px-4">
        <form
          onSubmit={onSubmit}
          className="shadow-card rounded-3xl border border-border bg-card p-5 sm:p-7"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Destination" icon={<MapPin className="h-4 w-4" />}>
              <select
                value={destId}
                onChange={(e) => setDestId(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                {DESTINATIONS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.state}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-muted-foreground">{dest.tagline}</p>
            </Field>
            <Field label="Start date (optional)" icon={<CalendarDays className="h-4 w-4" />}>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </Field>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Field label={`Days: ${days}`}>
              <input type="range" min={2} max={20} value={days} onChange={(e) => setDays(+e.target.value)} className="w-full accent-primary" />
            </Field>
            <Field label={`Travelers: ${travelers}`} icon={<Users className="h-4 w-4" />}>
              <input type="range" min={1} max={10} value={travelers} onChange={(e) => setTravelers(+e.target.value)} className="w-full accent-primary" />
            </Field>
            <Field label="Travel style">
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value as PlanRequest["style"])}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="shoestring">Shoestring</option>
                <option value="budget">Budget</option>
                <option value="mid">Mid</option>
                <option value="comfort">Comfort</option>
                <option value="luxury">Luxury</option>
              </select>
            </Field>
            <Field label="Total budget ₹ (0 = any)" icon={<Wallet className="h-4 w-4" />}>
              <input
                type="number"
                min={0}
                step={1000}
                value={budget}
                onChange={(e) => setBudget(+e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </Field>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Likes (comma separated)">
              <input value={likes} onChange={(e) => setLikes(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            </Field>
            <Field label="Dislikes (comma separated)">
              <input value={dislikes} onChange={(e) => setDislikes(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            </Field>
          </div>

          <label className="mt-5 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={includeFlight} onChange={(e) => setIncludeFlight(e.target.checked)} className="h-4 w-4 accent-primary" />
            Include round-trip flight from Delhi (DEL) in cost
          </label>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">Engine: deterministic itinerary + multi-criteria rank. Local, no AI.</p>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-card transition hover:opacity-90 disabled:opacity-60"
            >
              {mutation.isPending ? (<><Loader2 className="h-4 w-4 animate-spin" /> Planning…</>) : (<><Sparkles className="h-4 w-4" /> Generate 3 itineraries</>)}
            </button>
          </div>
        </form>
      </section>

      <section className="mx-auto mt-10 max-w-6xl px-4 pb-16">
        {mutation.isError && (
          <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Something went wrong. Try again.
          </p>
        )}

        {mutation.data && (
          <>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black sm:text-3xl">{mutation.data.destination.name} — 3 options</h2>
                <p className="text-sm text-muted-foreground">{mutation.data.destination.tagline}</p>
              </div>
              <Link to="/optimize" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
                Send to Optimize →
              </Link>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {mutation.data.options.map((opt) => (
                <article
                  key={opt.variant}
                  className={`shadow-card rounded-3xl border bg-card p-5 ${opt.ranked.rank === 1 ? "border-primary ring-2 ring-primary/30" : "border-border"}`}
                >
                  <header className="mb-3 flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{opt.variant}</p>
                      <h3 className="text-lg font-extrabold">{opt.label}</h3>
                    </div>
                    {opt.ranked.rank === 1 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
                        <Trophy className="h-3 w-3" /> #1
                      </span>
                    )}
                  </header>

                  <p className="text-sm text-muted-foreground">{opt.blurb}</p>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className={`rounded-full px-2.5 py-1 font-medium ${PACE_TINT[opt.pace]}`}>{opt.pace}</span>
                    <span className="rounded-full bg-muted px-2.5 py-1 font-medium">{opt.duration_days} days</span>
                    <span className="rounded-full bg-muted px-2.5 py-1 font-medium">{inr(opt.cost_inr)}</span>
                    <span className="rounded-full bg-muted px-2.5 py-1 font-medium">{inr(opt.per_person_per_day_inr)}/day/pp</span>
                  </div>

                  <ol className="mt-4 space-y-3">
                    {opt.days.map((day) => (
                      <li key={day.day} className="rounded-xl border border-border bg-muted/30 p-3">
                        <div className="mb-1 flex items-baseline justify-between gap-2">
                          <p className="text-sm font-bold">Day {day.day} · {day.title}</p>
                          {day.date && <span className="text-[11px] text-muted-foreground">{day.date}</span>}
                        </div>
                        <p className="text-xs"><b>AM:</b> {day.morning}</p>
                        <p className="text-xs"><b>PM:</b> {day.afternoon}</p>
                        <p className="text-xs"><b>Eve:</b> {day.evening}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">🍽 {day.food_pick}</p>
                      </li>
                    ))}
                  </ol>

                  <div className="mt-4 rounded-xl bg-muted p-3">
                    <p className="text-xs font-semibold">Why this rank ({opt.ranked.verdict})</p>
                    <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                      {opt.reasons.map((r, i) => (<li key={i}>• {r}</li>))}
                    </ul>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Link to="/book" className="flex-1 rounded-full bg-primary px-3 py-2 text-center text-xs font-semibold text-primary-foreground hover:opacity-90">
                      Book this
                    </Link>
                    <Link to="/travel" className="flex-1 rounded-full border border-border px-3 py-2 text-center text-xs font-semibold hover:bg-muted">
                      Map & route
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {!mutation.data && !mutation.isPending && (
          <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
            Set your preferences above and hit <b>Generate 3 itineraries</b>.
          </div>
        )}
      </section>
    </div>
  );
}

function Field({ label, hint, icon, children }: { label: string; hint?: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        {icon}{label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}
