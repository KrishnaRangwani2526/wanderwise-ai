# Itinerary Planner ML Model — Complete Build Guide (v2)

A from-scratch guide to building the **PLAN (Itinerary Maker)** engine: the tech stack, the exact working steps, the data tables, how it connects to the other two models (Destination Finder before it, Budget Optimizer after it), and how to keep improving its accuracy.

---

## 1. The Big Picture — How the 3 Models Connect

Think of the three models as an assembly line. Each one's output is the next one's input:

```text
USER INPUT (vibes, budget, dates, group)
        │
        ▼
┌─────────────────────────┐
│ 1. DESTINATION FINDER   │  "Where should I go?"
│  (ranking ML model)     │  Output: ranked list of destinations
└───────────┬─────────────┘
            │ chosen destination + traveller profile
            ▼
┌─────────────────────────┐
│ 2. ITINERARY PLANNER    │  ← THIS GUIDE
│  (ranking + scheduling) │  Output: day-by-day plan of places
└───────────┬─────────────┘
            │ draft itinerary (places, tickets, travel legs)
            ▼
┌─────────────────────────┐
│ 3. BUDGET OPTIMIZER     │  "Make it fit my budget"
│  (cost model + swapper) │  Output: same trip, cheaper/smarter
└─────────────────────────┘
```

**The shared backbone is one database.** All three models read and write the same tables. The Itinerary Planner never calls the Destination Finder's code directly — it just reads the `destinations` and `traveller_profile` data the Finder produced. This keeps each model independent and replaceable.

**The feedback loop flows backwards too:** when users keep/remove places from an itinerary, that feedback improves the Planner's ranking — and the same feedback table later helps the Destination Finder learn which destinations actually convert into good trips.

---

## 2. Tech Stack (and Why)

| Layer | Tool | Why this one |
|---|---|---|
| Language | **Python 3.11+** | Every ML/data library lives here |
| API | **FastAPI + Uvicorn** | Fast, auto-docs at `/docs`, easy JSON in/out |
| Database | **PostgreSQL** | One home for places, users, feedback |
| Data processing | **pandas** | Cleaning and shaping raw datasets |
| Ranking model | **LightGBM** (learning-to-rank) | Fast, handles tabular data, industry standard for ranking |
| Route scheduling | **OR-Tools** (Google) | Solves "fit N places into M days with opening hours" — a constraint problem, not ML |
| Geo math | **scipy / haversine** | Distances between places |
| Embeddings (optional v2) | **sentence-transformers** | Turn "romantic, foodie, slow travel" into a vector for similarity matching |
| Experiment tracking | **MLflow** (optional) | Record every model version and its score |
| Frontend | React + TanStack (already have) | Calls the FastAPI endpoints |

Rule of thumb: **ML ranks, OR-Tools schedules.** Don't use ML to decide what fits in a day — that's a math puzzle with hard rules (opening hours, travel time). Don't use rules to decide what a user will *like* — that's what ML learns from feedback.

---

## 3. The Dataset — Tables and Columns

### 3.1 `places` — the core table (one row per visitable place)

| Column | Type | Example | Source |
|---|---|---|---|
| `place_id` | uuid | `a1b2…` | generated |
| `destination_id` | uuid → destinations | Goa | links to Finder's table |
| `name` | text | "Basilica of Bom Jesus" | OpenTripMap / Wikidata |
| `category` | text | `temple / museum / beach / food / trek / nightlife` | tags from source |
| `lat`, `lon` | float | 15.50, 73.91 | source |
| `avg_visit_mins` | int | 90 | heuristics + Google Popular Times |
| `entry_fee_inr` | int | 0 | official sites / scraping |
| `open_time`, `close_time` | time | 09:00, 17:30 | Google Places API |
| `closed_days` | text[] | `{monday}` | Google Places API |
| `popularity_score` | float 0–1 | 0.87 | review counts, normalized |
| `crowd_by_month` | jsonb | `{"jan":0.9, "feb":0.8…}` | Google Popular Times / seasonality |
| `best_time_of_day` | text | `morning` | rules (beach=evening, trek=morning) |
| `indoor` | bool | false | category mapping |
| `tags` | text[] | `{history, unesco, photography}` | Wikidata + LLM tagging |

### 3.2 `traveller_profile` — one row per trip request (input contract)

| Column | Type | Example |
|---|---|---|
| `trip_id` | uuid | |
| `destination_id` | uuid | ← **from Destination Finder** |
| `days` | int | 4 |
| `party_size` | int | 2 |
| `budget_inr` | int | 40000 |
| `interests` | text[] | `{food, history, beach}` |
| `pace` | text | `relaxed / balanced / packed` |
| `travel_month` | int | 12 |
| `with_kids` | bool | false |

### 3.3 `itinerary_feedback` — the learning fuel (most important table)

| Column | Type | Meaning |
|---|---|---|
| `id` | uuid | |
| `trip_id` | uuid | which trip |
| `place_id` | uuid | which place |
| `action` | text | `kept / removed / reordered / visited / rated` |
| `rating` | int 1–5 | post-trip rating (optional) |
| `position_in_plan` | int | where it appeared |
| `created_at` | timestamp | |

Every keep/remove/rate is a **label**. `kept/visited/rated≥4` = positive, `removed` = negative. This is what the model trains on.

### 3.4 Where the raw data comes from (curation pipeline)

1. **Seed:** OpenTripMap API + Wikidata SPARQL → name, category, coordinates (free, bulk).
2. **Enrich:** Google Places API → opening hours, ratings, review counts.
3. **Derive:** `popularity_score = log(1+review_count) / max`, `best_time_of_day` from category rules.
4. **Clean (pandas):** drop places with no coordinates, dedupe by name+distance (<50m), clip fees to sane ranges.
5. **Tag:** run each place description through an LLM once to fill `tags` (cheap, one-time).

Target: **300–800 quality places per destination** beats 5,000 noisy ones.

---

## 4. How the Model Works — 3 Stages

```text
traveller_profile + places table
        │
  STAGE A: CANDIDATE FILTER (rules)
        │  right destination, open that month, within budget ceiling
        │  → ~200 candidates from ~600
        ▼
  STAGE B: ML RANKING (LightGBM)
        │  scores each candidate 0–1 for THIS traveller
        │  → top ~40 places, sorted
        ▼
  STAGE C: SCHEDULER (OR-Tools)
        │  packs top places into days respecting:
        │  opening hours, travel time, pace, meals
        ▼
  3 plan variants: Highlights / Balanced / Offbeat
```

### Stage B features (what the model looks at per place)

- Match between `interests` and place `category`/`tags` (overlap count, embedding similarity)
- `popularity_score`, `crowd_by_month[travel_month]` (penalize peak crowd for relaxed pace)
- `entry_fee_inr` vs `budget_inr / days` (affordability ratio)
- Distance from trip centroid (cluster bonus — places near each other rank higher together)
- `avg_visit_mins` vs pace (packed pace favors shorter visits)

### The 3 variants come from one model, different knobs

| Variant | Knob |
|---|---|
| Highlights | weight `popularity_score` × 2 |
| Balanced | default weights |
| Offbeat | invert popularity weight, boost rare tags |

---

## 5. Working Steps — Build Order (2–3 weeks solo)

**Week 1 — Data & skeleton**
1. `pip install fastapi uvicorn pandas lightgbm ortools psycopg2` (+ `sentence-transformers` later).
2. Create the 3 tables in PostgreSQL (SQL above).
3. Write `ingest.py`: pull OpenTripMap for one destination (e.g. Goa) → clean with pandas → insert ~400 places.
4. Write `POST /plan` endpoint that returns a **rule-based** plan first (no ML yet): filter by category match, sort by popularity, schedule with OR-Tools. **Get this end-to-end working before any ML.**

**Week 2 — ML ranking**
5. Generate training data: since you have no users yet, create **synthetic labels** — score places with your rule-based formula, add noise, treat top-scored as positives. (Bootstrap trick; replace with real feedback later.)
6. Train LightGBM ranker on the Stage B features. Save with `joblib`.
7. Swap Stage B from rules to the model. Compare outputs side by side.
8. Add the feedback endpoint `POST /feedback` and wire the frontend's keep/remove buttons to it.

**Week 3 — Variants & polish**
9. Add the 3 variant knobs.
10. Add crowd/season adjustment and rain fallback (swap outdoor→indoor if `closed`/monsoon).
11. Write 10 test trips (different paces, budgets, interests) and eyeball every plan.
12. Deploy: uvicorn behind your frontend, same as the current backend setup.

---

## 6. Improving Accuracy Over Time

In priority order:

1. **Real feedback > everything.** Synthetic labels get you to ~70% quality; real keep/remove data gets the rest. Retrain weekly once you have ~500 feedback rows.
2. **Track the right metric:** *keep-rate* = kept places ÷ suggested places. A good planner hits 80%+. Also NDCG (ranking quality) on held-out feedback.
3. **Fix data before tuning the model.** Wrong opening hours or a miscategorized place causes more bad plans than any model parameter. Add an admin script to spot-check 20 places per destination.
4. **Add embeddings (v2):** encode `interests` text and place descriptions with sentence-transformers; cosine similarity becomes a feature. Handles "I love quiet sunrise spots" better than tag matching.
5. **Cold-start handling:** new destination with no feedback → fall back to popularity-weighted rules, then blend in ML as feedback arrives (start 100% rules, shift 10%→ML per 50 feedback rows).
6. **A/B the variants:** log which variant (Highlights/Balanced/Offbeat) users pick most per profile type — that itself becomes a training signal.
7. **Version everything:** keep each trained model file + its keep-rate in MLflow; only promote a new model if it beats the current one on held-out data.

---

## 7. Handoff to the Next Model (Budget Optimizer)

The Planner's output JSON is the Optimizer's input:

```json
{
  "trip_id": "…",
  "days": [
    {"day": 1, "places": [{"place_id": "…", "entry_fee_inr": 0, "est_travel_cost": 150}]}
  ],
  "total_est_cost": 12400
}
```

The Optimizer reads this, estimates full cost (tickets + local transport + food tiers), and if over budget, swaps expensive places for cheaper high-ranked alternatives **from the same Stage B ranking** — so the two models always agree on what "good" means. That's the payoff of sharing one ranking model and one database.

---

**Next guides:** Destination Finder (the model before this one) and Budget Optimizer (the one after). Ask for either when ready.
