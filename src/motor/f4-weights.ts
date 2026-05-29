import { inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { weights } from "@/db/schema";

export const F4_WEIGHT_DEFAULTS = {
  f4_trend_recency_w: 0.25,
  f4_trend_frequency_w: 0.2,
  f4_trend_acceleration_w: 0.2,
  f4_trend_persistence_w: 0.2,
  f4_trend_diversity_w: 0.15,
  f4_pain_explicit_w: 0.2,
  f4_pain_alternative_w: 0.15,
  f4_pain_workaround_w: 0.15,
  f4_pain_cost_time_w: 0.12,
  f4_pain_urgency_w: 0.13,
  f4_pain_repetition_w: 0.15,
  f4_audience_clarity_w: 0.22,
  f4_audience_niche_w: 0.2,
  f4_audience_acquirability_w: 0.18,
  f4_audience_market_w: 0.18,
  f4_audience_buyer_w: 0.12,
  f4_launch_solo_w: 0.12,
  f4_launch_mvp_window_w: 0.12,
  f4_launch_low_support_w: 0.12,
  f4_launch_web_first_w: 0.1,
  f4_launch_low_custom_w: 0.1,
  f4_launch_low_risk_w: 0.1,
  f4_launch_simple_money_w: 0.08,
  f4_launch_channel_w: 0.08,
  f4_launch_no_heavy_int_w: 0.08,
  f4_launch_no_jur_risk_w: 0.08,
  f4_opp_trend_w: 0.1,
  f4_opp_pain_w: 0.3,
  f4_opp_audience_w: 0.15,
  f4_opp_source_w: 0.2,
  f4_opp_launch_w: 0.2,
  f4_opp_risk_penalty_w: 0.2,
  f4_gate_qualified_min_score: 0.55,
  f4_gate_qualified_min_source_conf: 0.4,
  f4_gate_pain_min: 0.4,
  f4_gate_trend_min: 0.5,
} as const;

export type F4WeightKey = keyof typeof F4_WEIGHT_DEFAULTS;

const NAMES = Object.keys(F4_WEIGHT_DEFAULTS) as F4WeightKey[];

export type F4WeightMap = { [K in F4WeightKey]: number };

export async function loadF4Weights(): Promise<F4WeightMap> {
  const db = getDb();
  const rows = await db
    .select({ name: weights.name, value: weights.value })
    .from(weights)
    .where(inArray(weights.name, NAMES as unknown as string[]));
  const map: Record<string, number> = { ...F4_WEIGHT_DEFAULTS };
  for (const r of rows) {
    map[r.name] = Number(r.value);
  }
  return map as F4WeightMap;
}

export function clamp01(x: number): number {
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}
