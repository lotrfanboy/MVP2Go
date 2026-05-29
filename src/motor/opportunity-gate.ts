import { F4_WEIGHT_DEFAULTS, type F4WeightMap, loadF4Weights } from "@/motor/f4-weights";

async function gateThresholds(): Promise<F4WeightMap> {
  try {
    return await loadF4Weights();
  } catch {
    return { ...F4_WEIGHT_DEFAULTS } as F4WeightMap;
  }
}

export type AxisSnapshot = {
  trendScore: number;
  painScore: number;
  audienceScore: number;
  sourceConfidence: number;
  launchabilityScore: number;
  opportunityScore: number;
  riskPenalty?: number;
  blacklistTags?: string[];
};

export type AutomaticGateDecision = {
  gateState: string;
  reasonCodes: string[];
};

const LAUNCHABILITY_REJECT_THRESHOLD = 0.05;
const HIGH_RISK_REJECT_THRESHOLD = 0.75;

const REGULATORY_TAGS = new Set([
  "crypto_finance",
  "regulated_health",
  "regulated_legal",
  "regulated_finance",
  "regulated_substances",
  "sensitive_personal_data",
]);

function deriveBlockingReasonCodes(scores: AxisSnapshot): string[] {
  const reasonCodes = new Set<string>();
  const tags = scores.blacklistTags ?? [];

  if (tags.length > 0) {
    reasonCodes.add("not_indielab_fit");
    if (tags.some((tag) => REGULATORY_TAGS.has(tag))) {
      reasonCodes.add("regulatory_risk");
    }
  }

  if ((scores.riskPenalty ?? 0) >= HIGH_RISK_REJECT_THRESHOLD) {
    reasonCodes.add("regulatory_risk");
  }

  if (scores.launchabilityScore <= LAUNCHABILITY_REJECT_THRESHOLD) {
    reasonCodes.add("not_indielab_fit");
  }

  if (reasonCodes.size > 0) {
    reasonCodes.add("good_trend_bad_opportunity");
  }

  return [...reasonCodes];
}

export function deriveAutomaticGateDecision(
  scores: AxisSnapshot,
  w: F4WeightMap = { ...F4_WEIGHT_DEFAULTS } as F4WeightMap,
): AutomaticGateDecision {
  const blockingReasonCodes = deriveBlockingReasonCodes(scores);
  if (blockingReasonCodes.length > 0) {
    return { gateState: "rejected", reasonCodes: blockingReasonCodes };
  }

  const trend = scores.trendScore;
  const pain = scores.painScore;
  const audience = scores.audienceScore;
  const op = scores.opportunityScore;
  const src = scores.sourceConfidence;

  if (pain < 0.2 && trend >= w.f4_gate_trend_min) {
    return { gateState: "trend_only", reasonCodes: ["trend_only_no_pain"] };
  }
  if (op < 0.3) {
    return { gateState: "weak_signal", reasonCodes: ["evidence_insufficient"] };
  }
  if (pain >= w.f4_gate_pain_min && audience < 0.3) {
    return { gateState: "pain_candidate", reasonCodes: ["audience_unclear"] };
  }
  if (
    op >= w.f4_gate_qualified_min_score &&
    src >= w.f4_gate_qualified_min_source_conf
  ) {
    return { gateState: "qualified_opportunity", reasonCodes: [] };
  }

  return { gateState: "opportunity_candidate", reasonCodes: [] };
}

/**
 * Derives initial `gate_state` from axis scores (§8 F4 motor).
 * Operator transitions in UI may override (with reason_code in F4C).
 */
export async function deriveAutomaticGate(scores: AxisSnapshot): Promise<string> {
  const w = await gateThresholds();
  return deriveAutomaticGateDecision(scores, w).gateState;
}
