import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plane, Train, Hotel, ExternalLink, Save, User, Check, Star } from "lucide-react";
import { DESTINATIONS } from "@/data/destinations";
import {
  searchFlights, searchTrains, searchHotels,
  DEFAULT_PROFILE, type TravelerProfile, type FlightOption, type TrainOption, type HotelOption,
} from "@/lib/engines/booking";
import { PageHero } from "@/components/PageHero";

const PROFILE_KEY = "wc.travelerProfile";
type Tab = "flights" | "trains" | "hotels";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book — One-click flights, trains, hotels | WanderCompanion" },
      { name: "description", content: "Save your profile once, compare flights, trains and hotels, then book on the official site in one tap." },
    ],
  }),
  component: BookPage,
});

const inp = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

function BookPage() {
  const [destId, setDestId] = useState(DESTINATIONS[0].id);
  const [travelers, setTravelers] = useState(2);
  const [nights, setNights] = useState(4);
  const [tab, setTab] = useState<Tab>("flights");
  const [profile, setProfile] = useState<TravelerProfile>(DEFAULT_PROFILE);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(PROFILE_KEY) : null;
      if (raw) setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(raw) });
    } catch { /* ignore */ }
  }, []);

  const flights = useMemo(() => searchFlights(destId, travelers), [destId, travelers]);
  const trains = useMemo(() => searchTrains(destId, travelers), [destId, travelers]);
  const hotels = useMemo(() => searchHotels(destId, nights), [destId, nights]);

  function saveProfile() {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  const dest = DESTINATIONS.find((d) => d.id === destId)!;

  return (
    <div>
      <PageHero
        eyebrow="Step 06 · Book"
        icon={<Plane className="h-3.5 w-3.5" />}
        title={<>Save once. <span className="text-brand-gradient">Book in one tap.</span></>}
        description="One profile drives flight, train and hotel checkouts. Compare side-by-side, then jump to the official site."
      />

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-7">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Destination">
                <select value={destId} onChange={(e) => setDestId(e.target.value)} className={inp}>
                  {DESTINATIONS.map((d) => <option key={d.id} value={d.id}>{d.name}, {d.state}</option>)}
                </select>
              </Field>
              <Field label={`Travelers: ${travelers}`}>
                <input type="range" min={1} max={8} value={travelers} onChange={(e) => setTravelers(+e.target.value)} className="w-full accent-[var(--brand)]" />
              </Field>
              <Field label={`Nights: ${nights}`}>
                <input type="range" min={1} max={20} value={nights} onChange={(e) => setNights(+e.target.value)} className="w-full accent-[var(--brand)]" />
              </Field>
            </div>
            <div className="mt-5 flex gap-2 border-b border-border">
              {([
                { k: "flights", l: "Flights", I: Plane, n: flights.length },
                { k: "trains", l: "Trains", I: Train, n: trains.length },
                { k: "hotels", l: "Hotels", I: Hotel, n: hotels.length },
              ] as const).map((t) => (
                <button
                  key={t.k}
                  onClick={() => setTab(t.k)}
                  className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-semibold transition ${
                    tab === t.k ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <t.I className="h-4 w-4" /> {t.l} <span className="text-xs opacity-60">({t.n})</span>
                </button>
              ))}
            </div>
            <div className="mt-4 space-y-3">
              {tab === "flights" && flights.map((f, i) => <FlightRow key={f.id} f={f} best={i === 0} />)}
              {tab === "trains" && (trains.length ? trains.map((t, i) => <TrainRow key={t.id} t={t} best={i === 0} />) : <Empty msg="No rail link from Delhi for this destination." />)}
              {tab === "hotels" && hotels.map((h, i) => <HotelRow key={h.id} h={h} nights={nights} best={i === 0} />)}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h3 className="flex items-center gap-2 font-display font-bold text-foreground"><User className="h-4 w-4" /> Your profile</h3>
              <p className="text-xs text-muted-foreground">Stored locally in your browser. Never sent anywhere.</p>
              <div className="mt-3 grid gap-3">
                <input className={inp} placeholder="Full name" value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
                <input className={inp} placeholder="Email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                <input className={inp} placeholder="Phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                <input className={inp} placeholder="Aadhaar / Passport last 4" value={profile.gov_id} onChange={(e) => setProfile({ ...profile, gov_id: e.target.value })} />
                <input className={inp} placeholder="Origin city" value={profile.origin_city} onChange={(e) => setProfile({ ...profile, origin_city: e.target.value })} />
                <div className="grid grid-cols-2 gap-2">
                  <select className={inp} value={profile.meal_pref} onChange={(e) => setProfile({ ...profile, meal_pref: e.target.value as TravelerProfile["meal_pref"] })}>
                    <option value="veg">Veg</option><option value="non-veg">Non-veg</option><option value="vegan">Vegan</option>
                  </select>
                  <select className={inp} value={profile.seat_pref} onChange={(e) => setProfile({ ...profile, seat_pref: e.target.value as TravelerProfile["seat_pref"] })}>
                    <option value="window">Window</option><option value="aisle">Aisle</option><option value="no-pref">No pref</option>
                  </select>
                </div>
                <button onClick={saveProfile} className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90">
                  {saved ? <><Check className="h-4 w-4" /> Saved</> : <><Save className="h-4 w-4" /> Save profile</>}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Best combo for {dest.name}</div>
              <div className="mt-2 text-sm text-foreground/80">
                ✈ {flights[0]?.airline} from ₹{flights[0]?.price_inr.toLocaleString("en-IN")}<br/>
                🏨 {hotels[0]?.name} · ₹{(hotels[0]?.price_per_night_inr * nights).toLocaleString("en-IN")} ({nights} nts)
              </div>
              <div className="mt-2 font-display text-2xl font-bold text-brand-gradient">
                ₹{((flights[0]?.price_inr ?? 0) + (hotels[0]?.price_per_night_inr ?? 0) * nights).toLocaleString("en-IN")}
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">Estimated total · flight + {nights}-night stay</div>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-5 text-sm text-muted-foreground">
          <b className="text-foreground">How ranking works:</b> options are sorted by total price for your travelers/nights.
          "One-tap book" pre-fills the official site URL — you finish payment there. We never store payment info.
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>{children}</div>;
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-foreground px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-background">{children}</span>;
}

function FlightRow({ f, best }: { f: FlightOption; best: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 transition ${best ? "border-foreground/30 bg-brand-soft" : "border-border bg-background hover:border-foreground/20"}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground">{f.airline}</span>
          <span className="text-xs text-muted-foreground">· {f.class}</span>
          {best && <Badge>Best price</Badge>}
        </div>
        <div className="text-right">
          <div className="font-display text-lg font-bold text-foreground">₹{f.price_inr.toLocaleString("en-IN")}</div>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-3 items-center gap-2 text-sm">
        <div><div className="font-bold text-foreground">{f.depart}</div><div className="text-xs text-muted-foreground">{f.from}</div></div>
        <div className="text-center text-xs text-muted-foreground">{Math.floor(f.duration_min / 60)}h {f.duration_min % 60}m · {f.stops === 0 ? "Non-stop" : `${f.stops} stop`}</div>
        <div className="text-right"><div className="font-bold text-foreground">{f.arrive}</div><div className="text-xs text-muted-foreground">{f.to}</div></div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <div>Baggage {f.baggage} · {f.refundable ? "Refundable" : "Non-refundable"}</div>
        <div className="flex gap-2">
          <a href={f.external_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1.5 text-xs font-bold text-background hover:opacity-90">
            One-tap book <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

function TrainRow({ t, best }: { t: TrainOption; best: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 transition ${best ? "border-foreground/30 bg-brand-soft" : "border-border bg-background hover:border-foreground/20"}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground">{t.train_no} · {t.name}</span>
          <span className="text-xs text-muted-foreground">{t.class}</span>
          {best && <Badge>Best price</Badge>}
        </div>
        <div className="font-display text-lg font-bold text-foreground">₹{t.price_inr.toLocaleString("en-IN")}</div>
      </div>
      <div className="mt-2 grid grid-cols-3 text-sm">
        <div><div className="font-bold text-foreground">{t.depart}</div><div className="text-xs text-muted-foreground">{t.from}</div></div>
        <div className="text-center text-xs text-muted-foreground">{Math.floor(t.duration_min / 60)}h {t.duration_min % 60}m · {t.availability}</div>
        <div className="text-right"><div className="font-bold text-foreground">{t.arrive}</div><div className="text-xs text-muted-foreground">{t.to}</div></div>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <a href={t.external_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1.5 text-xs font-bold text-background hover:opacity-90">
          Book on IRCTC <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

function HotelRow({ h, nights, best }: { h: HotelOption; nights: number; best: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 transition ${best ? "border-foreground/30 bg-brand-soft" : "border-border bg-background hover:border-foreground/20"}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="font-bold text-foreground">{h.name} <span className="text-xs text-muted-foreground">· {h.area}</span></div>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <span>{"★".repeat(h.stars)}</span>
            <Star className="h-3 w-3 fill-foreground text-foreground" />
            <span>{h.rating}</span>
            <span>· {h.amenities.join(" · ")}</span>
          </div>
          {best && <div className="mt-1"><Badge>Best price</Badge></div>}
        </div>
        <div className="text-right">
          <div className="font-display text-lg font-bold text-foreground">₹{h.price_per_night_inr.toLocaleString("en-IN")}<span className="text-xs font-normal text-muted-foreground">/night</span></div>
          <div className="text-xs text-muted-foreground">₹{(h.price_per_night_inr * nights).toLocaleString("en-IN")} total</div>
        </div>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <a href={h.external_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1.5 text-xs font-bold text-background hover:opacity-90">
          Book on Booking.com <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">{msg}</div>;
}
