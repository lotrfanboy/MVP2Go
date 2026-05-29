import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { manualInputs } from "@/db/schema";
import { toTopicKey } from "@/lib/topic-key";
import { listEvidenceBlacklistTerms, tagEvidenceText } from "@/motor/blacklist-evidence";
import { insertEvidence } from "@/motor/evidence-store";

export async function processManualInputRow(inputId: string): Promise<{ evidenceId: string | null }> {
  const db = getDb();
  const [row] = await db.select().from(manualInputs).where(eq(manualInputs.id, inputId)).limit(1);
  if (!row || row.status !== "pending") return { evidenceId: null };

  const terms = await listEvidenceBlacklistTerms(db);
  const payload = row.payload.slice(0, 20000);
  const topicKey = toTopicKey(payload.slice(0, 120));
  const bl = tagEvidenceText(payload, row.language, terms);

  const evidenceId = await insertEvidence(db, {
    sourceKey: "manual",
    sourceItemId: inputId,
    sourceRef: row.sourceUrl,
    evidenceType: "manual_seed",
    topicKey,
    topicLabel: payload.slice(0, 200),
    observedAt: new Date(),
    language: row.language,
    market: "global",
    summary: payload.slice(0, 800),
    painText: null,
    desireText: null,
    audienceHint: null,
    quoteExcerpt: null,
    strength: "0.35",
    confidence: "0.50",
    axesJson: { seed: true },
    metricsJson: {},
    metadataJson: { manual_input_kind: row.inputKind },
    rawItemId: null,
    signalId: null,
    manualInputId: inputId,
    watchTopicId: row.watchTopicId,
    embedding: null,
    blacklistTags: bl,
  });

  await db
    .update(manualInputs)
    .set({ status: evidenceId ? "processed" : "discarded" })
    .where(eq(manualInputs.id, inputId));

  return { evidenceId };
}
