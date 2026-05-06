import { and, eq, isNull, ne, sql } from "drizzle-orm";
import { assertBudget } from "@/ai/budget";
import { getAiProvider } from "@/ai/client";
import { logAiUsage } from "@/ai/log";
import { getDb } from "@/db";
import { signals } from "@/db/schema";

type EmbedOptions = {
  runId: string;
  triggeredBy: "cron" | "manual";
  manualOverride?: boolean;
  batchSize?: number;
};

export async function runEmbed(opts: EmbedOptions): Promise<{ processed: number; embedded: number; costUsd: number }> {
  const db = getDb();
  const provider = getAiProvider();
  const batchSize = opts.batchSize ?? 50;

  const rows = await db
    .select({
      id: signals.id,
      title: signals.title,
      body: signals.body,
    })
    .from(signals)
    .where(and(isNull(signals.embedding), ne(signals.status, "noise")))
    .orderBy(sql`${signals.createdAt} DESC`)
    .limit(batchSize);

  if (rows.length === 0) return { processed: 0, embedded: 0, costUsd: 0 };

  await assertBudget({
    triggeredBy: opts.triggeredBy,
    override: opts.manualOverride,
  });

  const inputs = rows.map((row) => `${row.title}\n\n${row.body}`.trim());
  const out = await provider.embed({ inputs });

  let embedded = 0;
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const embedding = out.embeddings[i];
    if (!row || !embedding) continue;
    await db.update(signals).set({ embedding, status: "embedded" }).where(eq(signals.id, row.id));
    embedded += 1;
  }

  await logAiUsage({
    runId: opts.runId,
    operation: "embedding",
    model: out.model,
    embeddingCount: embedded,
    estimatedCostUsd: out.estimatedCostUsd,
    tokensIn: out.tokens,
    promptVersion: "001",
    status: "ok",
  });

  return { processed: rows.length, embedded, costUsd: out.estimatedCostUsd };
}
