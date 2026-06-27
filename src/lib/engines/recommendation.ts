// Recommendation engine — pure, deterministic scoring.
// Matches user "dream" inputs against the destinations dataset.

import { DESTINATIONS, type Destination, type Interest, type Season } from "@/data/destinations";

export interface DreamInput {
  interests: Interest[];
  seasons?: Season[];
  duration_days?: number;
  origin_iata?: string; // e.g. "DEL" — used only for rough flight-cost weighting
  max_budget_per_day_inr?: number;
  avoid_crowds?: boolean;
}

export interface DestinationMatch {
  destination: Destination;
  score: number; // 0..1
  reasons: string[];
}

export function recommendDestinations(input: DreamInput, limit = 6): DestinationMatch[] {
  const { interests, seasons, duration_days, max_budget_per_day_inr, avoid_crowds } = input;

  const scored = DESTINATIONS.map<DestinationMatch>((d) => {
    const reasons: string[] = [];
    let score = 0;

    // Interest overlap (max 0.45)
    if (interests.length > 0) {
      const overlap = d.interests.filter((i) => interests.includes(i));
      const interestScore = (overlap.length / interests.length) * 0.45;
      score += interestScore;
      if (overlap.length > 0) {
        reasons.push(`Matches ${overlap.map((o) => o).join(", ")}`);
      }
    } else {
      score += 0.2;
    }

    // Season fit (max 0.2)
    if (seasons && seasons.length > 0) {
      const seasonHit = d.best_seasons.some((s) => seasons.includes(s));
      if (seasonHit) {
        score += 0.2;
        reasons.push("In peak season");
      } else {
        score -= 0.1;
        reasons.push("Off-season — expect tradeoffs");
      }
    } else {
      score += 0.1;
    }

    // Duration fit (max 0.15)
    if (duration_days != null) {
      const [min, max] = d.ideal_duration_days;
      if (duration_days >= min && duration_days <= max) {
        score += 0.15;
        reasons.push(`Ideal for ${duration_days}-day trip`);
      } else if (duration_days >= min - 1 && duration_days <= max + 2) {
        score += 0.08;
      }
    } else {
      score += 0.075;
    }

    // Budget fit (max 0.1)
    if (max_budget_per_day_inr != null) {
      if (d.cost_per_day_inr <= max_budget_per_day_inr) {
        score += 0.1;
        reasons.push(`Within ₹${max_budget_per_day_inr}/day budget`);
      } else if (d.cost_per_day_inr <= max_budget_per_day_inr * 1.2) {
        score += 0.04;
      }
    } else {
      score += 0.05;
    }

    // Crowd preference (max 0.1)
    if (avoid_crowds) {
      score += (1 - d.crowd_factor) * 0.1;
      if (d.crowd_factor < 0.5) reasons.push("Off the beaten path");
    } else {
      score += 0.05;
    }

    return {
      destination: d,
      score: Math.max(0, Math.min(1, score)),
      reasons,
    };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}
