#!/usr/bin/env bash
# Dev orchestrator: starts FastAPI (8000) in background, then Vite (foreground).
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# --- Python backend ---------------------------------------------------------
BACKEND_LOG="/tmp/dev-server-logs/backend.log"
mkdir -p /tmp/dev-server-logs
pkill -f "uvicorn main:app" 2>/dev/null || true
(
  cd "$ROOT/backend"
  # auto-load .env so env vars are visible to uvicorn workers
  set -a; [ -f .env ] && . ./.env; set +a
  exec python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload \
       >>"$BACKEND_LOG" 2>&1
) &
BACKEND_PID=$!
echo "[dev] FastAPI started (pid=$BACKEND_PID) → log: $BACKEND_LOG"

trap 'echo "[dev] stopping backend $BACKEND_PID"; kill $BACKEND_PID 2>/dev/null || true' EXIT INT TERM

# --- Vite frontend (foreground, forwards CLI args like --port 8080) ---------
cd "$ROOT/frontend"
exec ./node_modules/.bin/vite dev "$@"
