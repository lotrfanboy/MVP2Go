import { and, eq, sql } from "drizzle-orm";
import type { DbClient } from "@/db";
import { evidences } from "@/db/schema";
import type { NewEvidence } from "@/db/schema";

/** Semantic cosine from pgvector already stored on evidence; local helper for bucketing. */
export function cosineSimilarity(a: number[], b: number[]): number {
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

export async function evidenceExistsDedupe(
  db: DbClient,
  sourceKey: string,
  sourceItemId: string | null,
  evidenceType: string,
): Promise<boolean> {
  const [row] = await db
    .select({ id: evidences.id })
    .from(evidences)
    .where(
      and(
        eq(evidences.sourceKey, sourceKey),
        eq(evidences.evidenceType, evidenceType),
        sql`coalesce(${evidences.sourceItemId}, '') = coalesce(${sourceItemId ?? ""}, '')`,
      ),
    )
    .limit(1);
  return Boolean(row);
}

export async function insertEvidence(db: DbClient, row: NewEvidence): Promise<string | null> {
  const exists = await evidenceExistsDedupe(
    db,
    row.sourceKey,
    row.sourceItemId ?? null,
    row.evidenceType,
  );
  if (exists) return null;
  const [created] = await db.insert(evidences).values(row).returning({ id: evidences.id });
  return created?.id ?? null;
}
