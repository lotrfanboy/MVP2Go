import { z } from "zod";
import { assertBudget } from "@/ai/budget";
import { getAiProvider } from "@/ai/client";
import { logAiUsage } from "@/ai/log";
import { P_FIL_001 } from "@/prompts/p_fil_001";

const FilterSchema = z.object({
  is_noise: z.boolean(),
  language: z.enum(["pt", "en", "other"]),
  reason: z.string(),
});

export async function runAiFilterForDoubtfulItem(params: {
  runId: string;
  triggeredBy: "cron" | "manual";
  manualOverride?: boolean;
  title: string;
  body: string;
  url: string;
  sourceName: string;
}): Promise<{ isNoise: boolean; language: "pt" | "en" | "other"; reason: string; costUsd: number }> {
  await assertBudget({
    triggeredBy: params.triggeredBy,
    override: params.manualOverride,
  });

  const prompt = P_FIL_001.content
    .replace("<<<TITLE>>>", params.title)
    .replace("<<<URL>>>", params.url)
    .replace("<<<BODY_FIRST_300_CHARS>>>", params.body.slice(0, 300));

  const out = await getAiProvider().complete({
    promptVersion: P_FIL_001.version,
    schema: FilterSchema,
    prompt,
  });

  await logAiUsage({
    runId: params.runId,
    operation: "filter_ai",
    source: params.sourceName,
    model: out.model,
    tokensIn: out.tokensIn,
    tokensOut: out.tokensOut,
    estimatedCostUsd: out.estimatedCostUsd,
    promptVersion: P_FIL_001.version,
    status: "ok",
    latencyMs: out.latencyMs,
  });

  return {
    isNoise: out.data.is_noise,
    language: out.data.language,
    reason: out.data.reason,
    costUsd: out.estimatedCostUsd,
  };
}
