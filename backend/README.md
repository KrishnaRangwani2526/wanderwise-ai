# WanderCompanion — Local Engine

Pure-Python, offline backend. No Supabase, no cloud, no accounts.

## Run
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The frontend talks to `http://localhost:8000` (override with
`VITE_API_BASE` in `.env` if needed).

## Endpoints
| Method | Path                | Purpose                                    |
| ------ | ------------------- | ------------------------------------------ |
| GET    | `/health`           | sanity check + learned counters            |
| GET    | `/destinations`     | list of seeded destinations w/ photos      |
| POST   | `/dream`            | recommend ranked destinations by interest  |
| POST   | `/cost`             | itemized cost for a destination/style      |
| POST   | `/rank`             | rank arbitrary options (multi-criteria)    |
| POST   | `/analyze`          | analyze free-form itinerary text/URL       |
| POST   | `/plan`             | 3 day-by-day itinerary variants            |
| POST   | `/optimize`         | plan + budget/must-include filter          |
| GET    | `/sightsee/{id}`    | curated gallery for a destination          |
| POST   | `/book/search`      | flights + trains + hotels + best combo     |
| POST   | `/travel/route`     | TSP-ordered stops + nearby pings           |
| POST   | `/feedback`         | persist 👍 / 👎 for learning               |
| GET    | `/learned`          | dump of learning store                     |

## Learning store
JSON files live in `backend/data_store/`. Every `/analyze`, `/plan`,
`/dream` call appends to `learned_itineraries.json`. `/feedback` writes
to `feedback.json`. Future engine iterations re-weight on these signals.
