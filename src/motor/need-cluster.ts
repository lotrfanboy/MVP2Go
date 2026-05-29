import { and, desc, eq, isNotNull } from "drizzle-orm";
import { getDb } from "@/db";
import { evidenceClusters, evidences, needClusters, opportunityCards, opportunityEvidences } from "@/db/schema";
import { cosineSimilarity } from "@/motor/evidence-store";
import { weights } from "@/db/schema";

export async function getCosineThreshold(): Promise<number> {
  const db = getDb();
  const [row] = await db.select().from(weights).where(eq(weights.name, "cosine_threshold")).limit(1);
  return row ? Number(row.value) : 0.78;
}

/**
 * Greedy buckets over evidences with embeddings → `need_clusters` + `evidence_clusters`.
 * Clears prior motor outputs chained to clusters/opportunities for a clean recompute.
 */
export async function runNeedClusterEngine(): Promise<{ clusters: number; assigned: number }> {
  const db = getDb();
  const threshold = await getCosineThreshold();

  await db.delete(opportunityEvidences);
  await db.delete(opportunityCards);
  await db.delete(evidenceClusters);
  await db.delete(needClusters);

  const rows = await db
    .select()
    .from(evidences)
    .where(and(isNotNull(evidences.embedding), isNotNull(evidences.topicKey)))
    .orderBy(desc(evidences.observedAt))
    .limit(400);

  type Row = (typeof rows)[number];
  const buckets: Array<{ seed: Row; members: Row[] }> = [];

  for (const row of rows) {
    if (!row.embedding) continue;
    let assigned = false;
    for (const b of buckets) {
      const sim = cosineSimilarity(row.embedding, b.seed.embedding!);
      if (sim >= threshold) {
        b.members.push(row);
        assigned = true;
        break;
      }
    }
    if (!assigned) buckets.push({ seed: row, members: [row] });
  }

  let clusters = 0;
  let assigned = 0;

  for (const b of buckets) {
    const painParts =
      b.members
        .map((m) => m.painText)
        .filter((x): x is string => Boolean(x))
        .slice(0, 3) ?? [];
    const painSummary =
      painParts.join(" • ") ||
      b.members[0]?.summary?.slice(0, 400) ||
      b.seed.topicLabel ||
      "—";

    const aud =
      b.members
        .map((m) => m.audienceHint)
        .filter((x): x is string => Boolean(x))[0] ?? null;

    const [nc] = await db
      .insert(needClusters)
      .values({
        label: b.seed.topicLabel,
        summary: (painSummary ?? "—").slice(0, 2000),
        painSummary: String(painSummary ?? "—"),
        audienceSummary: aud,
        topicKey: b.seed.topicKey,
        topicTags: [],
        evidenceCount: b.members.length,
        coherenceScore: "0.75",
        status: "active",
      })
      .returning({ id: needClusters.id });

    if (!nc) continue;
    clusters += 1;

    for (const m of b.members) {
      await db.insert(evidenceClusters).values({
        evidenceId: m.id,
        needClusterId: nc.id,
        distance: String(
          1 - cosineSimilarity(m.embedding!, b.seed.embedding!),
        ),
        primaryEvidence: m.id === b.seed.id,
      });
      assigned += 1;
    }
  }

  return { clusters, assigned };
}
