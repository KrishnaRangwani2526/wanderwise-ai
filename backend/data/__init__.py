"""Recommendation, cost and rank engines — mirror of the TS implementations."""
from typing import Optional
from .destinations import DESTINATIONS

STYLE_MULT = {"shoestring": 0.55, "budget": 0.75, "mid": 1.0, "comfort": 1.6, "luxury": 2.8}


def recommend(input: dict, limit: int = 6):
    interests = input.get("interests", [])
    seasons = input.get("seasons") or []
    days = input.get("duration_days")
    max_budget = input.get("max_budget_per_day_inr")
    avoid_crowds = input.get("avoid_crowds", False)

    scored = []
    for d in DESTINATIONS:
        reasons, score = [], 0.0
        if interests:
            overlap = [i for i in d["interests"] if i in interests]
            score += (len(overlap) / len(interests)) * 0.45
            if overlap:
                reasons.append("Matches " + ", ".join(overlap))
        else:
            score += 0.2

        if seasons:
            if any(s in seasons for s in d["best_seasons"]):
                score += 0.2
                reasons.append("In peak season")
            else:
                score -= 0.1
                reasons.append("Off-season — expect tradeoffs")
        else:
            score += 0.1

        if days is not None:
            dmin, dmax = d["ideal_duration_days"]
            if dmin <= days <= dmax:
                score += 0.15
                reasons.append(f"Ideal for {days}-day trip")
            elif dmin - 1 <= days <= dmax + 2:
                score += 0.08
        else:
            score += 0.075

        if max_budget is not None:
            if d["cost_per_day_inr"] <= max_budget:
                score += 0.1
                reasons.append(f"Within ₹{max_budget}/day budget")
            elif d["cost_per_day_inr"] <= max_budget * 1.2:
                score += 0.04
        else:
            score += 0.05

        if avoid_crowds:
            score += (1 - d["crowd_factor"]) * 0.1
            if d["crowd_factor"] < 0.5:
                reasons.append("Off the beaten path")
        else:
            score += 0.05

        scored.append({"destination": d, "score": max(0.0, min(1.0, score)), "reasons": reasons})

    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:limit]


def cost_for(dest: dict, days: int, travelers: int, style: str = "mid",
             include_flight: bool = False, include_train: bool = False) -> dict:
    m = STYLE_MULT.get(style, 1.0)
    pppd = round(dest["cost_per_day_inr"] * m)
    accommodation = round(pppd * 0.45)
    food = round(pppd * 0.22)
    activities = round(pppd * 0.18)
    local_transport = round(pppd * 0.10)
    misc = pppd - accommodation - food - activities - local_transport
    onground = (accommodation + food + activities + local_transport + misc) * travelers * days
    flights = round(dest["approx_flight_inr_from_del"] * m * travelers) if include_flight else 0
    trains = round(dest["approx_train_inr_from_del"] * travelers) if include_train else 0
    return {
        "destination": dest["name"], "travelers": travelers, "duration_days": days, "style": style,
        "per_person_per_day": pppd, "accommodation": accommodation, "food": food,
        "activities": activities, "local_transport": local_transport, "misc": misc,
        "flights_total": flights, "trains_total": trains,
        "grand_total_inr": onground + flights + trains,
    }


DEFAULT_W = {"cost": 0.3, "match": 0.3, "duration_fit": 0.15, "uniqueness": 0.15, "season": 0.1}


def rank(items: list, weights: Optional[dict] = None):
    w = {**DEFAULT_W, **(weights or {})}
    costs = [i.get("cost_inr", 0) for i in items]
    max_c, min_c = max(costs + [1]), min(costs) if costs else 0

    out = []
    for it in items:
        cost_norm = 1 - (it["cost_inr"] - min_c) / (max_c - min_c) if it.get("cost_inr") is not None and max_c != min_c else 0.5
        match_norm = it.get("match_score", 0.5)
        dur_norm = it.get("duration_fit", 0.5)
        uniq_norm = 1 - it["crowd_factor"] if it.get("crowd_factor") is not None else 0.5
        season_norm = 0.5 if it.get("season_match") is None else (1 if it["season_match"] else 0)
        contrib = {
            "cost": cost_norm * w["cost"], "match": match_norm * w["match"],
            "duration_fit": dur_norm * w["duration_fit"],
            "uniqueness": uniq_norm * w["uniqueness"], "season": season_norm * w["season"],
        }
        total = sum(contrib.values())
        verdict = "Solid pick"
        if total > 0.75: verdict = "Top recommendation — don't miss"
        elif total > 0.6: verdict = "Strong fit"
        elif total < 0.35: verdict = "Consider only if other constraints win"
        out.append({**it, "total_score": round(total, 3), "contributions": contrib, "verdict": verdict})

    out.sort(key=lambda x: x["total_score"], reverse=True)
    for i, o in enumerate(out, 1):
        o["rank"] = i
    return out
