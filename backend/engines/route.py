"""Route optimizer (nearest-neighbour TSP) + suggestion engine for travel mode."""
import math
from typing import List, Tuple

EARTH_KM = 6371.0


def haversine(a: Tuple[float, float], b: Tuple[float, float]) -> float:
    lat1, lng1 = a; lat2, lng2 = b
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dl = math.radians(lng2 - lng1)
    h = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dl / 2) ** 2
    return 2 * EARTH_KM * math.asin(math.sqrt(h))


def optimize_route(stops: List[dict], start_idx: int = 0):
    """stops: [{name, lat, lng, ...}]. Returns ordered list with distance/duration."""
    if not stops:
        return {"ordered": [], "total_km": 0, "legs": []}
    n = len(stops)
    visited = [False] * n
    order = [start_idx]; visited[start_idx] = True
    while len(order) < n:
        last = stops[order[-1]]
        best, best_d = -1, float("inf")
        for i in range(n):
            if visited[i]: continue
            d = haversine((last["lat"], last["lng"]), (stops[i]["lat"], stops[i]["lng"]))
            if d < best_d:
                best, best_d = i, d
        order.append(best); visited[best] = True

    legs, total = [], 0.0
    for i in range(len(order) - 1):
        a, b = stops[order[i]], stops[order[i + 1]]
        d = haversine((a["lat"], a["lng"]), (b["lat"], b["lng"]))
        total += d
        legs.append({
            "from": a["name"], "to": b["name"], "km": round(d, 1),
            "est_drive_min": int(d / 45 * 60),
        })
    return {
        "ordered": [stops[i] for i in order],
        "total_km": round(total, 1),
        "est_total_drive_hr": round(total / 45, 1),
        "legs": legs,
    }


VIEWPOINT_SUGGESTIONS = [
    "scenic viewpoint — pull over for the panorama",
    "famous local eatery — try the regional thali",
    "heritage stop worth 30 min",
    "photo spot — golden hour recommended",
]


def nearby_pings(ordered_stops: List[dict]):
    out = []
    for i, s in enumerate(ordered_stops):
        out.append({
            "stop": s["name"],
            "ping": VIEWPOINT_SUGGESTIONS[i % len(VIEWPOINT_SUGGESTIONS)],
            "type": ["view", "food", "heritage", "photo"][i % 4],
        })
    return out
