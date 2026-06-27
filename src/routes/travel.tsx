import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { Navigation, MapPin, Utensils, Camera, Hotel } from "lucide-react";
import { DESTINATIONS, type Destination } from "@/data/destinations";
import { optimizeRoute } from "@/lib/engines/route";
import { PageHero } from "@/components/PageHero";

const LeafletMap = lazy(() => import("@/components/LeafletMap"));

interface Search { ids?: string }

export const Route = createFileRoute("/travel")({
  head: () => ({
    meta: [
      { title: "Travel — Live route, viewpoints, food | WanderCompanion" },
      { name: "description", content: "Map of your route, distance between stops, hotel/restaurant/viewpoint suggestions and famous local food." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): Search => ({
    ids: typeof s.ids === "string" ? s.ids : undefined,
  }),
  component: TravelPage,
});

function TravelPage() {
  const { ids } = Route.useSearch();
  const initial = useMemo(
    () => (ids ? ids.split(",").filter(Boolean) : ["jaipur", "jodhpur", "udaipur"]),
    [ids],
  );
  const [selected, setSelected] = useState<string[]>(initial);

  const dests = selected.map((id) => DESTINATIONS.find((d) => d.id === id)).filter(Boolean) as Destination[];

  const route = useMemo(
    () => optimizeRoute({ stops: dests.map((d) => ({ id: d.id, lat: d.lat, lng: d.lng })) }),
    [dests],
  );
  const ordered = route.order.map((id) => dests.find((d) => d.id === id)!).filter(Boolean);

  const [active, setActive] = useState(0);
  const focus = ordered[active];

  return (
    <div>
      <PageHero
        eyebrow="Step 07 · Travel"
        icon={<Navigation className="h-3.5 w-3.5" />}
        title={<>Your <span className="text-brand-gradient">on-the-road</span> copilot.</>}
        description="See your stops on the map. Click any stop to surface viewpoints, restaurants, hotels and famous food nearby."
      />

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-4 flex flex-wrap gap-2">
          {DESTINATIONS.map((d) => {
            const on = selected.includes(d.id);
            return (
              <button
                key={d.id}
                onClick={() => setSelected((arr) => (on ? arr.filter((x) => x !== d.id) : [...arr, d.id]))}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  on ? "border-foreground bg-foreground text-background" : "border-border bg-background text-foreground hover:border-foreground/40"
                }`}
              >
                {d.name}
              </button>
            );
          })}
        </div>

        {ordered.length === 0 ? (
          <Empty />
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
              <MapView stops={ordered} active={active} onPick={setActive} totalKm={route.total_km} />
              <div className="border-t border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <div className="font-semibold text-foreground">{ordered.length} stops · {route.total_km} km optimized</div>
                  <div className="text-xs text-muted-foreground">2-opt nearest-neighbor route</div>
                </div>
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {ordered.map((d, i) => (
                    <button
                      key={d.id}
                      onClick={() => setActive(i)}
                      className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition ${
                        i === active ? "border-foreground bg-foreground text-background" : "border-border bg-background text-foreground"
                      }`}
                    >
                      <span className="font-bold">{i + 1}.</span> {d.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {focus && <FocusPanel d={focus} />}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-5 text-sm text-muted-foreground">
          <b className="text-foreground">Travel mode</b> uses your itinerary's lat/lng to draw the route, compute distances and surface curated viewpoints, restaurants, hotels and famous food per stop.{" "}
          <Link to="/book" className="text-brand underline-offset-4 hover:underline">Book transport →</Link>
        </div>
      </section>
    </div>
  );
}

function MapView({ stops, active, onPick, totalKm }: { stops: Destination[]; active: number; onPick: (i: number) => void; totalKm: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="relative">
      {mounted ? (
        <Suspense fallback={<div className="grid h-[480px] w-full place-items-center bg-secondary text-sm text-muted-foreground">Loading map…</div>}>
          <LeafletMap stops={stops} active={active} onPick={onPick} />
        </Suspense>
      ) : (
        <div className="h-[480px] w-full bg-secondary" />
      )}
      <div className="pointer-events-none absolute bottom-3 left-3 z-[400] rounded-full border border-border bg-background/95 px-3 py-1 text-xs font-bold text-foreground shadow-soft">
        {totalKm} km total
      </div>
    </div>
  );
}

function FocusPanel({ d }: { d: Destination }) {
  return (
    <aside className="space-y-3 overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="relative h-44 overflow-hidden">
        <img src={d.hero_image} alt={d.name} className="h-full w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
          <div className="text-xs opacity-80"><MapPin className="-mt-0.5 mr-1 inline h-3 w-3" />{d.state}</div>
          <h3 className="font-display text-2xl font-bold tracking-tight">{d.name}</h3>
          <p className="text-xs opacity-90">{d.tagline}</p>
        </div>
      </div>
      <div className="space-y-3 p-5 pt-2">
        <Block icon={Camera} title="Viewpoints & must-see">
          <ul className="space-y-1">
            {d.highlights.map((h) => (
              <li key={h} className="text-sm text-foreground/85">· {h}</li>
            ))}
          </ul>
        </Block>
        <Block icon={Utensils} title="Famous local food">
          <div className="flex flex-wrap gap-2">
            {d.famous_food.map((f) => (
              <span key={f} className="rounded-full border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-foreground">{f}</span>
            ))}
          </div>
        </Block>
        <Block icon={Hotel} title="Stay & transport">
          <div className="text-xs text-muted-foreground">
            Nearest airport <b className="text-foreground">{d.nearest_airport_iata}</b> · Railhead <b className="text-foreground">{d.nearest_railhead}</b><br />
            Mid-range stay ~₹{Math.round(d.cost_per_day_inr * 0.45).toLocaleString("en-IN")} / night
          </div>
          <Link to="/book" className="mt-2 inline-flex rounded-full bg-foreground px-3 py-1.5 text-xs font-bold text-background hover:opacity-90">
            Book this stop
          </Link>
        </Block>
      </div>
    </aside>
  );
}

function Block({ icon: I, title, children }: { icon: typeof Camera; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="mb-1.5 flex items-center gap-2 text-sm font-bold text-foreground"><I className="h-4 w-4 text-brand" /> {title}</div>
      {children}
    </div>
  );
}

function Empty() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center text-sm text-muted-foreground">
      Pick destinations above to draw your route.
    </div>
  );
}
