/**
 * Integration smoke for F4A blacklist propagation:
 * evidence.blacklist_tags -> runScoreOpportunitiesPipeline -> opportunity_cards.rejected.
 *
 * The fixture is scoped by a unique topic_key and cleaned up in finally.
 */
import { randomUUID } from "node:crypto";
import { count, eq, inArray, ne } from "drizzle-orm";
import { getDb } from "../src/db";
import {
  aiUsageLogs,
  evidenceClusters,
  evidences,
  needClusters,
  opportunityCards,
  opportunityEvidences,
} from "../src/db/schema";
import { runScoreOpportunitiesPipeline } from "../src/motor/run-score-opportunities";

const BLACKLIST_TAG = "regulated_health";

function fixtureEmbedding(): number[] {
  const vector = Array.from({ length: 1536 }, () => 0);
  vector[0] = 1;
  return vector;
}

async function cleanupFixture(topicKey: string): Promise<void> {
  const db = getDb();
  const cards = await db
    .select({ id: opportunityCards.id })
    .from(opportunityCards)
    .where(eq(opportunityCards.topicKey, topicKey));
  const cardIds = cards.map((card) => card.id);

  if (cardIds.length > 0) {
    await db
      .delete(opportunityEvidences)
      .where(inArray(opportunityEvidences.opportunityId, cardIds));
    await db.delete(opportunityCards).where(inArray(opportunityCards.id, cardIds));
  }

  const clusters = await db
    .select({ id: needClusters.id })
    .from(needClusters)
    .where(eq(needClusters.topicKey, topicKey));
  const clusterIds = clusters.map((cluster) => cluster.id);

  if (clusterIds.length > 0) {
    await db.delete(evidenceClusters).where(inArray(evidenceClusters.needClusterId, clusterIds));
  }

  const evRows = await db
    .select({ id: evidences.id })
    .from(evidences)
    .where(eq(evidences.topicKey, topicKey));
  const evidenceIds = evRows.map((evidence) => evidence.id);

  if (evidenceIds.length > 0) {
    await db.delete(evidenceClusters).where(inArray(evidenceClusters.evidenceId, evidenceIds));
    await db.delete(evidences).where(inArray(evidences.id, evidenceIds));
  }

  if (clusterIds.length > 0) {
    await db.delete(needClusters).where(inArray(needClusters.id, clusterIds));
  }
}

async function main(): Promise<void> {
  const db = getDb();
  const suffix = `${Date.now()}-${randomUUID().slice(0, 8)}`;
  const topicKey = `f4a-blacklist-fixture-${suffix}`;
  const runId = randomUUID();
  let cleanupOk = false;

  try {
    await cleanupFixture(topicKey);

    const [realCardsBefore] = await db
      .select({ count: count() })
      .from(opportunityCards)
      .where(ne(opportunityCards.topicKey, topicKey));
    const [aiLogsBefore] = await db
      .select({ count: count() })
      .from(aiUsageLogs)
      .where(eq(aiUsageLogs.runId, runId));

    const [evidence] = await db
      .insert(evidences)
      .values({
        sourceKey: "hn",
        sourceItemId: topicKey,
        sourceRef: "https://news.ycombinator.com/item?id=f4a-blacklist-fixture",
        evidenceType: "repeated_pain",
        topicKey,
        topicLabel: "F4A blacklist fixture",
        observedAt: new Date(),
        language: "en",
        market: "global",
        summary: "Fixture evidence with explicit blacklist tag for regulated health.",
        painText: "Users describe a regulated health diagnosis workflow.",
        desireText: "They want diagnosis automation.",
        audienceHint: "patients",
        quoteExcerpt: "I need a diagnosis tool.",
        strength: "0.900",
        confidence: "0.900",
        axesJson: { fixture: true },
        metricsJson: {},
        metadataJson: { fixture: true, topicKey },
        rawItemId: null,
        signalId: null,
        manualInputId: null,
        watchTopicId: null,
        embedding: fixtureEmbedding(),
        blacklistTags: [BLACKLIST_TAG],
      })
      .returning({ id: evidences.id, blacklistTags: evidences.blacklistTags });

    if (!evidence) {
      throw new Error("Failed to create fixture evidence.");
    }

    const [cluster] = await db
      .insert(needClusters)
      .values({
        label: "F4A blacklist fixture",
        summary: "Fixture cluster for blacklist persistence test.",
        painSummary: "Regulated health diagnosis workflow.",
        audienceSummary: "patients",
        topicKey,
        topicTags: ["fixture"],
        evidenceCount: 1,
        coherenceScore: "1.000",
        status: "active",
      })
      .returning({ id: needClusters.id });

    if (!cluster) {
      throw new Error("Failed to create fixture need_cluster.");
    }

    await db.insert(evidenceClusters).values({
      evidenceId: evidence.id,
      needClusterId: cluster.id,
      distance: "0",
      primaryEvidence: true,
    });

    const result = await runScoreOpportunitiesPipeline({
      runId,
      triggeredBy: "manual",
      manualOverride: true,
      needClusterIds: [cluster.id],
      resetExisting: false,
    });

    const cards = await db
      .select({
        id: opportunityCards.id,
        gateState: opportunityCards.gateState,
        launchabilityScore: opportunityCards.launchabilityScore,
        blacklistTags: opportunityCards.blacklistTags,
        reasonCodes: opportunityCards.reasonCodes,
        needClusterId: opportunityCards.needClusterId,
      })
      .from(opportunityCards)
      .where(eq(opportunityCards.needClusterId, cluster.id));

    const [realCardsAfter] = await db
      .select({ count: count() })
      .from(opportunityCards)
      .where(ne(opportunityCards.topicKey, topicKey));
    const [aiLogsAfter] = await db
      .select({ count: count() })
      .from(aiUsageLogs)
      .where(eq(aiUsageLogs.runId, runId));

    const card = cards[0];
    const failures: string[] = [];

    if ((realCardsBefore?.count ?? 0) !== (realCardsAfter?.count ?? 0)) {
      failures.push("real opportunity_cards count changed");
    }
    if (result.created !== 1) failures.push(`expected created=1, got ${result.created}`);
    if (result.costUsd !== 0) failures.push(`expected costUsd=0, got ${result.costUsd}`);
    if ((aiLogsBefore?.count ?? 0) !== (aiLogsAfter?.count ?? 0)) {
      failures.push("ai_usage_logs incremented for blacklist fixture");
    }
    if (cards.length !== 1) failures.push(`expected one fixture opportunity_card, got ${cards.length}`);
    if (card?.gateState !== "rejected") {
      failures.push(`expected gate_state=rejected, got ${card?.gateState ?? "none"}`);
    }
    if (Number(card?.launchabilityScore ?? 1) > 0.05) {
      failures.push(`expected launchability_score<=0.05, got ${card?.launchabilityScore}`);
    }
    if (!card?.blacklistTags?.includes(BLACKLIST_TAG)) {
      failures.push(`expected blacklist_tags to include ${BLACKLIST_TAG}`);
    }
    if ((card?.reasonCodes ?? []).length === 0) {
      failures.push("expected reason_codes to be filled");
    }
    if (card?.gateState === "opportunity_candidate") {
      failures.push("fixture became opportunity_candidate");
    }
    if (!evidence.blacklistTags?.includes(BLACKLIST_TAG)) {
      failures.push("fixture evidence did not persist blacklist_tags");
    }

    console.log(
      JSON.stringify(
        {
          topicKey,
          evidenceBlacklistTags: evidence.blacklistTags,
          processedNeedClusterIds: [cluster.id],
          resetExisting: false,
          realOpportunityCardsBefore: realCardsBefore?.count ?? 0,
          realOpportunityCardsAfter: realCardsAfter?.count ?? 0,
          result,
          aiUsageLogsBefore: aiLogsBefore?.count ?? 0,
          aiUsageLogsAfter: aiLogsAfter?.count ?? 0,
          observed: card,
          status: failures.length === 0 ? "ok" : "failed",
          failures,
        },
        null,
        2,
      ),
    );

    if (failures.length > 0) {
      process.exitCode = 1;
    }
  } finally {
    await cleanupFixture(topicKey);
    const [remainingCards] = await db
      .select({ count: count() })
      .from(opportunityCards)
      .where(eq(opportunityCards.topicKey, topicKey));
    const [remainingClusters] = await db
      .select({ count: count() })
      .from(needClusters)
      .where(eq(needClusters.topicKey, topicKey));
    const [remainingEvidences] = await db
      .select({ count: count() })
      .from(evidences)
      .where(eq(evidences.topicKey, topicKey));

    cleanupOk =
      (remainingCards?.count ?? 0) === 0 &&
      (remainingClusters?.count ?? 0) === 0 &&
      (remainingEvidences?.count ?? 0) === 0;

    console.log(
      JSON.stringify(
        {
          cleanup: cleanupOk ? "ok" : "failed",
          remainingFixtureRows: {
            opportunityCards: remainingCards?.count ?? 0,
            needClusters: remainingClusters?.count ?? 0,
            evidences: remainingEvidences?.count ?? 0,
          },
        },
        null,
        2,
      ),
    );
  }

  if (!cleanupOk) {
    process.exitCode = 1;
  }
}

main()
  .then(() => {
    process.exit(process.exitCode ?? 0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
