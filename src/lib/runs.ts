import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { aiUsageLogs, runs } from "@/db/schema";

export type RunTrigger = "cron" | "manual";

export type WithRunOptions = {
  kind: string;
  triggeredBy: RunTrigger;
};

export type RunContext = {
  runId: string;
};

export type WithRunResult<T> = {
  data: T;
  costUsd?: number;
  itemsIn?: number;
  itemsOut?: number;
};

/**
 * Opens a `runs` row, executes `fn`, then finalizes the row with `ok` (and
 * aggregated cost/counts) or `error` if the function throws.
 *
 * In F0 this is the single observability primitive. F1+ will use it for
 * collectors; F2+ for pipeline stages and cron jobs. Exact semantics:
 * `runs.cost_usd` should equal Σ `ai_usage_logs.estimated_cost_usd` for the
 * run, but in F0 there are no AI calls, so it stays at 0.
 */
export async function withRun<T>(
  opts: WithRunOptions,
  fn: (ctx: RunContext) => Promise<WithRunResult<T>>,
): Promise<{ runId: string; data: T; costUsd: number }> {
  const db = getDb();
  const [created] = await db
    .insert(runs)
    .values({
      kind: opts.kind,
      triggeredBy: opts.triggeredBy,
      status: "running",
    })
    .returning({ id: runs.id });

  if (!created) {
    throw new Error("withRun: failed to insert runs row.");
  }

  const runId = created.id;

  try {
    const out = await fn({ runId });
    const costUsd = await getRunAiCostUsd(runId);
    await db
      .update(runs)
      .set({
        status: "ok",
        finishedAt: new Date(),
        itemsIn: out.itemsIn ?? 0,
        itemsOut: out.itemsOut ?? 0,
        costUsd: String(costUsd),
      })
      .where(eq(runs.id, runId));
    return { runId, data: out.data, costUsd };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const costUsd = await getRunAiCostUsd(runId);
    await db
      .update(runs)
      .set({
        status: "error",
        finishedAt: new Date(),
        costUsd: String(costUsd),
        error: message,
      })
      .where(eq(runs.id, runId));
    throw error;
  }
}

async function getRunAiCostUsd(runId: string): Promise<number> {
  const [row] = await getDb()
    .select({
      total: sql<string>`coalesce(sum(${aiUsageLogs.estimatedCostUsd}), 0)::text`,
    })
    .from(aiUsageLogs)
    .where(eq(aiUsageLogs.runId, runId));
  return Number(row?.total ?? "0");
}
