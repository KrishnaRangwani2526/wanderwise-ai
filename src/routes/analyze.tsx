import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Loader2, ArrowRight, AlertTriangle, Lightbulb, Sparkles, MapPin } from "lucide-react";
import { analyzeText, type AnalyzeResult } from "@/lib/engines/analyze";

export const Route = createFileRoute("/analyze")({
  head: () => ({
    meta: [
      { title: "Analyze — Audit any itinerary | WanderCompanion" },
      { name: "description", content: "Paste a URL, PDF text or reel caption — we'll surface budget, season fit, gaps and improvements." },
      { property: "og:title", content: "Analyze — Audit any itinerary" },
      { property: "og:description", content: "Smart feedback on any travel plan you've seen online." },
    ],
  }),
  component: AnalyzePage,
});

const SAMPLES: { label: string; text: string }[] = [
  {
    label: "Rajasthan blog",
    text: "10 day Rajasthan trip covering Jaipur, Jodhpur, Udaipur and Jaisalmer in June for 4 travelers, budget around ₹80000. Want forts, palaces and desert experience.",
  },
  {
    label: "Kerala reel",
    text: "Munnar tea gardens, Alleppey houseboat, Kochi street food. 5 days in monsoon. 2 people. Looking for backwaters and food.",
  },
  {
    label: "Himalayan trek",
    text: "Trekking trip to Manali and Spiti in December for 7 days, 3 people. Snow and mountains. Budget ₹45000.",
  },
];

function AnalyzePage() {
  const [text, setText] = useState("");
  const [source, setSource] = useState("text");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AnalyzeResult | null>(null);

  function run(payload?: string) {
    const t = payload ?? text;
    if (!t.trim()) return;
    setBusy(true);
    setTimeout(() => {
      setResult(analyzeText({ text: t, source_label: source }));
      setBusy(false);
    }, 250);
  }

  return (
    <div className="bg-muted/30">
      <section className="bg-ocean-grad px-4 py-12 text-white sm:py-16">
        <div className="mx-auto max-w-5xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
            <Search className="h-3.5 w-3.5" /> Analyze
          </span>
          <h1 className="mt-3 text-3xl font-black sm:text-5xl">Audit any plan in seconds</h1>
          <p className="mt-2 max-w-2xl text-white/90">
            Paste itinerary text, a blog excerpt, PDF copy or a reel caption. We extract the route,
            budget, season fit and concrete improvements — all offline.
          </p>
        </div>
      </section>

      <section className="mx-auto -mt-6 max-w-5xl px-4">
        <div className="shadow-card rounded-3xl border border-border bg-card p-5 sm:p-7">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <label className="text-sm font-semibold">Source:</label>
            {(["text", "url", "pdf", "reel"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSource(s)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase transition ${
                  source === s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-primary/50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={7}
            placeholder="Paste itinerary text, a URL's content, or a reel caption…"
            className="w-full rounded-xl border border-input bg-background p-3 text-sm focus:border-primary focus:outline-none"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground">Try:</span>
              {SAMPLES.map((s) => (
                <button
                  key={s.label}
                  onClick={() => { setText(s.text); run(s.text); }}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs hover:border-primary/50"
                >
                  {s.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => run()}
              disabled={busy || !text.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90 disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Analyze
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        {result ? <Output r={result} /> : (
          <div className="rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center text-sm text-muted-foreground">
            Paste any travel text above. Results appear here.
          </div>
        )}
      </section>
    </div>
  );
}

function Output({ r }: { r: AnalyzeResult }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-5">
        <div className="shadow-card rounded-2xl bg-card p-5">
          <h2 className="text-xl font-bold">Extracted route</h2>
          {r.matched_destinations.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              We couldn't identify destinations. Try naming a city.
            </p>
          ) : (
            <ol className="mt-3 space-y-2">
              {r.matched_destinations.map((m, i) => (
                <li key={m.destination.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                  <span className="bg-sunset grid h-7 w-7 place-items-center rounded-full text-xs font-bold text-white">{i + 1}</span>
                  <img src={m.destination.hero_image} alt="" className="h-12 w-16 rounded-md object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">{m.destination.name}</div>
                    <div className="text-xs text-muted-foreground">{m.destination.state} · {m.destination.tagline}</div>
                  </div>
                  <Link to="/plan" search={{ dest: m.destination.id }} className="hidden text-xs font-semibold text-primary sm:inline-flex">
                    Plan →
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>

        {r.suggestions.length > 0 && (
          <div className="rounded-2xl border border-accent/40 bg-accent/10 p-5">
            <h3 className="flex items-center gap-2 font-bold"><Lightbulb className="h-4 w-4" /> Improvement suggestions</h3>
            <ul className="mt-2 space-y-1.5 text-sm">
              {r.suggestions.map((s) => <li key={s}>· {s}</li>)}
            </ul>
          </div>
        )}

        {r.must_add.length > 0 && (
          <div className="shadow-card rounded-2xl bg-card p-5">
            <h3 className="font-bold">Don't miss — nearby underrated picks</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {r.must_add.map(({ destination: d, reason }) => (
                <Link key={d.id} to="/plan" search={{ dest: d.id }} className="group overflow-hidden rounded-xl border border-border bg-background">
                  <img src={d.hero_image} alt={d.name} className="h-24 w-full object-cover transition group-hover:scale-105" />
                  <div className="p-3">
                    <div className="text-sm font-bold">{d.name}</div>
                    <div className="text-[11px] text-muted-foreground">{reason}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <aside className="space-y-4">
        <div className="bg-spice-grad rounded-2xl p-5 text-white">
          <div className="text-xs uppercase tracking-wider opacity-80">Estimated total cost</div>
          <div className="text-3xl font-black">₹{r.estimated_total_cost_inr.toLocaleString("en-IN")}</div>
          <div className="text-xs opacity-80">
            {r.detected_travelers ?? 2} travelers · {r.detected_days ?? 5} days
          </div>
        </div>
        <Stat label="Best season" value={r.estimated_best_season ?? "—"} />
        <Stat label="Detected days" value={r.detected_days ?? "not stated"} />
        <Stat label="Detected travelers" value={r.detected_travelers ?? "not stated"} />
        <Stat label="Stated budget" value={r.detected_budget_inr ? `₹${r.detected_budget_inr.toLocaleString("en-IN")}` : "—"} />
        <Stat label="Interests" value={r.detected_interests.join(", ") || "—"} />

        {r.warnings.length > 0 && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertTriangle className="mb-1 inline h-3.5 w-3.5" /> {r.warnings.join(" · ")}
          </div>
        )}

        {r.matched_destinations[0] && (
          <Link
            to="/optimize"
            search={{ ids: r.matched_destinations.map((m) => m.destination.id).join(","), days: r.detected_days ?? 5, budget: r.detected_budget_inr ?? 0 }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Optimize this plan <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </aside>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}
