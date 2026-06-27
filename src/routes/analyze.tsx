import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Loader2, ArrowRight, AlertTriangle, Lightbulb, Sparkles } from "lucide-react";
import { analyzeText, type AnalyzeResult } from "@/lib/engines/analyze";
import { PageHero } from "@/components/PageHero";

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
    <div>
      <PageHero
        eyebrow="Step 02 · Analyze"
        icon={<Search className="h-3.5 w-3.5" />}
        title={<>Audit any plan, <span className="text-brand-gradient">in seconds.</span></>}
        description="Paste itinerary text, a blog excerpt, PDF copy or a reel caption. We extract the route, budget, season fit and concrete improvements — all offline."
      />

      <section className="mx-auto max-w-5xl px-4 py-8">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-7">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <label className="text-sm font-semibold text-foreground">Source:</label>
            {(["text", "url", "pdf", "reel"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSource(s)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider transition ${
                  source === s
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background text-foreground hover:border-foreground/40"
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
            className="w-full rounded-xl border border-input bg-background p-3 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Try:</span>
              {SAMPLES.map((s) => (
                <button
                  key={s.label}
                  onClick={() => { setText(s.text); run(s.text); }}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium hover:border-foreground/40"
                >
                  {s.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => run()}
              disabled={busy || !text.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:opacity-90 disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Analyze
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
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
        {/* Summary table */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border bg-secondary/50 px-5 py-3">
            <h2 className="font-display text-base font-semibold text-foreground">Extracted summary</h2>
          </div>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-border">
              <SumRow label="Days detected" value={r.detected_days ?? "—"} />
              <SumRow label="Travelers" value={r.detected_travelers ?? "—"} />
              <SumRow label="Stated budget" value={r.detected_budget_inr ? `₹${r.detected_budget_inr.toLocaleString("en-IN")}` : "—"} />
              <SumRow label="Best season" value={r.estimated_best_season ?? "—"} />
              <SumRow label="Interests" value={r.detected_interests.join(", ") || "—"} />
              <SumRow label="Destinations found" value={r.matched_destinations.length} />
            </tbody>
          </table>
        </div>

        {/* Route table */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border bg-secondary/50 px-5 py-3">
            <h2 className="font-display text-base font-semibold text-foreground">Extracted route</h2>
          </div>
          {r.matched_destinations.length === 0 ? (
            <p className="px-5 py-6 text-sm text-muted-foreground">
              We couldn't identify destinations. Try naming a city.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-secondary/30 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Destination</th>
                    <th className="px-4 py-3 text-left">State</th>
                    <th className="px-4 py-3 text-left">Tagline</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {r.matched_destinations.map((m, i) => (
                    <tr key={m.destination.id} className="hover:bg-secondary/40">
                      <td className="px-4 py-3 font-display font-bold text-foreground">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={m.destination.hero_image} alt="" className="h-10 w-14 rounded-md object-cover" />
                          <span className="font-semibold text-foreground">{m.destination.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{m.destination.state}</td>
                      <td className="px-4 py-3 text-muted-foreground">{m.destination.tagline}</td>
                      <td className="px-4 py-3 text-right">
                        <Link to="/plan" search={{ dest: m.destination.id }} className="text-xs font-semibold text-brand hover:underline">
                          Plan →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {r.suggestions.length > 0 && (
          <div className="rounded-2xl border border-border bg-brand-soft p-5">
            <h3 className="flex items-center gap-2 font-display font-bold text-foreground">
              <Lightbulb className="h-4 w-4 text-brand" /> Improvement suggestions
            </h3>
            <ul className="mt-3 space-y-1.5 text-sm text-foreground/85">
              {r.suggestions.map((s) => <li key={s}>· {s}</li>)}
            </ul>
          </div>
        )}

        {r.must_add.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-display font-bold text-foreground">Don't miss — nearby underrated picks</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {r.must_add.map(({ destination: d, reason }) => (
                <Link key={d.id} to="/plan" search={{ dest: d.id }} className="group overflow-hidden rounded-xl border border-border bg-background transition hover:-translate-y-0.5 hover:shadow-card">
                  <img src={d.hero_image} alt={d.name} className="h-24 w-full object-cover transition group-hover:scale-105" />
                  <div className="p-3">
                    <div className="text-sm font-bold text-foreground">{d.name}</div>
                    <div className="text-[11px] text-muted-foreground">{reason}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Estimated total cost</div>
          <div className="mt-1 font-display text-3xl font-bold text-brand-gradient">
            ₹{r.estimated_total_cost_inr.toLocaleString("en-IN")}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {r.detected_travelers ?? 2} travelers · {r.detected_days ?? 5} days
          </div>
        </div>

        {r.warnings.length > 0 && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertTriangle className="mb-1 inline h-3.5 w-3.5" /> {r.warnings.join(" · ")}
          </div>
        )}

        {r.matched_destinations[0] && (
          <Link
            to="/optimize"
            search={{ ids: r.matched_destinations.map((m) => m.destination.id).join(","), days: r.detected_days ?? 5, budget: r.detected_budget_inr ?? 0 }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:opacity-90"
          >
            Optimize this plan <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </aside>
    </div>
  );
}

function SumRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <tr>
      <td className="bg-secondary/20 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-[45%]">{label}</td>
      <td className="px-4 py-2.5 text-sm font-medium text-foreground">{value}</td>
    </tr>
  );
}
