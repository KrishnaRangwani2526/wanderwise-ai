/**
 * Local Python backend client. Run the engine separately:
 *   cd backend && uvicorn main:app --reload --port 8000
 *
 * No Supabase, no cloud — all data lives in backend/data_store/*.json
 */
export const API_BASE =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE) ||
  "http://localhost:8000";

export class BackendOfflineError extends Error {
  constructor() {
    super(
      `Local engine is offline. Start it with:  cd backend && uvicorn main:app --reload --port 8000`,
    );
    this.name = "BackendOfflineError";
  }
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
  } catch {
    throw new BackendOfflineError();
  }
  if (!res.ok) throw new Error(`${path} → ${res.status} ${await res.text()}`);
  return (await res.json()) as T;
}

export const api = {
  health: () => call<{ ok: boolean; destinations: number }>(`/health`),
  destinations: () => call<any[]>(`/destinations`),
  dream: (body: any) => call<any>(`/dream`, { method: "POST", body: JSON.stringify(body) }),
  cost: (body: any) => call<any>(`/cost`, { method: "POST", body: JSON.stringify(body) }),
  rank: (body: any) => call<any>(`/rank`, { method: "POST", body: JSON.stringify(body) }),
  analyze: (body: { text?: string; url?: string }) =>
    call<any>(`/analyze`, { method: "POST", body: JSON.stringify(body) }),
  plan: (body: any) => call<any>(`/plan`, { method: "POST", body: JSON.stringify(body) }),
  optimize: (body: any) => call<any>(`/optimize`, { method: "POST", body: JSON.stringify(body) }),
  sightsee: (id: string) => call<any>(`/sightsee/${id}`),
  book: (body: any) => call<any>(`/book/search`, { method: "POST", body: JSON.stringify(body) }),
  route: (body: any) => call<any>(`/travel/route`, { method: "POST", body: JSON.stringify(body) }),
  feedback: (body: { target_id: string; score: number; note?: string }) =>
    call<any>(`/feedback`, { method: "POST", body: JSON.stringify(body) }),
  ai: {
    dreamEnhance: (body: { name: string; interests: string[] }) =>
      call<{ text: string }>(`/ai/dream-enhance`, { method: "POST", body: JSON.stringify(body) }),
    planEnhance: (body: { destination: string }) =>
      call<{ text: string }>(`/ai/plan-enhance`, { method: "POST", body: JSON.stringify(body) }),
  },
};
