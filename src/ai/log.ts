import { getDb } from "@/db";
import { aiUsageLogs } from "@/db/schema";
import { addBudgetSpend } from "@/ai/budget";

export type LogAiUsageInput = {
  runId: string;
  operation: string;
  source?: string | null;
  model: string;
  tokensIn?: number;
  tokensOut?: number;
  embeddingCount?: number;
  estimatedCostUsd?: number;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  promptVersion?: string | null;
  status?: "ok" | "error";
  latencyMs?: number | null;
};

export async function logAiUsage(input: LogAiUsageInput): Promise<void> {
  await getDb().insert(aiUsageLogs).values({
    runId: input.runId,
    operation: input.operation,
    source: input.source ?? null,
    model: input.model,
    tokensIn: input.tokensIn ?? 0,
    tokensOut: input.tokensOut ?? 0,
    embeddingCount: input.embeddingCount ?? 0,
    estimatedCostUsd: String(input.estimatedCostUsd ?? 0),
    relatedEntityType: input.relatedEntityType ?? null,
    relatedEntityId: input.relatedEntityId ?? null,
    promptVersion: input.promptVersion ?? null,
    status: input.status ?? "ok",
    latencyMs: input.latencyMs ?? null,
  });

  if ((input.status ?? "ok") === "ok") {
    await addBudgetSpend(input.estimatedCostUsd ?? 0);
  }
}
