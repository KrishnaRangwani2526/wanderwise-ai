import { createFileRoute } from "@tanstack/react-router";
import { DESTINATIONS } from "@/data/destinations";
import { Camera } from "lucide-react";

export const Route = createFileRoute("/sightsee")({
  head: () => ({
    meta: [
      { title: "Sightsee — A scenic gallery of India | WanderCompanion" },
      { name: "description", content: "A curated photo gallery of every destination on your list." },
      { property: "og:title", content: "Sightsee — A scenic gallery of India" },
      { property: "og:description", content: "Visual inspiration before you go." },
    ],
  }),
  component: SightseePage,
});

function SightseePage() {
  return (
    <div className="bg-background">
      <section className="border-b border-border bg-muted/30 px-4 py-14">
        <div className="mx-auto max-w-5xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold text-foreground/70">
            <Camera className="h-3.5 w-3.5 text-primary" /> Sightsee
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            A scenic India, in a single scroll
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Visual previews of every destination in our engine. Pick a vibe to spark your next trip.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {DESTINATIONS.map((d) => (
            <figure
              key={d.id}
              className="group relative overflow-hidden rounded-2xl shadow-soft transition hover:-translate-y-0.5 hover:shadow-card"
            >
              <img
                src={d.hero_image}
                alt={d.name}
                loading="lazy"
                decoding="async"
                className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <figcaption className="glass absolute inset-x-3 bottom-3 rounded-xl p-3 shadow-glass">
                <div className="text-sm font-semibold text-foreground">{d.name}</div>
                <div className="text-[11px] text-muted-foreground">{d.state}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}
