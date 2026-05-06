import { and, desc, eq, isNotNull, isNull, ne, sql } from "drizzle-orm";
import { z } from "zod";
import { assertBudget } from "@/ai/budget";
import { getAiProvider } from "@/ai/client";
import { logAiUsage } from "@/ai/log";
import { getDb } from "@/db";
import { clusters, signalCluster, signals, weights } from "@/db/schema";
import { P_CLU_001 } from "@/prompts/p_clu_001";

const ClusterSchema = z.object({
  label: z.string(),
  summary: z.string(),
  common_pain: z.string().nullable(),
  common_audience: z.string().nullable(),
  topic_tags: z.array(z.string()).default([]),
  coherence_score: z.number().min(0).max(1),
});

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i += 1) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    dot += av * bv;
    magA += av * av;
    magB += bv * bv;
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  if (denom === 0) return 0;
  return dot / denom;
}

async function getThreshold(): Promise<number> {
  const db = getDb();
  const [row] = await db.select().from(weights).where(eq(weights.name, "cosine_threshold")).limit(1);
  return row ? Number(row.value) : 0.78;
}

export async function runCluster(opts: {
  runId: string;
  triggeredBy: "cron" | "manual";
  manualOverride?: boolean;
}): Promise<{ assigned: number; clustersCreated: number; costUsd: number }> {
  const db = getDb();
  const provider = getAiProvider();
  const threshold = await getThreshold();

  const rows = await db
    .select({
      id: signals.id,
      title: signals.title,
      body: signals.body,
      embedding: signals.embedding,
      sourceUrl: rawSqlUrl(),
    })
    .from(signals)
    .where(and(isNotNull(signals.embedding), ne(signals.status, "noise"), isNull(signalsClusterProbe())))
    .orderBy(desc(signals.createdAt))
    .limit(150);

  const buckets: Array<{ seedId: string; memberIds: string[] }> = [];
  for (const row of rows) {
    if (!row.embedding) continue;
    let assigned = false;
    for (const bucket of buckets) {
      const seed = rows.find((x) => x.id === bucket.seedId);
      if (!seed?.embedding) continue;
      const sim = cosineSimilarity(row.embedding, seed.embedding);
      if (sim >= threshold) {
        bucket.memberIds.push(row.id);
        assigned = true;
        break;
      }
    }
    if (!assigned) buckets.push({ seedId: row.id, memberIds: [row.id] });
  }

  let assigned = 0;
  let clustersCreated = 0;
  let costUsd = 0;

  for (const bucket of buckets) {
    const [created] = await db
      .insert(clusters)
      .values({ centroidSignalId: bucket.seedId, status: "active" })
      .returning({ id: clusters.id });
    if (!created) continue;
    clustersCreated += 1;

    for (const signalId of bucket.memberIds) {
      await db.insert(signalCluster).values({
        clusterId: created.id,
        signalId,
      });
      assigned += 1;
    }

    const clusterSignals = rows.filter((r) => bucket.memberIds.includes(r.id)).slice(0, 12);
    const signalsText = clusterSignals
      .map((s, idx) => `#${idx + 1}\nsignal_id=${s.id}\ntitle=${s.title}\nbody=${s.body.slice(0, 220)}`)
      .join("\n\n");

    await assertBudget({ triggeredBy: opts.triggeredBy, override: opts.manualOverride });
    const out = await provider.complete({
      promptVersion: P_CLU_001.version,
      schema: ClusterSchema,
      prompt: P_CLU_001.content.replace("<<<LIST_OF_SIGNALS_WITH_QUOTES>>>", signalsText),
    });

    await db
      .update(clusters)
      .set({
        label: out.data.label,
        summary: out.data.summary,
        commonPain: out.data.common_pain,
        commonAudience: out.data.common_audience,
        topicTags: out.data.topic_tags,
        coherenceScore: String(out.data.coherence_score),
        updatedAt: new Date(),
      })
      .where(eq(clusters.id, created.id));

    await logAiUsage({
      runId: opts.runId,
      operation: "cluster_summary",
      model: out.model,
      tokensIn: out.tokensIn,
      tokensOut: out.tokensOut,
      estimatedCostUsd: out.estimatedCostUsd,
      relatedEntityType: "cluster",
      relatedEntityId: created.id,
      promptVersion: P_CLU_001.version,
      status: "ok",
      latencyMs: out.latencyMs,
    });

    costUsd += out.estimatedCostUsd;
  }

  return { assigned, clustersCreated, costUsd };
}

function signalsClusterProbe() {
  return sql`(
    select sc.signal_id
    from signal_cluster sc
    where sc.signal_id = ${signals.id}
    limit 1
  )`;
}

function rawSqlUrl() {
  return sql<string>`coalesce((select ri.url from raw_items ri where ri.id = ${signals.rawItemId} limit 1), '')`;
}
