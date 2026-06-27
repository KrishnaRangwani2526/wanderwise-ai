## Goal
Transform WanderCompanion from a chatbot-style UI into a **vibrant, colorful, fully-responsive tourist guide website** with 7 working tools (Dream, Analyze, Plan, Optimize, Sightsee, Book, Travel), backed by **local Python engines** (no Supabase, no cloud DB) with a learning data store on disk.

---

## Phase 1 — UI Overhaul (Travel-Website Look)

Replace the current minimal/editorial layout with a real travel-site aesthetic.

**Landing page (`src/routes/index.tsx`)**
- Full-bleed hero carousel: auto-rotating destination photos (mountains, beaches, cities, trains, flights) with Ken-Burns zoom.
- Bold gradient overlays (sunset orange → teal → indigo) + large search bar ("Where do you dream of going?").
- Sticky top nav with 7 colored pill buttons: Dream · Analyze · Plan · Optimize · Sightsee · Book · Travel — each with its own icon + accent color.
- Feature strips below hero:
  - Live "Flights today" ticker (mock data, animated)
  - "Trending destinations" horizontal scroll cards with images
  - "How it works" 3-step visual
  - "Why WanderCompanion" feature grid (7 tools, each with image + 1-line pitch)
  - Testimonial / footer with newsletter.
- Mobile-first: hamburger nav, swipeable carousels, tap-friendly 44px targets, fluid type with `clamp()`.

**Global**
- New palette: warm sunset gradient + tropical teal accents, white base, soft shadows.
- New font pair: Playfair Display (headings) + Inter (body).
- Shared components: `<DestinationCard>`, `<HeroCarousel>`, `<FeaturePill>`, `<CompareTable>`, `<RankBadge>`.

**Each tool page**
- Hero band with tool's accent color + matching travel imagery.
- Clear input form on the left, results panel on the right (stacked on mobile).
- Where >1 option exists → **Compare & Rank** button → side-by-side table with scores (budget, experience, time, overall) + "Don't miss this" / "Add this place" suggestions.

---

## Phase 2 — Local Python Backend Engines

Everything runs on `localhost:8000` via FastAPI/uvicorn (user runs it manually). **No Supabase, no external DB.** Data persists in local JSON/SQLite files under `backend/data_store/`.

**Engines to build (`backend/engines/`)**
1. `recommendation.py` — match user interests/season/origin → ranked destinations
2. `cost_estimation.py` — flights + trains + hotels + food + activities → total budget bands
3. `experience_score.py` — score a plan on adventure, culture, relaxation, food, cost-efficiency
4. `compare_rank.py` — multi-criteria weighted ranking (user-tunable weights)
5. `smart_suggest.py` — "you might also like", "don't miss", "add this"
6. `itinerary_planner.py` — day-by-day plan generator with 3 variants under given constraints
7. `flight_search.py` — searches hardcoded routes table; deep-link fallback to MakeMyTrip/Skyscanner
8. `train_search.py` — IRCTC-style hardcoded routes; deep-link fallback
9. `best_price.py` — picks cheapest flight+train+hotel combo for given dates
10. `route_optimizer.py` — TSP-style ordering of itinerary stops + map polyline
11. `scraper.py` — URL / blog / PDF → structured itinerary (uses local requests+BS4; Firecrawl optional if key present)

**Learning data store (`backend/data_store/`)**
- `destinations.json` — seeded master dataset (≈100 destinations: name, coords, season, tags, cost-tier, images)
- `routes.json` — flight/train route price table
- `learned_itineraries.json` — every analyzed/planned itinerary saved here for future suggestions
- `user_feedback.json` — thumbs up/down on suggestions → re-weights recommendation engine
- Helper: `store.py` with `load()`, `save()`, `append_learned()`, `record_feedback()`

**API surface (`backend/main.py`)**
- `POST /api/dream` · `/api/analyze` · `/api/plan` · `/api/optimize` · `/api/sightsee` · `/api/book/search` · `/api/travel/route` · `/api/compare-rank` · `/api/feedback`
- All return structured JSON with `options[]`, `comparison_table`, `suggestions[]`, `warnings[]`.

---

## Phase 3 — Wire Frontend to Local Backend

- `src/lib/api.ts` — single fetch wrapper pointing to `http://localhost:8000`, with friendly error if backend down ("Start the Python engine: `uvicorn backend.main:app --reload`").
- TanStack Query hooks per endpoint with loading skeletons + error toasts.
- Results always rendered as **tabular comparison + cards + suggestion chips**.
- "Book on official site" button on every flight/train/hotel option (deep-link to airline / IRCTC / Booking.com with pre-filled query).

---

## Phase 4 — Polish & Verify

- Run `tsgo` typecheck.
- Drive Playwright against `localhost:8080` to screenshot landing + each of the 7 tool pages on mobile (375px) and desktop (1280px) — confirm no broken layouts, images load, buttons reachable.
- Smoke-test each backend endpoint with `curl` and verify response shape.

---

## Technical notes (for the dev)

- **No Supabase, no Lovable Cloud.** All state local: JSON files on disk + browser `localStorage` for "my trips".
- **No `createServerFn` AI calls** for this scope — frontend talks directly to local FastAPI.
- Firecrawl/Gemini calls become optional enrichment behind a flag; default offline.
- Images: use Unsplash source URLs (no API key needed) for destination photography; cache list in `destinations.json`.
- Maps: Leaflet + OpenStreetMap tiles (already installed).

---

## What I'll ship in the next turn
Phase 1 (UI overhaul) end-to-end + Phase 2 backend skeleton with all 11 engines stubbed and 3 fully implemented (recommendation, cost_estimation, compare_rank). Phases 3–4 follow immediately after.
