"""WanderCompanion — offline FastAPI engine.

Run:  uvicorn main:app --reload --port 8000
All data is local; nothing leaves your machine.
"""
from typing import List, Optional, Dict, Any
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from data import recommend, cost_for, rank
from data.destinations import DESTINATIONS
from data_store import append, load, record_feedback
from engines.itinerary import plan_itinerary
from engines.booking import search_flights, search_trains, search_hotels, best_combo
from engines.route import optimize_route, nearby_pings
from engines.analyze import analyze_text
from engines.sightsee import gallery_for, all_destination_cards

app = FastAPI(title="WanderCompanion Engine", version="0.2.0")
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"],
)


# -------- models ---------------------------------------------------------
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


class AnalyzeReq(BaseModel):
    text: str = ""
    url: Optional[str] = None


class PlanReq(BaseModel):
    destination_id: str
    duration_days: int = 5
    travelers: int = 2
    style: str = "mid"
    likes: Optional[List[str]] = None
    dislikes: Optional[List[str]] = None


class OptimizeReq(BaseModel):
    destination_id: str
    duration_days: int = 5
    travelers: int = 2
    style: str = "mid"
    must_include: Optional[List[str]] = None       # extra activity tags
    max_budget_inr: Optional[int] = None


class BookReq(BaseModel):
    destination_id: str
    travelers: int = 2
    nights: int = 3


class RouteReq(BaseModel):
    stops: List[Dict[str, Any]]                    # [{name, lat, lng}]
    start_idx: int = 0


class FeedbackReq(BaseModel):
    target_id: str
    score: int                                     # +1 or -1
    note: Optional[str] = ""


# -------- routes ---------------------------------------------------------
@app.get("/health")
def health():
    return {
        "ok": True,
        "destinations": len(DESTINATIONS),
        "learned_itineraries": len(load("learned_itineraries", [])),
        "feedback_events": len(load("feedback", [])),
    }


@app.get("/destinations")
def list_destinations():
    return all_destination_cards()


@app.post("/dream")
def dream(req: DreamReq):
    matches = recommend(req.dict(), limit=8)
    days = req.duration_days or 5
    travelers = req.travelers or 2
    style = req.style or "mid"

    enriched, rank_input = [], []
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
        "match": 0.35, "duration_fit": 0.15,
        "uniqueness": 0.2 if req.avoid_crowds else 0.1, "season": 0.1,
    }
    ranked = rank(rank_input, weights)
    by_id = {e["match"]["destination"]["id"]: e for e in enriched}
    results = []
    for r in ranked:
        e = by_id[r["id"]]; d = e["match"]["destination"]
        results.append({
            "id": d["id"], "name": d["name"], "state": d["state"], "tagline": d["tagline"],
            "interests": d["interests"], "best_seasons": d["best_seasons"],
            "score": e["match"]["score"], "reasons": e["match"]["reasons"],
            "estimated_cost_inr": e["cost"]["grand_total_inr"],
            "per_person_per_day_inr": e["cost"]["per_person_per_day"],
            "ranked": r,
        })
    append("learned_itineraries", {"source": "dream", "query": req.dict(), "top_picks": [r["id"] for r in results[:3]]})
    return {"results": results, "query": req.dict()}


@app.post("/cost")
def cost(req: CostReq):
    d = next((x for x in DESTINATIONS if x["id"] == req.destination_id), None)
    if not d: return {"error": "unknown destination"}
    return cost_for(d, req.duration_days, req.travelers, req.style, req.include_flight, req.include_train)


@app.post("/rank")
def do_rank(req: RankReq):
    return rank([i.dict() for i in req.items], req.weights)


@app.post("/analyze")
def analyze(req: AnalyzeReq):
    return analyze_text(req.text or req.url or "")


@app.post("/plan")
def plan(req: PlanReq):
    res = plan_itinerary(req.destination_id, req.duration_days, req.travelers, req.style, req.likes, req.dislikes)
    if "error" not in res:
        append("learned_itineraries", {"source": "plan", "destination_id": req.destination_id, "days": req.duration_days})
    return res


@app.post("/optimize")
def optimize(req: OptimizeReq):
    res = plan_itinerary(req.destination_id, req.duration_days, req.travelers, req.style,
                         likes=req.must_include, dislikes=None)
    if "options" in res:
        # tag each option as fits-budget or not
        for opt in res["options"]:
            opt["within_budget"] = (req.max_budget_inr is None) or (opt["estimated_cost_inr"] <= req.max_budget_inr)
        # pick a recommended one
        candidates = [o for o in res["options"] if o["within_budget"]] or res["options"]
        res["recommended"] = sorted(candidates, key=lambda o: o["estimated_cost_inr"])[0]["variant"]
    return res


@app.get("/sightsee/{dest_id}")
def sightsee(dest_id: str):
    return gallery_for(dest_id)


@app.post("/book/search")
def book_search(req: BookReq):
    return {
        "flights": search_flights(req.destination_id, req.travelers),
        "trains": search_trains(req.destination_id, req.travelers),
        "hotels": search_hotels(req.destination_id, req.nights, req.travelers),
        "best_combo": best_combo(req.destination_id, req.nights, req.travelers),
    }


@app.post("/travel/route")
def travel_route(req: RouteReq):
    opt = optimize_route(req.stops, req.start_idx)
    opt["nearby_pings"] = nearby_pings(opt["ordered"])
    return opt


@app.post("/feedback")
def feedback(req: FeedbackReq):
    return record_feedback(req.target_id, req.score, req.note or "")


@app.get("/learned")
def learned():
    return {"itineraries": load("learned_itineraries", []), "feedback": load("feedback", [])}
