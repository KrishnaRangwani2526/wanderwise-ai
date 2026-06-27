"""Flight / train / hotel search with deep-link fallbacks."""
from typing import List
from data.destinations import DESTINATIONS

CARRIERS = [
    {"code": "AI", "name": "Air India", "mult": 1.10},
    {"code": "6E", "name": "IndiGo",    "mult": 1.00},
    {"code": "UK", "name": "Vistara",   "mult": 1.15},
    {"code": "SG", "name": "SpiceJet",  "mult": 0.92},
    {"code": "QP", "name": "Akasa Air", "mult": 0.95},
]

TRAINS = [
    {"no": "12951", "name": "Mumbai Rajdhani", "class": "3A", "mult": 1.0},
    {"no": "12009", "name": "Shatabdi Exp",    "class": "CC", "mult": 0.9},
    {"no": "22691", "name": "Rajdhani Exp",    "class": "2A", "mult": 1.4},
    {"no": "12259", "name": "Duronto Exp",     "class": "SL", "mult": 0.55},
]

HOTELS_TEMPLATE = [
    {"tier": "Hostel",    "mult": 0.35, "rating": 3.8},
    {"tier": "Budget",    "mult": 0.65, "rating": 4.0},
    {"tier": "Mid-range", "mult": 1.0,  "rating": 4.3},
    {"tier": "Boutique",  "mult": 1.6,  "rating": 4.5},
    {"tier": "Luxury",    "mult": 2.8,  "rating": 4.7},
]


def _dest(dest_id: str):
    return next((d for d in DESTINATIONS if d["id"] == dest_id), None)


def search_flights(dest_id: str, travelers: int = 1):
    d = _dest(dest_id)
    if not d: return []
    base = d["approx_flight_inr_from_del"]
    out = []
    for c in CARRIERS:
        price = round(base * c["mult"])
        out.append({
            "type": "flight",
            "carrier": c["name"], "code": c["code"],
            "from": "DEL", "to": d.get("nearest_airport_iata") or "—",
            "price_inr": price * travelers,
            "duration_min": 90 + (hash(c["code"]) % 60),
            "stops": 0 if c["mult"] >= 1.0 else 1,
            "deep_link": f"https://www.skyscanner.co.in/transport/flights/del/{(d.get('nearest_airport_iata') or 'del').lower()}/",
            "official_link": f"https://www.google.com/travel/flights?q=Flights%20from%20DEL%20to%20{d['name'].replace(' ', '%20')}",
        })
    out.sort(key=lambda x: x["price_inr"])
    return out


def search_trains(dest_id: str, travelers: int = 1):
    d = _dest(dest_id)
    if not d or not d.get("approx_train_inr_from_del"): return []
    base = d["approx_train_inr_from_del"]
    out = []
    for t in TRAINS:
        price = round(base * t["mult"])
        out.append({
            "type": "train",
            "train_no": t["no"], "name": t["name"], "class": t["class"],
            "from": "NDLS", "to": d.get("nearest_railhead") or "—",
            "price_inr": price * travelers,
            "duration_hr": 12 + (hash(t["no"]) % 12),
            "deep_link": f"https://www.irctc.co.in/nget/train-search",
            "official_link": "https://www.irctc.co.in/",
        })
    out.sort(key=lambda x: x["price_inr"])
    return out


def search_hotels(dest_id: str, nights: int = 3, travelers: int = 2):
    d = _dest(dest_id)
    if not d: return []
    base_pn = d["cost_per_day_inr"]  # rough hotel rate
    out = []
    for h in HOTELS_TEMPLATE:
        per_night = round(base_pn * h["mult"])
        out.append({
            "type": "hotel",
            "tier": h["tier"], "rating": h["rating"],
            "per_night_inr": per_night,
            "total_inr": per_night * nights,
            "nights": nights, "travelers": travelers,
            "deep_link": f"https://www.booking.com/searchresults.html?ss={d['name'].replace(' ', '+')}+{d['state'].replace(' ', '+')}",
            "official_link": f"https://www.google.com/travel/hotels/{d['name'].replace(' ', '%20')}",
        })
    return out


def best_combo(dest_id: str, nights: int = 3, travelers: int = 2):
    f = search_flights(dest_id, travelers)
    t = search_trains(dest_id, travelers)
    h = search_hotels(dest_id, nights, travelers)
    cheapest_transit = (f[0] if f else None)
    if t and (not cheapest_transit or t[0]["price_inr"] < cheapest_transit["price_inr"]):
        cheapest_transit = t[0]
    return {
        "transit": cheapest_transit,
        "hotel": h[1] if len(h) > 1 else (h[0] if h else None),  # Budget tier default
        "alt_hotels": h,
        "all_flights": f,
        "all_trains": t,
        "total_inr": (cheapest_transit["price_inr"] if cheapest_transit else 0) + (h[1]["total_inr"] if len(h) > 1 else 0),
    }
