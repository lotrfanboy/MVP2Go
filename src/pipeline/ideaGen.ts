import { and, eq, inArray, isNull } from "drizzle-orm";
import { z } from "zod";
import { assertBudget } from "@/ai/budget";
import { getAiProvider } from "@/ai/client";
import { logAiUsage } from "@/ai/log";
import { getDb } from "@/db";
import { clusters, ideaSignals, ideas, rawItems, signalCluster, signals } from "@/db/schema";
import { P_IDE_001 } from "@/prompts/p_ide_001";

const IdeaSchema = z.object({
  ideas: z.array(
    z.object({
      language: z.enum(["pt", "en", "other"]),
      name: z.string(),
      pain: z.string(),
      audience: z.string(),
      evidence: z.array(z.object({ signal_id: z.string(), quote: z.string(), url: z.string() })).default([]),
      promise: z.string(),
      product_type: z.enum(["utility", "ai_tool", "calculator", "generator", "checker", "organizer", "other"]),
      mvp: z.string(),
      channel: z.string(),
      monetization: z.enum(["free", "donation", "one_time", "subscription", "usage", "other"]),
      support_level: z.enum(["low", "medium", "high"]),
      lgpd_risk: z.enum(["low", "medium", "high"]),
      build_difficulty: z.enum(["low", "medium", "high"]),
      distribution_potential: z.enum(["low", "medium", "high"]),
      subscores: z.object({
        pain_clarity: z.number().min(0).max(1),
        b2c_fit: z.number().min(0).max(1),
        audience_specificity: z.number().min(0).max(1),
        build_simplicity: z.number().min(0).max(1),
        distribution_potential: z.number().min(0).max(1),
        support_low: z.number().min(0).max(1),
        lgpd_safety: z.number().min(0).max(1),
        evidence_volume: z.number().min(0).max(1),
        signal_strength: z.number().min(0).max(1),
        recency: z.number().min(0).max(1),
      }),
      justification: z.string(),
      next_step: z.string(),
    }),
  ),
});

export async function runIdeaGeneration(opts: {
  runId: string;
  triggeredBy: "cron" | "manual";
  manualOverride?: boolean;
}): Promise<{ clustersProcessed: number; ideasInserted: number; costUsd: number }> {
  const db = getDb();
  const provider = getAiProvider();

  const targetClusters = await db
    .select({ id: clusters.id, label: clusters.label, summary: clusters.summary })
    .from(clusters)
    .leftJoin(ideas, eq(ideas.clusterId, clusters.id))
    .where(and(eq(clusters.status, "active"), isNull(ideas.id)))
    .limit(50);

  let ideasInserted = 0;
  let costUsd = 0;

  for (const clusterRow of targetClusters) {
    const signalRows = await db
      .select({
        signalId: signals.id,
        title: signals.title,
        body: signals.body,
        rawUrl: rawItems.url,
      })
      .from(signalCluster)
      .innerJoin(signals, eq(signalCluster.signalId, signals.id))
      .leftJoin(rawItems, eq(signals.rawItemId, rawItems.id))
      .where(eq(signalCluster.clusterId, clusterRow.id))
      .limit(15);

    if (signalRows.length === 0) continue;

    const clusterBlock = [
      `label=${clusterRow.label ?? ""}`,
      `summary=${clusterRow.summary ?? ""}`,
      signalRows
        .map(
          (s, i) =>
            `signal_${i + 1}: id=${s.signalId} title=${s.title} body=${s.body.slice(0, 200)} url=${s.rawUrl ?? ""}`,
        )
        .join("\n"),
    ].join("\n\n");

    await assertBudget({
      triggeredBy: opts.triggeredBy,
      override: opts.manualOverride,
    });

    const out = await provider.complete({
      promptVersion: P_IDE_001.version,
      schema: IdeaSchema,
      prompt: P_IDE_001.content
        .replace("<<<APPROVED_EXAMPLES>>>", "[]")
        .replace("<<<REJECTED_EXAMPLES>>>", "[]")
        .replace("<<<CLUSTER_LABEL_SUMMARY_AND_SIGNALS>>>", clusterBlock),
    });

    for (const item of out.data.ideas.slice(0, 3)) {
      const evidence = item.evidence ?? [];
      const [created] = await db
        .insert(ideas)
        .values({
          clusterId: clusterRow.id,
          language: item.language,
          name: item.name,
          pain: item.pain,
          audience: item.audience,
          promise: item.promise,
          productType: item.product_type,
          mvp: item.mvp,
          channel: item.channel,
          monetization: item.monetization,
          supportLevel: item.support_level,
          lgpdRisk: item.lgpd_risk,
          buildDifficulty: item.build_difficulty,
          distributionPotential: item.distribution_potential,
          subscores: item.subscores,
          scoreJustification: item.justification,
          nextStep: item.next_step,
          status: "generated",
        })
        .returning({ id: ideas.id });
      if (!created) continue;
      ideasInserted += 1;

      const evidenceSignalIds = evidence
        .map((e) => e.signal_id)
        .filter((id) => isUuid(id));
      const linkedSignals =
        evidenceSignalIds.length > 0
          ? await db
              .select({ id: signals.id, rawUrl: rawItems.url })
              .from(signals)
              .leftJoin(rawItems, eq(signals.rawItemId, rawItems.id))
              .where(inArray(signals.id, evidenceSignalIds))
          : [];

      for (const evidenceItem of evidence) {
        if (!isUuid(evidenceItem.signal_id)) continue;
        const signal = linkedSignals.find((s) => s.id === evidenceItem.signal_id);
        if (!signal) continue;
        await db.insert(ideaSignals).values({
          ideaId: created.id,
          signalId: signal.id,
          evidenceQuote: evidenceItem.quote,
          sourceUrl: evidenceItem.url || signal.rawUrl || null,
        });
      }
    }

    await logAiUsage({
      runId: opts.runId,
      operation: "idea_gen",
      model: out.model,
      tokensIn: out.tokensIn,
      tokensOut: out.tokensOut,
      estimatedCostUsd: out.estimatedCostUsd,
      promptVersion: P_IDE_001.version,
      relatedEntityType: "cluster",
      relatedEntityId: clusterRow.id,
      status: "ok",
      latencyMs: out.latencyMs,
    });
    costUsd += out.estimatedCostUsd;
  }

  return {
    clustersProcessed: targetClusters.length,
    ideasInserted,
    costUsd,
  };
}

function isUuid(input: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input);
}
