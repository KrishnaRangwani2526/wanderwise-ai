# WanderCompanion — Python Reference Backend

A parallel, fully-offline FastAPI implementation of the same engines that power
the TypeScript app. Useful for running engines locally outside the browser,
batch jobs, or experimentation.

## Run

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API will be on http://localhost:8000 — try `GET /destinations` or
`POST /dream` with a JSON body.

## Endpoints

| Method | Path             | Engine                  |
| ------ | ---------------- | ----------------------- |
| GET    | `/destinations`  | dataset                 |
| POST   | `/dream`         | recommendation + cost + rank |
| POST   | `/cost`          | cost estimation         |
| POST   | `/rank`          | compare & rank          |
| GET    | `/health`        | sanity                  |

All data is hardcoded in `data/destinations.json`. No internet, no scraping,
no Supabase.
