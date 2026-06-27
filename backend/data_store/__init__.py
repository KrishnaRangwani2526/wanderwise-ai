"""Local file-backed learning store. No DB, no Supabase, no cloud."""
import json, os, time, uuid
from pathlib import Path
from threading import Lock

BASE = Path(__file__).resolve().parent
BASE.mkdir(exist_ok=True)
_LOCK = Lock()


def _path(name: str) -> Path:
    return BASE / f"{name}.json"


def load(name: str, default):
    p = _path(name)
    if not p.exists():
        return default
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except Exception:
        return default


def save(name: str, data):
    with _LOCK:
        _path(name).write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


def append(name: str, item: dict):
    with _LOCK:
        cur = load(name, [])
        item = {"id": item.get("id") or str(uuid.uuid4())[:8], "ts": int(time.time()), **item}
        cur.append(item)
        save(name, cur)
        return item


def record_feedback(target_id: str, score: int, note: str = ""):
    return append("feedback", {"target_id": target_id, "score": int(score), "note": note})


def learned_itineraries():
    return load("learned_itineraries", [])
