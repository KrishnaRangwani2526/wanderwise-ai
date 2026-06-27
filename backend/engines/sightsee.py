"""Sightsee — curated Unsplash imagery per destination (offline, hard-coded ids)."""
from data.destinations import DESTINATIONS

# Curated Unsplash photo IDs per destination (stable hot-link URLs)
IMAGES = {
    "manali":     ["photo-1626621341517-bbf3d9990a23", "photo-1626253549413-cbe66b5e2d11", "photo-1605649487212-47bdab064df7", "photo-1469474968028-56623f02e42e"],
    "leh":        ["photo-1589551376879-d50b87739f33", "photo-1605649487212-47bdab064df7", "photo-1626621341517-bbf3d9990a23", "photo-1502920917128-1aa500764cbd"],
    "goa":        ["photo-1512343879784-a960bf40e7f2", "photo-1571406252241-db0280bd06b3", "photo-1582719471384-894fbb16e074", "photo-1559128010-7c1ad6e1b6a5"],
    "jaipur":     ["photo-1599661046289-e31897846e41", "photo-1477587458883-47145ed94245", "photo-1524613032530-449a5d94c285", "photo-1548013146-72479768bada"],
    "udaipur":    ["photo-1568454537842-d933259bb1ce", "photo-1599661046289-e31897846e41", "photo-1564507592333-c60657eea523", "photo-1524613032530-449a5d94c285"],
    "jaisalmer":  ["photo-1477587458883-47145ed94245", "photo-1524613032530-449a5d94c285", "photo-1583395145308-4c0a3c44f47d", "photo-1539650116574-75c0c6d73f6e"],
    "rishikesh":  ["photo-1591018403220-3b5c66c70b00", "photo-1605649487212-47bdab064df7", "photo-1469474968028-56623f02e42e", "photo-1506905925346-21bda4d32df4"],
    "varanasi":   ["photo-1561361513-2d000a50f0dc", "photo-1561361398-a8d5300cda85", "photo-1583395145308-4c0a3c44f47d", "photo-1561361398-a8d5300cda85"],
}

DEFAULT_PHOTOS = ["photo-1488646953014-85cb44e25828", "photo-1469474968028-56623f02e42e", "photo-1502920917128-1aa500764cbd", "photo-1506905925346-21bda4d32df4"]


def _url(pid: str, w: int = 1200):
    return f"https://images.unsplash.com/{pid}?w={w}&q=80&auto=format&fit=crop"


def gallery_for(dest_id: str):
    d = next((x for x in DESTINATIONS if x["id"] == dest_id), None)
    if not d:
        return {"error": "unknown destination"}
    photos = IMAGES.get(dest_id, DEFAULT_PHOTOS)
    return {
        "destination": {"id": d["id"], "name": d["name"], "state": d["state"], "tagline": d["tagline"]},
        "hero": _url(photos[0], 1600),
        "gallery": [{"src": _url(p, 1200), "thumb": _url(p, 400), "alt": f"{d['name']} — view"} for p in photos],
        "blog_search": f"https://www.google.com/search?q={d['name'].replace(' ', '+')}+travel+blog&tbm=isch",
    }


def all_destination_cards():
    """Lightweight cards for the landing page / sightsee index."""
    out = []
    for d in DESTINATIONS:
        photos = IMAGES.get(d["id"], DEFAULT_PHOTOS)
        out.append({
            "id": d["id"], "name": d["name"], "state": d["state"],
            "tagline": d["tagline"], "interests": d["interests"],
            "best_seasons": d["best_seasons"], "cost_per_day_inr": d["cost_per_day_inr"],
            "image": _url(photos[0], 800),
        })
    return out
