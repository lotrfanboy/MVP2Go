import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import {
  evidenceClusters,
  evidences,
  needClusters,
  opportunityCards,
  opportunityEvidences,
  trendCandidates,
} from "@/db/schema";
import { deriveAutomaticGateDecision } from "@/motor/opportunity-gate";
import { computeOpportunityScoreRow } from "@/motor/opportunity-score";

export async function runScoreOpportunitiesPipeline(opts: {
  runId: string;
  triggeredBy: "cron" | "manual";
  manualOverride?: boolean;
  needClusterIds?: string[];
  resetExisting?: boolean;
}): Promise<{ created: number; costUsd: number }> {
  const db = getDb();

  const resetExisting = opts.resetExisting ?? true;
  const scopedNeedIds = opts.needClusterIds ?? [];

  if (resetExisting) {
    await db.delete(opportunityEvidences);
    await db.delete(opportunityCards);
  } else if (scopedNeedIds.length > 0) {
    const existing = await db
      .select({ id: opportunityCards.id })
      .from(opportunityCards)
      .where(inArray(opportunityCards.needClusterId, scopedNeedIds));
    const existingIds = existing.map((row) => row.id);

    if (existingIds.length > 0) {
      await db
        .delete(opportunityEvidences)
        .where(inArray(opportunityEvidences.opportunityId, existingIds));
      await db.delete(opportunityCards).where(inArray(opportunityCards.id, existingIds));
    }
  }

  const needs =
    scopedNeedIds.length > 0
      ? await db
          .select()
          .from(needClusters)
          .where(and(eq(needClusters.status, "active"), inArray(needClusters.id, scopedNeedIds)))
      : await db.select().from(needClusters).where(eq(needClusters.status, "active"));

  let created = 0;
  let costUsd = 0;

  for (const need of needs) {
    const evRows = await db
      .select({ ev: evidences })
      .from(evidenceClusters)
      .innerJoin(evidences, eq(evidenceClusters.evidenceId, evidences.id))
      .where(eq(evidenceClusters.needClusterId, need.id));

    const evList = evRows.map((r) => r.ev);
    if (evList.length === 0) continue;

    const scores = await computeOpportunityScoreRow({
      need,
      evList,
      runId: opts.runId,
      triggeredBy: opts.triggeredBy,
      manualOverride: opts.manualOverride,
    });
    costUsd += scores.costUsd;

    const blacklistTags = [...new Set(evList.flatMap((e) => e.blacklistTags ?? []))];
    const gate = deriveAutomaticGateDecision({
      trendScore: scores.trendScore,
      painScore: scores.painScore,
      audienceScore: scores.audienceScore,
      sourceConfidence: scores.sourceConfidence,
      launchabilityScore: scores.launchabilityScore,
      opportunityScore: scores.opportunityScore,
      riskPenalty: scores.riskPenalty,
      blacklistTags,
    });

    const tk = need.topicKey ?? "unknown";
    const [tc] = await db
      .select({ id: trendCandidates.id })
      .from(trendCandidates)
      .where(and(eq(trendCandidates.topicKey, tk), eq(trendCandidates.windowKind, "7d")))
      .limit(1);

    const [oc] = await db
      .insert(opportunityCards)
      .values({
        needClusterId: need.id,
        trendCandidateId: tc?.id ?? null,
        topicKey: need.topicKey,
        topicLabel: need.label ?? need.topicKey ?? "Oportunidade",
        painSummary: need.painSummary,
        audienceSummary: need.audienceSummary,
        market: "global",
        language: "other",
        trendScore: String(scores.trendScore),
        painScore: String(scores.painScore),
        audienceScore: String(scores.audienceScore),
        sourceConfidence: String(scores.sourceConfidence),
        launchabilityScore: String(scores.launchabilityScore),
        opportunityScore: String(scores.opportunityScore),
        axesJson: scores.axesJson,
        evidenceCount: evList.length,
        sourceCount: new Set(evList.map((e) => e.sourceKey)).size,
        gateState: gate.gateState,
        reasonCodes: gate.reasonCodes,
        blacklistTags,
      })
      .returning({ id: opportunityCards.id });

    if (!oc) continue;
    created += 1;

    for (const e of evList) {
      await db.insert(opportunityEvidences).values({
        opportunityId: oc.id,
        evidenceId: e.id,
        contributionJson: {},
      });
    }
  }

  return { created, costUsd };
}
