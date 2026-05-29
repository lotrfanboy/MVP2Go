import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { watchTopics } from "@/db/schema";
import { insertEvidence } from "@/motor/evidence-store";

/** Lightweight audit trail when a watch topic is created/updated; does not raise external source confidence. */
export async function recordWatchTopicEvidence(topicId: string): Promise<string | null> {
  const db = getDb();
  const [w] = await db.select().from(watchTopics).where(eq(watchTopics.id, topicId)).limit(1);
  if (!w) return null;

  return insertEvidence(db, {
    sourceKey: "watch",
    sourceItemId: topicId,
    sourceRef: null,
    evidenceType: "manual_seed",
    topicKey: w.topicKey,
    topicLabel: w.topicLabel,
    observedAt: new Date(),
    language: w.language === "all" ? "other" : w.language,
    market: w.market,
    summary: `Watch topic: ${w.topicLabel}`,
    painText: null,
    desireText: null,
    audienceHint: null,
    quoteExcerpt: null,
    strength: "0.15",
    confidence: "0.90",
    axesJson: { watch_seed: true },
    metricsJson: {},
    metadataJson: { watch_topic_id: topicId },
    rawItemId: null,
    signalId: null,
    manualInputId: null,
    watchTopicId: topicId,
    embedding: null,
    blacklistTags: [],
  });
}
