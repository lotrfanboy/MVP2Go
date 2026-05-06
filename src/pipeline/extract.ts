import { and, eq, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { assertBudget } from "@/ai/budget";
import { getAiProvider } from "@/ai/client";
import { logAiUsage } from "@/ai/log";
import { getDb } from "@/db";
import { rawItems, signals, sources } from "@/db/schema";
import { runAiFilterForDoubtfulItem } from "@/pipeline/filter_ai";
import { P_EXT_001 } from "@/prompts/p_ext_001";

const ExtractSchema = z.object({
  language: z.enum(["pt", "en", "other"]),
  is_b2c_relevant: z.boolean(),
  relevance_b2c: z.number().min(0).max(1),
  signal_strength: z.number().min(0).max(1),
  pain: z.string().nullable(),
  desire: z.string().nullable(),
  complaint: z.string().nullable(),
  behavior: z.string().nullable(),
  audience_hint: z.string().nullable(),
  topic_tags: z.array(z.string()).default([]),
  noise_reason: z.string().nullable(),
  evidence_quote: z.string().nullable(),
});

type ExtractOptions = {
  runId: string;
  triggeredBy: "cron" | "manual";
  manualOverride?: boolean;
  limit?: number;
};

function toPrompt(params: {
  title: string;
  body: string;
  url: string;
  sourceName: string;
  postedAt: string;
}): string {
  return P_EXT_001.content
    .replace("<<<TITLE>>>", params.title)
    .replace("<<<BODY>>>", params.body)
    .replace("<<<URL>>>", params.url)
    .replace("<<<SOURCE_NAME>>>", params.sourceName)
    .replace("<<<POSTED_AT>>>", params.postedAt);
}

function toStringField(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function isDoubtfulExtract(result: {
  language: "pt" | "en" | "other";
  is_b2c_relevant: boolean;
  relevance_b2c: number;
  signal_strength: number;
}): boolean {
  const relevance = result.relevance_b2c;
  const strength = result.signal_strength;
  const relevanceAmbiguous = relevance >= 0.35 && relevance <= 0.65;
  const strengthAmbiguous = strength >= 0.35 && strength <= 0.65;
  return !result.is_b2c_relevant || result.language === "other" || relevanceAmbiguous || strengthAmbiguous;
}

export async function runExtract(opts: ExtractOptions): Promise<{ processed: number; inserted: number; costUsd: number }> {
  const db = getDb();
  const provider = getAiProvider();
  const limit = opts.limit ?? 50;

  const rows = await db
    .select({
      id: rawItems.id,
      url: rawItems.url,
      payload: rawItems.rawPayload,
      sourceName: sources.name,
    })
    .from(rawItems)
    .innerJoin(sources, eq(rawItems.sourceId, sources.id))
    .leftJoin(signals, eq(signals.rawItemId, rawItems.id))
    .where(and(eq(rawItems.isCandidate, true), isNull(signals.id)))
    .orderBy(sql`${rawItems.fetchedAt} DESC`)
    .limit(limit);

  let inserted = 0;
  let costUsd = 0;

  for (const row of rows) {
    const payload = (row.payload ?? {}) as Record<string, unknown>;
    const title = toStringField(payload.title);
    const body = toStringField(payload.body);
    const combined = [title, body].filter(Boolean).join("\n\n");
    const postedAtRaw = payload.createdAtUnix;
    const postedAt =
      typeof postedAtRaw === "number" && Number.isFinite(postedAtRaw)
        ? new Date(postedAtRaw * 1000).toISOString()
        : new Date().toISOString();

    await assertBudget({
      triggeredBy: opts.triggeredBy,
      override: opts.manualOverride,
    });

    try {
      const out = await provider.complete({
        promptVersion: P_EXT_001.version,
        schema: ExtractSchema,
        prompt: toPrompt({
          title,
          body: combined,
          url: row.url,
          sourceName: row.sourceName,
          postedAt,
        }),
      });

      let isNoise = !out.data.is_b2c_relevant;
      let language = out.data.language;

      // Hybrid filter: only use P-FIL-001 on ambiguous extraction outputs.
      if (isDoubtfulExtract(out.data)) {
        const filterOut = await runAiFilterForDoubtfulItem({
          runId: opts.runId,
          triggeredBy: opts.triggeredBy,
          manualOverride: opts.manualOverride,
          title,
          body: combined,
          url: row.url,
          sourceName: row.sourceName,
        });
        isNoise = isNoise || filterOut.isNoise;
        language = filterOut.language;
        costUsd += filterOut.costUsd;
      }

      const insertedRow = await db
        .insert(signals)
        .values({
          rawItemId: row.id,
          title,
          body: combined,
          authorHandle: toStringField(payload.authorHandle) || null,
          language,
          postedAt: new Date(postedAt),
          metricScore: typeof payload.points === "number" ? payload.points : null,
          metricComments: typeof payload.numComments === "number" ? payload.numComments : null,
          relevanceB2c: String(out.data.relevance_b2c),
          signalStrength: String(out.data.signal_strength),
          isNoise,
          status: isNoise ? "noise" : "ready",
        })
        .onConflictDoNothing({ target: signals.rawItemId })
        .returning({ id: signals.id });

      await logAiUsage({
        runId: opts.runId,
        operation: "extract",
        source: row.sourceName,
        model: out.model,
        tokensIn: out.tokensIn,
        tokensOut: out.tokensOut,
        estimatedCostUsd: out.estimatedCostUsd,
        relatedEntityType: "raw_item",
        relatedEntityId: row.id,
        promptVersion: P_EXT_001.version,
        status: "ok",
        latencyMs: out.latencyMs,
      });

      if (insertedRow.length > 0) {
        inserted += 1;
      }
      costUsd += out.estimatedCostUsd;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "extract_error";
      await logAiUsage({
        runId: opts.runId,
        operation: "extract",
        source: row.sourceName,
        model: process.env.OPENAI_LLM_MODEL ?? "gpt-4o-mini",
        relatedEntityType: "raw_item",
        relatedEntityId: row.id,
        promptVersion: P_EXT_001.version,
        status: "error",
      });
      throw new Error(`extract failed for raw_item=${row.id}: ${message}`);
    }
  }

  return { processed: rows.length, inserted, costUsd };
}
