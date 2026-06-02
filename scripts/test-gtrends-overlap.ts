import { desc, isNotNull } from "drizzle-orm";
import { getDb } from "@/db";
import { evidences, needClusters, opportunityCards, watchTopics } from "@/db/schema";

type EvidenceRow = {
  id: string;
  sourceKey: string;
  evidenceType: string;
  topicKey: string | null;
  topicLabel: string | null;
};

function increment(map: Map<string, number>, key: string): void {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function addToSetMap(map: Map<string, Set<string>>, key: string, value: string): void {
  const current = map.get(key) ?? new Set<string>();
  current.add(value);
  map.set(key, current);
}

function sortedIntersection(left: Set<string>, right: Set<string>): string[] {
  return [...left].filter((value) => right.has(value)).sort();
}

async function main(): Promise<void> {
  const db = getDb();

  const [evidenceRows, needClusterRows, watchTopicRows, opportunityRows] = await Promise.all([
    db
      .select({
        id: evidences.id,
        sourceKey: evidences.sourceKey,
        evidenceType: evidences.evidenceType,
        topicKey: evidences.topicKey,
        topicLabel: evidences.topicLabel,
      })
      .from(evidences)
      .where(isNotNull(evidences.topicKey)),
    db
      .select({
        topicKey: needClusters.topicKey,
        label: needClusters.label,
      })
      .from(needClusters)
      .where(isNotNull(needClusters.topicKey)),
    db
      .select({
        topicKey: watchTopics.topicKey,
        topicLabel: watchTopics.topicLabel,
        status: watchTopics.status,
      })
      .from(watchTopics),
    db
      .select({
        id: opportunityCards.id,
        topicKey: opportunityCards.topicKey,
        topicLabel: opportunityCards.topicLabel,
        sourceConfidence: opportunityCards.sourceConfidence,
        sourceCount: opportunityCards.sourceCount,
      })
      .from(opportunityCards)
      .orderBy(desc(opportunityCards.sourceConfidence))
      .limit(20),
  ]);

  const typedEvidenceRows: EvidenceRow[] = evidenceRows;
  const evidenceCounts = new Map<string, number>();
  const topicSources = new Map<string, Set<string>>();
  const sourceTopics = new Map<string, Set<string>>();

  for (const row of typedEvidenceRows) {
    if (!row.topicKey) continue;

    increment(evidenceCounts, `${row.sourceKey}:${row.evidenceType}`);
    addToSetMap(topicSources, row.topicKey, row.sourceKey);
    addToSetMap(sourceTopics, row.sourceKey, row.topicKey);
  }

  const gtrendsTopics = sourceTopics.get("gtrends") ?? new Set<string>();
  const hnTopics = sourceTopics.get("hn") ?? new Set<string>();
  const needClusterTopics = new Set(
    needClusterRows.flatMap((row) => (row.topicKey ? [row.topicKey] : [])),
  );
  const watchTopicsSet = new Set(watchTopicRows.map((row) => row.topicKey));
  const opportunityTopics = new Set(opportunityRows.flatMap((row) => (row.topicKey ? [row.topicKey] : [])));

  const multiSourceTopics = [...topicSources.entries()]
    .filter(([, sources]) => sources.size > 1)
    .map(([topicKey, sources]) => ({
      topicKey,
      sources: [...sources].sort(),
    }))
    .sort((a, b) => a.topicKey.localeCompare(b.topicKey));

  const gtrendsMultiSourceTopics = multiSourceTopics.filter((row) => row.sources.includes("gtrends"));
  const gtrendsHnOverlaps = sortedIntersection(gtrendsTopics, hnTopics);
  const gtrendsNeedClusterOverlaps = sortedIntersection(gtrendsTopics, needClusterTopics);
  const gtrendsWatchTopicOverlaps = sortedIntersection(gtrendsTopics, watchTopicsSet);
  const gtrendsOpportunityOverlaps = sortedIntersection(gtrendsTopics, opportunityTopics);

  const result = {
    status: "ok",
    readOnly: true,
    counts: {
      evidencesWithTopicKey: evidenceRows.length,
      bySourceType: Object.fromEntries([...evidenceCounts.entries()].sort()),
      gtrendsTopics: gtrendsTopics.size,
      hnTopics: hnTopics.size,
      needClusterTopics: needClusterTopics.size,
      watchTopics: watchTopicsSet.size,
      opportunitiesChecked: opportunityRows.length,
    },
    overlapFound: gtrendsMultiSourceTopics.length > 0 || gtrendsNeedClusterOverlaps.length > 0,
    sourceConfidenceCandidateFound: gtrendsMultiSourceTopics.length > 0,
    overlaps: {
      gtrendsMultiSourceTopics,
      gtrendsHnOverlaps,
      gtrendsNeedClusterOverlaps,
      gtrendsWatchTopicOverlaps,
      gtrendsOpportunityOverlaps,
    },
    topOpportunitiesBySourceConfidence: opportunityRows,
    notes: [
      "manual/watch topics are shown only as diagnostics and must not raise external source confidence",
      "sourceConfidenceCandidateFound=true requires gtrends plus another external source on the same topic_key",
      "no AI calls are made by this script",
    ],
  };

  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
