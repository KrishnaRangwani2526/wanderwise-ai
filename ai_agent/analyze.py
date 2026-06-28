"""Analyze a free-form itinerary / URL / PDF text and return structured insights.
Offline keyword/regex based — no LLM required. Saves every analysis to learning store.
"""
import re
from typing import Dict
from data.destinations import DESTINATIONS
from data_store import append

INTEREST_KEYWORDS = {
    "mountains": ["mountain", "trek", "snow", "hill", "himalay", "peak"],
    "beach": ["beach", "sand", "shack", "surf", "ocean", "shore"],
    "heritage": ["fort", "palace", "heritage", "museum", "monument", "old city"],
    "spiritual": ["temple", "ghat", "ashram", "yoga", "monastery", "aarti"],
    "adventure": ["raft", "paraglid", "zipline", "kayak", "scuba", "bungee", "trek"],
    "food": ["food", "thali", "street food", "cuisine", "restaurant", "cooking"],
    "desert": ["desert", "dune", "camel"],
    "nightlife": ["club", "bar", "nightlife", "rooftop", "party"],
}

SEASON_KEYWORDS = {
    "winter": ["winter", "december", "january", "february", "snow"],
    "summer": ["summer", "may", "june", "april"],
    "monsoon": ["monsoon", "july", "august", "september", "rain"],
    "spring": ["spring", "march"],
    "autumn": ["autumn", "october", "november", "fall"],
}


def analyze_text(text: str) -> Dict:
    t = text.lower()

    # destinations mentioned
    mentioned = []
    for d in DESTINATIONS:
        if d["name"].lower() in t or d["id"] in t or d["state"].lower() in t:
            mentioned.append({"id": d["id"], "name": d["name"], "state": d["state"]})

    # interests
    interests = []
    for k, kws in INTEREST_KEYWORDS.items():
        if any(kw in t for kw in kws):
            interests.append(k)

    # seasons
    seasons = []
    for k, kws in SEASON_KEYWORDS.items():
        if any(kw in t for kw in kws):
            seasons.append(k)

    # duration: "5 days", "1 week", "10-day"
    days = None
    m = re.search(r"(\d+)\s*[- ]?\s*(day|days|night|nights)", t)
    if m: days = int(m.group(1))
    if not days:
        m = re.search(r"(\d+)\s*week", t)
        if m: days = int(m.group(1)) * 7

    # budget
    budget = None
    m = re.search(r"(?:₹|inr|rs\.?)\s*([\d,]{3,})", t)
    if m: budget = int(m.group(1).replace(",", ""))

    travelers = None
    m = re.search(r"(\d+)\s*(person|persons|people|traveler|travellers|adult|adults|pax)", t)
    if m: travelers = int(m.group(1))

    # suggestions
    suggestions = []
    warnings = []

    if mentioned and not seasons:
        suggestions.append("Add a target month/season — peak vs off-season changes cost and crowds materially.")
    if days and days > 0:
        for d in mentioned:
            dest = next((x for x in DESTINATIONS if x["id"] == d["id"]), None)
            if dest:
                dmin, dmax = dest["ideal_duration_days"]
                if days < dmin:
                    warnings.append(f"{d['name']} typically needs {dmin}-{dmax} days — your {days}-day plan feels rushed.")
                elif days > dmax + 2:
                    suggestions.append(f"You have buffer time at {d['name']} — pair it with a nearby spot.")
    if not budget:
        suggestions.append("Set a budget ceiling so we can rank flight, train and hotel combos for you.")
    if "instagram" in t or "reel" in t:
        suggestions.append("Reels often skip transit time — add 4-6 hr buffer between hero photos.")
    if not mentioned:
        suggestions.append("Tell us at least one destination so we can plan and price your trip.")

    if interests and mentioned:
        # cross-check interest fit
        for d in mentioned:
            dest = next((x for x in DESTINATIONS if x["id"] == d["id"]), None)
            if dest:
                miss = [i for i in interests if i not in dest["interests"]]
                if miss:
                    suggestions.append(f"For {dest['name']}, your interest in {', '.join(miss)} is weak — consider a side trip.")

    summary = {
        "destinations": mentioned,
        "interests": interests,
        "seasons": seasons,
        "duration_days": days,
        "travelers": travelers,
        "budget_inr": budget,
        "suggestions": suggestions,
        "warnings": warnings,
        "char_count": len(text),
    }

    # learn
    append("learned_itineraries", {"source": "analyze", "summary": summary, "raw_excerpt": text[:500]})
    return summary
