import { and, eq } from "drizzle-orm";
import { assertBudget } from "@/ai/budget";
import { getAiProvider } from "@/ai/client";
import { logAiUsage } from "@/ai/log";
import { getDb } from "@/db";
import type { Evidence, NeedCluster } from "@/db/schema";
import { trendCandidates } from "@/db/schema";
import { clamp01, loadF4Weights } from "@/motor/f4-weights";
import { PoppResultSchema, P_OPP_001 } from "@/prompts/p_opp_001";

const EXTERNAL = new Set(["hn", "gtrends", "ph", "reddit", "youtube", "reviews"]);

export function computeSourceConfidence(sources: string[]): number {
  const ext = new Set(sources.filter((k) => EXTERNAL.has(k)));
  if (ext.size === 0) {
    const onlySeeds = sources.every((s) => s === "manual" || s === "watch");
    return onlySeeds && sources.length > 0 ? 0.2 : 0;
  }
  if (ext.size === 1) return 0.4;
  if (ext.size === 2) return 0.65;
  if (ext.size === 3) return 0.8;
  return 0.9;
}

export function computePainScore(evList: Evidence[]): number {
  let score = 0;
  const n = Math.max(1, evList.length);
  const painish = evList.filter(
    (e) =>
      Boolean(e.painText) ||
      ["repeated_pain", "workaround_signal", "alternative_request"].includes(e.evidenceType),
  );
  score += Math.min(1, painish.length / n) * 0.5;
  const avgStrength =
    evList.reduce((a, e) => a + Number(e.strength ?? 0), 0) / n;
  score += avgStrength * 0.35;
  const rep = evList.filter((e) => e.evidenceType === "repeated_pain").length;
  score += Math.min(0.15, rep * 0.05);
  return clamp01(score);
}

export function computeAudienceScore(evList: Evidence[]): number {
  const n = Math.max(1, evList.length);
  const withAud = evList.filter((e) => Boolean(e.audienceHint)).length;
  return clamp01(withAud / n * 0.7 + 0.15);
}

export function computeTrendScoreForTopic(topicKey: string | null | undefined): Promise<number> {
  return (async () => {
    if (!topicKey) return 0;
    const db = getDb();
    const [row] = await db
      .select({ trendScore: trendCandidates.trendScore })
      .from(trendCandidates)
      .where(
        and(eq(trendCandidates.topicKey, topicKey), eq(trendCandidates.windowKind, "7d")),
      )
      .limit(1);
    return row ? Number(row.trendScore) : 0;
  })();
}

export async function summarizeOpportunityContext(params: {
  need: NeedCluster;
  evidences: Evidence[];
  trend: number;
}): Promise<string> {
  const evSnippet = params.evidences
    .slice(0, 8)
    .map(
      (e) =>
        `- id=${e.id} type=${e.evidenceType} src=${e.sourceKey} summary=${(e.summary ?? "").slice(0, 200)}`,
    )
    .join("\n");
  return JSON.stringify(
    {
      topic: params.need.topicKey,
      label: params.need.label,
      pain_summary: params.need.painSummary,
      audience_summary: params.need.audienceSummary,
      trend_7d: params.trend,
      evidences: evSnippet,
    },
    null,
    0,
  );
}

export async function runLaunchabilityOppLlm(opts: {
  runId: string;
  triggeredBy: "cron" | "manual";
  manualOverride?: boolean;
  contextText: string;
}): Promise<{ launch: number; risk: number; costUsd: number }> {
  await assertBudget({
    triggeredBy: opts.triggeredBy,
    override: opts.manualOverride,
  });
  const provider = getAiProvider();
  const out = await provider.complete({
    promptVersion: P_OPP_001.version,
    schema: PoppResultSchema,
    prompt: P_OPP_001.content.replace("<<<OPPORTUNITY_CONTEXT>>>", opts.contextText),
  });
  await logAiUsage({
    runId: opts.runId,
    operation: "opportunity_score",
    model: out.model,
    tokensIn: out.tokensIn,
    tokensOut: out.tokensOut,
    estimatedCostUsd: out.estimatedCostUsd,
    relatedEntityType: "opportunity_context",
    promptVersion: P_OPP_001.version,
    status: "ok",
    latencyMs: out.latencyMs,
  });
  return {
    launch: clamp01(out.data.launchability_score),
    risk: clamp01(out.data.risk_penalty),
    costUsd: out.estimatedCostUsd,
  };
}

export async function computeOpportunityScoreRow(opts: {
  need: NeedCluster;
  evList: Evidence[];
  runId: string;
  triggeredBy: "cron" | "manual";
  manualOverride?: boolean;
}): Promise<{
  trendScore: number;
  painScore: number;
  audienceScore: number;
  sourceConfidence: number;
  launchabilityScore: number;
  riskPenalty: number;
  opportunityScore: number;
  axesJson: Record<string, unknown>;
  costUsd: number;
}> {
  const w = await loadF4Weights();
  const trendScore = await computeTrendScoreForTopic(opts.need.topicKey);
  const painScore = computePainScore(opts.evList);
  const audienceScore = computeAudienceScore(opts.evList);
  const sourceConfidence = computeSourceConfidence(opts.evList.map((e) => e.sourceKey));
  const bl = [...new Set(opts.evList.flatMap((e) => e.blacklistTags ?? []))];

  if (bl.length > 0) {
    const launchabilityScore = 0;
    const riskPenalty = 1;
    const opportunityScore = clamp01(
      w.f4_opp_trend_w * trendScore +
        w.f4_opp_pain_w * painScore +
        w.f4_opp_audience_w * audienceScore +
        w.f4_opp_source_w * sourceConfidence +
        w.f4_opp_launch_w * launchabilityScore -
        w.f4_opp_risk_penalty_w * riskPenalty,
    );

    return {
      trendScore,
      painScore,
      audienceScore,
      sourceConfidence,
      launchabilityScore,
      riskPenalty,
      opportunityScore,
      axesJson: {
        f4_weights: {
          trend: w.f4_opp_trend_w,
          pain: w.f4_opp_pain_w,
          audience: w.f4_opp_audience_w,
          source: w.f4_opp_source_w,
          launch: w.f4_opp_launch_w,
          risk: w.f4_opp_risk_penalty_w,
        },
        blacklist_tags: bl,
        blacklist_short_circuit: true,
        risk_penalty: riskPenalty,
      },
      costUsd: 0,
    };
  }

  const ctx = await summarizeOpportunityContext({
    need: opts.need,
    evidences: opts.evList,
    trend: trendScore,
  });

  const llm = await runLaunchabilityOppLlm({
    runId: opts.runId,
    triggeredBy: opts.triggeredBy,
    manualOverride: opts.manualOverride,
    contextText: ctx,
  });

  const launchabilityScore = llm.launch;
  const riskPenalty = llm.risk;

  let opportunityScore = clamp01(
    w.f4_opp_trend_w * trendScore +
      w.f4_opp_pain_w * painScore +
      w.f4_opp_audience_w * audienceScore +
      w.f4_opp_source_w * sourceConfidence +
      w.f4_opp_launch_w * launchabilityScore -
      w.f4_opp_risk_penalty_w * riskPenalty,
  );

  // HN-only: opportunity_score cannot pretend cross-source validation
  if (sourceConfidence <= 0.41) {
    opportunityScore = Math.min(opportunityScore, 0.92);
  }

  return {
    trendScore,
    painScore,
    audienceScore,
    sourceConfidence,
    launchabilityScore,
    riskPenalty,
    opportunityScore,
    axesJson: {
      f4_weights: {
        trend: w.f4_opp_trend_w,
        pain: w.f4_opp_pain_w,
        audience: w.f4_opp_audience_w,
        source: w.f4_opp_source_w,
        launch: w.f4_opp_launch_w,
        risk: w.f4_opp_risk_penalty_w,
      },
      blacklist_tags: bl,
      risk_penalty: riskPenalty,
    },
    costUsd: llm.costUsd,
  };
}
