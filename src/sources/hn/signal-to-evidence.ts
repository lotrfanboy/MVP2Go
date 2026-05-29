import { and, desc, eq, gte, isNotNull, sql } from "drizzle-orm";
import { assertBudget } from "@/ai/budget";
import { getAiProvider } from "@/ai/client";
import { logAiUsage } from "@/ai/log";
import { getDb } from "@/db";
import { rawItems, signals } from "@/db/schema";
import { toTopicKey } from "@/lib/topic-key";
import { listEvidenceBlacklistTerms, tagEvidenceText } from "@/motor/blacklist-evidence";
import { evidenceExistsDedupe, insertEvidence } from "@/motor/evidence-store";
import { ensureSignalAdapterCutoff } from "@/motor/runtime-state";
import { PeviResultSchema, P_EVI_001 } from "@/prompts/p_evi_001";

export type SignalToEvidenceOptions = {
  runId: string;
  triggeredBy: "cron" | "manual";
  manualOverride?: boolean;
  limit?: number;
};

/**
 * Adapts embedded HN signals → `evidences` via P-EVI-001. Respects cutoff
 * (first run sets "now" → no retroactive backfill).
 */
export async function runSignalToEvidence(opts: SignalToEvidenceOptions): Promise<{
  adapted: number;
  costUsd: number;
}> {
  const db = getDb();
  const cutoffIso = await ensureSignalAdapterCutoff();
  const cutoff = new Date(cutoffIso);
  const limit = opts.limit ?? 40;

  const blacklistTerms = await listEvidenceBlacklistTerms(db);

  const rows = await db
    .select({
      id: signals.id,
      title: signals.title,
      body: signals.body,
      language: signals.language,
      embedding: signals.embedding,
      postedAt: signals.postedAt,
      url: rawItems.url,
    })
    .from(signals)
    .innerJoin(rawItems, eq(signals.rawItemId, rawItems.id))
    .where(
      and(
        eq(signals.status, "embedded"),
        isNotNull(signals.embedding),
        gte(signals.createdAt, cutoff),
        sql`not exists (
          select 1 from evidences e
          where e.signal_id = ${signals.id}
            and e.evidence_type = 'discussion_signal'
        )`,
      ),
    )
    .orderBy(desc(signals.createdAt))
    .limit(limit);

  if (rows.length === 0) {
    return { adapted: 0, costUsd: 0 };
  }

  const provider = getAiProvider();
  let adapted = 0;
  let costUsd = 0;

  for (const row of rows) {
    if (!row.embedding || row.embedding.length === 0) continue;

    const rawText = [row.title, row.body].filter(Boolean).join("\n\n").slice(0, 12000);
    const topicKey = toTopicKey(row.title || "topic");

    await assertBudget({
      triggeredBy: opts.triggeredBy,
      override: opts.manualOverride,
    });

    const prompt = P_EVI_001.content
      .replace("<<<SOURCE_KEY>>>", "hn")
      .replace("<<<SOURCE_REF>>>", row.url)
      .replace("<<<RAW_TEXT>>>", rawText);

    const out = await provider.complete({
      promptVersion: P_EVI_001.version,
      schema: PeviResultSchema,
      prompt,
    });

    const ev = out.data;
    const blob = [ev.summary, ev.pain_text ?? "", ev.desire_text ?? ""].join(" ");
    const lang = ev.language === "other" ? row.language : ev.language;
    const blTags = tagEvidenceText(blob, lang, blacklistTerms);

    const primaryType =
      ev.evidence_type === "repeated_pain" ? "discussion_signal" : ev.evidence_type;

    const id = await insertEvidence(db, {
      sourceKey: "hn",
      sourceItemId: row.id,
      sourceRef: row.url,
      evidenceType: primaryType,
      topicKey,
      topicLabel: row.title.slice(0, 200),
      observedAt: row.postedAt ?? new Date(),
      language: lang,
      market: "global",
      summary: ev.summary,
      painText: ev.pain_text,
      desireText: ev.desire_text,
      audienceHint: ev.audience_hint,
      quoteExcerpt: ev.quote_excerpt,
      strength: String(ev.strength),
      confidence: String(ev.confidence),
      axesJson: ev.axes_json ?? {},
      metricsJson: {},
      metadataJson: { adapter: "signal-to-evidence" },
      rawItemId: null,
      signalId: row.id,
      manualInputId: null,
      watchTopicId: null,
      embedding: row.embedding,
      blacklistTags: blTags,
    });
    if (id) adapted += 1;

    await logAiUsage({
      runId: opts.runId,
      operation: "evidence_extract",
      model: out.model,
      tokensIn: out.tokensIn,
      tokensOut: out.tokensOut,
      estimatedCostUsd: out.estimatedCostUsd,
      relatedEntityType: "signal",
      relatedEntityId: row.id,
      promptVersion: P_EVI_001.version,
      status: "ok",
      latencyMs: out.latencyMs,
    });
    costUsd += out.estimatedCostUsd;

    if (ev.pain_text && ev.strength >= 0.45) {
      const dup = await evidenceExistsDedupe(db, "hn", row.id, "repeated_pain");
      if (!dup) {
        const r2 = await insertEvidence(db, {
          sourceKey: "hn",
          sourceItemId: row.id,
          sourceRef: row.url,
          evidenceType: "repeated_pain",
          topicKey,
          topicLabel: row.title.slice(0, 200),
          observedAt: row.postedAt ?? new Date(),
          language: lang,
          market: "global",
          summary: ev.summary,
          painText: ev.pain_text,
          desireText: null,
          audienceHint: ev.audience_hint,
          quoteExcerpt: ev.quote_excerpt,
          strength: String(Math.min(1, ev.strength + 0.05)),
          confidence: String(ev.confidence),
          axesJson: {},
          metricsJson: {},
          metadataJson: { adapter: "signal-to-evidence" },
          rawItemId: null,
          signalId: row.id,
          manualInputId: null,
          watchTopicId: null,
          embedding: row.embedding,
          blacklistTags: blTags,
        });
        if (r2) adapted += 1;
      }
    }
  }

  return { adapted, costUsd };
}
