"""WanderCompanion — offline FastAPI engine.

Run:  uvicorn main:app --reload --port 8000
"""
from typing import List, Optional
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from data import recommend, cost_for, rank
from data.destinations import DESTINATIONS

app = FastAPI(title="WanderCompanion Engine", version="0.1.0")
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"],
)


class DreamReq(BaseModel):
    interests: List[str] = Field(..., min_items=1)
    seasons: Optional[List[str]] = None
    duration_days: Optional[int] = 5
    travelers: Optional[int] = 2
    style: Optional[str] = "mid"
    max_budget_per_day_inr: Optional[int] = None
    avoid_crowds: Optional[bool] = False


class CostReq(BaseModel):
    destination_id: str
    duration_days: int
    travelers: int = 2
    style: str = "mid"
    include_flight: bool = False
    include_train: bool = False


class RankItem(BaseModel):
    id: str
    name: str
    cost_inr: Optional[int] = None
    match_score: Optional[float] = None
    duration_fit: Optional[float] = None
    crowd_factor: Optional[float] = None
    season_match: Optional[bool] = None


class RankReq(BaseModel):
    items: List[RankItem]
    weights: Optional[dict] = None


@app.get("/health")
def health():
    return {"ok": True, "destinations": len(DESTINATIONS)}


@app.get("/destinations")
def list_destinations():
    return DESTINATIONS


@app.post("/dream")
def dream(req: DreamReq):
    matches = recommend(req.dict(), limit=8)
    days = req.duration_days or 5
    travelers = req.travelers or 2
    style = req.style or "mid"

    enriched = []
    rank_input = []
    for m in matches:
        d = m["destination"]
        c = cost_for(d, days, travelers, style, include_flight=True)
        dmin, dmax = d["ideal_duration_days"]
        duration_fit = 1.0 if dmin <= days <= dmax else max(0.0, 1 - abs(days - (dmin + dmax) / 2) / 10)
        rank_input.append({
            "id": d["id"], "name": d["name"], "cost_inr": c["grand_total_inr"],
            "match_score": m["score"], "duration_fit": duration_fit,
            "crowd_factor": d["crowd_factor"],
            "season_match": any(s in (req.seasons or []) for s in d["best_seasons"]) if req.seasons else None,
        })
        enriched.append({"match": m, "cost": c, "duration_fit": duration_fit})

    weights = {
        "cost": 0.35 if req.max_budget_per_day_inr else 0.2,
        "match": 0.35,
        "duration_fit": 0.15,
        "uniqueness": 0.2 if req.avoid_crowds else 0.1,
        "season": 0.1,
    }
    ranked = rank(rank_input, weights)

    by_id = {e["match"]["destination"]["id"]: e for e in enriched}
    results = []
    for r in ranked:
        e = by_id[r["id"]]
        d = e["match"]["destination"]
        results.append({
            "id": d["id"], "name": d["name"], "state": d["state"], "tagline": d["tagline"],
            "highlights": d.get("highlights", []),
            "interests": d["interests"], "best_seasons": d["best_seasons"],
            "score": e["match"]["score"], "reasons": e["match"]["reasons"],
            "estimated_cost_inr": e["cost"]["grand_total_inr"],
            "per_person_per_day_inr": e["cost"]["per_person_per_day"],
            "ranked": r,
        })
    return {"results": results, "query": req.dict()}


@app.post("/cost")
def cost(req: CostReq):
    d = next((x for x in DESTINATIONS if x["id"] == req.destination_id), None)
    if not d:
        return {"error": "unknown destination"}
    return cost_for(d, req.duration_days, req.travelers, req.style, req.include_flight, req.include_train)


@app.post("/rank")
def do_rank(req: RankReq):
    return rank([i.dict() for i in req.items], req.weights)
