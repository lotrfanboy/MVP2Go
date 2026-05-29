import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { manualInputs } from "@/db/schema";
import { runNeedClusterEngine } from "@/motor/need-cluster";
import { runTrendEngine } from "@/motor/trend-engine";
import { processManualInputRow } from "@/sources/manual/normalizer";
import { runSignalToEvidence } from "@/sources/hn/signal-to-evidence";

export async function runBuildEvidencePipeline(opts: {
  runId: string;
  triggeredBy: "cron" | "manual";
  manualOverride?: boolean;
}): Promise<{
  signalAdapter: { adapted: number; costUsd: number };
  manualProcessed: number;
  trendRows: number;
  clusters: { clusters: number; assigned: number };
  costUsd: number;
}> {
  const signalAdapter = await runSignalToEvidence({
    runId: opts.runId,
    triggeredBy: opts.triggeredBy,
    manualOverride: opts.manualOverride,
  });

  const db = getDb();
  const pending = await db
    .select({ id: manualInputs.id })
    .from(manualInputs)
    .where(eq(manualInputs.status, "pending"))
    .limit(25);

  let manualProcessed = 0;
  for (const p of pending) {
    await processManualInputRow(p.id);
    manualProcessed += 1;
  }

  const { rows: trendRows } = await runTrendEngine();
  const clusters = await runNeedClusterEngine();

  return {
    signalAdapter,
    manualProcessed,
    trendRows,
    clusters,
    costUsd: signalAdapter.costUsd,
  };
}
