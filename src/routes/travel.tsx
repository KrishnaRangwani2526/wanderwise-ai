import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { Navigation, MapPin, Utensils, Camera, Hotel } from "lucide-react";
import { DESTINATIONS, type Destination } from "@/data/destinations";
import { optimizeRoute } from "@/lib/engines/route";

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

  const dests = selected
    .map((id) => DESTINATIONS.find((d) => d.id === id))
    .filter(Boolean) as Destination[];

  const route = useMemo(
    () => optimizeRoute({ stops: dests.map((d) => ({ id: d.id, lat: d.lat, lng: d.lng })) }),
    [dests],
  );
  const ordered = route.order.map((id) => dests.find((d) => d.id === id)!).filter(Boolean);

  const [active, setActive] = useState(0);
  const focus = ordered[active];

  return (
    <div className="bg-muted/30">
      <section className="bg-jungle-grad px-4 py-10 text-white sm:py-14">
        <div className="mx-auto max-w-7xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
            <Navigation className="h-3.5 w-3.5" /> Travel
          </span>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">On-the-road copilot</h1>
          <p className="mt-2 max-w-2xl text-white/90 text-sm">
            See your stops on the map, click any to surface viewpoints, restaurants, hotels and famous food nearby.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4 flex flex-wrap gap-2">
          {DESTINATIONS.map((d) => {
            const on = selected.includes(d.id);
            return (
              <button
                key={d.id}
                onClick={() => setSelected((arr) => (on ? arr.filter((x) => x !== d.id) : [...arr, d.id]))}
                className={`rounded-full border px-3 py-1 text-xs font-medium ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-primary/50"}`}
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
            <div className="shadow-card overflow-hidden rounded-3xl bg-card">
              <MapView stops={ordered} active={active} onPick={setActive} totalKm={route.total_km} />
              <div className="border-t border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <div className="font-semibold">{ordered.length} stops · {route.total_km} km optimized</div>
                  <div className="text-xs text-muted-foreground">2-opt nearest-neighbor route</div>
                </div>
                <div className="mt-3 flex gap-2 overflow-x-auto">
                  {ordered.map((d, i) => (
                    <button
                      key={d.id}
                      onClick={() => setActive(i)}
                      className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${i === active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"}`}
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
        <div className="rounded-2xl border border-dashed border-border bg-card p-5 text-sm text-muted-foreground">
          <b className="text-foreground">Travel mode</b> uses your itinerary's lat/lng to draw the route, compute distances and surface curated viewpoints, restaurants, hotels and famous food per stop.{" "}
          <Link to="/book" className="text-primary underline-offset-4 hover:underline">Book transport →</Link>
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
        <Suspense fallback={<div className="grid h-[480px] w-full place-items-center bg-[oklch(0.96_0.04_200)] text-sm text-muted-foreground">Loading map…</div>}>
          <LeafletMap stops={stops} active={active} onPick={onPick} />
        </Suspense>
      ) : (
        <div className="h-[480px] w-full bg-[oklch(0.96_0.04_200)]" />
      )}
      <div className="pointer-events-none absolute bottom-3 left-3 z-[400] rounded-full bg-white/95 px-3 py-1 text-xs font-bold shadow">
        {totalKm} km total
      </div>
    </div>
  );
}

function FocusPanel({ d }: { d: Destination }) {
  return (
    <aside className="shadow-card space-y-3 rounded-3xl bg-card p-5">
      <div className="relative -m-5 mb-3 h-44 overflow-hidden rounded-t-3xl">
        <img src={d.hero_image} alt={d.name} className="h-full w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
          <div className="text-xs opacity-80"><MapPin className="-mt-0.5 mr-1 inline h-3 w-3" />{d.state}</div>
          <h3 className="text-2xl font-black">{d.name}</h3>
          <p className="text-xs opacity-90">{d.tagline}</p>
        </div>
      </div>
      <Block icon={Camera} title="Viewpoints & must-see">
        <ul className="space-y-1">
          {d.highlights.map((h) => (
            <li key={h} className="text-sm">· {h}</li>
          ))}
        </ul>
      </Block>
      <Block icon={Utensils} title="Famous local food">
        <div className="flex flex-wrap gap-2">
          {d.famous_food.map((f) => (
            <span key={f} className="rounded-full bg-accent/30 px-2 py-1 text-xs font-medium">{f}</span>
          ))}
        </div>
      </Block>
      <Block icon={Hotel} title="Stay & transport">
        <div className="text-xs text-muted-foreground">
          Nearest airport <b className="text-foreground">{d.nearest_airport_iata}</b> · Railhead <b className="text-foreground">{d.nearest_railhead}</b><br />
          Mid-range stay ~₹{Math.round(d.cost_per_day_inr * 0.45).toLocaleString("en-IN")} / night
        </div>
        <Link to="/book" className="mt-2 inline-flex rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
          Book this stop
        </Link>
      </Block>
    </aside>
  );
}

function Block({ icon: I, title, children }: { icon: typeof Camera; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border p-3">
      <div className="mb-1.5 flex items-center gap-2 text-sm font-bold"><I className="h-4 w-4 text-primary" /> {title}</div>
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
