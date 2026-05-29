/**
 * Smoke test for automatic gate derivation (F4A).
 * Run: npx tsx scripts/test-opportunity-gate.ts
 */
import { deriveAutomaticGateDecision, type AxisSnapshot } from "../src/motor/opportunity-gate";

function main() {
  const cases: Array<{ name: string; in: AxisSnapshot; expect: string; reason?: string }> = [
    {
      name: "trend-only",
      in: {
        trendScore: 0.55,
        painScore: 0.1,
        audienceScore: 0.4,
        sourceConfidence: 0.4,
        launchabilityScore: 0.5,
        opportunityScore: 0.35,
      },
      expect: "trend_only",
      reason: "trend_only_no_pain",
    },
    {
      name: "weak",
      in: {
        trendScore: 0.2,
        painScore: 0.2,
        audienceScore: 0.2,
        sourceConfidence: 0.4,
        launchabilityScore: 0.4,
        opportunityScore: 0.25,
      },
      expect: "weak_signal",
      reason: "evidence_insufficient",
    },
    {
      name: "pain-candidate",
      in: {
        trendScore: 0.35,
        painScore: 0.62,
        audienceScore: 0.18,
        sourceConfidence: 0.4,
        launchabilityScore: 0.7,
        opportunityScore: 0.45,
      },
      expect: "pain_candidate",
      reason: "audience_unclear",
    },
    {
      name: "opportunity-candidate",
      in: {
        trendScore: 0.35,
        painScore: 0.45,
        audienceScore: 0.55,
        sourceConfidence: 0.4,
        launchabilityScore: 0.7,
        opportunityScore: 0.5,
      },
      expect: "opportunity_candidate",
    },
    {
      name: "qualified-technical",
      in: {
        trendScore: 0.5,
        painScore: 0.65,
        audienceScore: 0.6,
        sourceConfidence: 0.4,
        launchabilityScore: 0.8,
        opportunityScore: 0.58,
      },
      expect: "qualified_opportunity",
    },
    {
      name: "rejected-blacklist",
      in: {
        trendScore: 0.7,
        painScore: 0.7,
        audienceScore: 0.7,
        sourceConfidence: 0.4,
        launchabilityScore: 0,
        opportunityScore: 0.7,
        blacklistTags: ["regulated_health"],
      },
      expect: "rejected",
      reason: "regulatory_risk",
    },
    {
      name: "rejected-launchability-zero",
      in: {
        trendScore: 0.7,
        painScore: 0.7,
        audienceScore: 0.7,
        sourceConfidence: 0.4,
        launchabilityScore: 0.03,
        opportunityScore: 0.7,
      },
      expect: "rejected",
      reason: "not_indielab_fit",
    },
  ];

  let failures = 0;
  for (const c of cases) {
    const decision = deriveAutomaticGateDecision(c.in);
    const gateOk = decision.gateState === c.expect;
    const reasonOk = c.reason ? decision.reasonCodes.includes(c.reason) : true;
    if (!gateOk || !reasonOk) failures += 1;
    console.log(
      c.name,
      "=>",
      decision.gateState,
      decision.reasonCodes.join(",") || "no_reason",
      gateOk && reasonOk ? "OK" : `EXPECTED ${c.expect}${c.reason ? `/${c.reason}` : ""}`,
    );
  }

  if (failures > 0) {
    process.exitCode = 1;
  }
}

main();
