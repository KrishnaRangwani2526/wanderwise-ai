"""Day-by-day itinerary planner. Generates 3 variants under given constraints."""
from typing import List, Dict
from data import cost_for
from data.destinations import DESTINATIONS

ACTIVITY_BANK = {
    "mountains":   ["Sunrise viewpoint hike", "Local cafe + bookshop", "Cable-car ride", "Village walk", "Snow / glacier excursion"],
    "beach":       ["Sunrise on the sand", "Watersports session", "Shack lunch + swim", "Sunset cruise", "Beach hop on scooter"],
    "heritage":    ["Old city walking tour", "Royal palace + museum", "Evening light show", "Stepwell / fort visit", "Artisan bazaar crawl"],
    "spiritual":   ["Pre-dawn aarti", "Temple circuit", "Riverside ghat walk", "Meditation session", "Sacred old town stroll"],
    "adventure":   ["Rafting / kayaking", "Trek to viewpoint", "Paragliding / zipline", "Mountain biking", "Camping under stars"],
    "food":        ["Street food crawl", "Cooking class", "Heritage thali lunch", "Coffee + dessert hop", "Night market dinner"],
    "desert":      ["Camel safari", "Dune sunset", "Folk music night", "Salt-flat photography", "Fort sundown drinks"],
    "nightlife":   ["Beach bar hop", "Live music venue", "Sunset rooftop", "Casino / club", "Late-night supper"],
}

VARIANTS = [
    {"key": "relaxed",   "label": "Relaxed",   "per_day": 3, "tilt": ["food", "heritage"]},
    {"key": "balanced",  "label": "Balanced",  "per_day": 4, "tilt": []},
    {"key": "intense",   "label": "Intense",   "per_day": 5, "tilt": ["adventure"]},
]


def _activities_for(dest: Dict, slots: int, tilt: List[str]):
    pool = []
    tags = list(dest["interests"]) + tilt
    seen = set()
    for t in tags:
        for a in ACTIVITY_BANK.get(t, []):
            if a not in seen:
                pool.append((t, a))
                seen.add(a)
    if not pool:
        pool = [("food", "Free explore: walk + local food")]
    out, i = [], 0
    while len(out) < slots:
        out.append(pool[i % len(pool)])
        i += 1
    return out


def plan_itinerary(destination_id: str, days: int, travelers: int = 2, style: str = "mid",
                   likes: List[str] = None, dislikes: List[str] = None):
    dest = next((d for d in DESTINATIONS if d["id"] == destination_id), None)
    if not dest:
        return {"error": "unknown destination"}
    likes = [l.lower() for l in (likes or [])]
    dislikes = [l.lower() for l in (dislikes or [])]

    options = []
    for v in VARIANTS:
        days_plan = []
        acts = _activities_for(dest, v["per_day"] * days, v["tilt"] + likes)
        acts = [a for a in acts if not any(dl in a[1].lower() for dl in dislikes)] or acts
        idx = 0
        for d in range(1, days + 1):
            slot = []
            for s in range(v["per_day"]):
                if idx < len(acts):
                    slot.append({"slot": ["morning", "midday", "afternoon", "evening", "night"][s % 5], "activity": acts[idx][1], "tag": acts[idx][0]})
                    idx += 1
            days_plan.append({"day": d, "activities": slot})
        cost = cost_for(dest, days, travelers, style, include_flight=False)
        options.append({
            "variant": v["key"], "label": v["label"],
            "destination": {"id": dest["id"], "name": dest["name"], "state": dest["state"]},
            "days": days_plan,
            "estimated_cost_inr": cost["grand_total_inr"],
            "per_person_per_day": cost["per_person_per_day"],
            "pace": v["per_day"],
        })
    return {"options": options, "destination": dest}
