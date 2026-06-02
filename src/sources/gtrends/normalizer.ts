import { toTopicKey } from "@/lib/topic-key";
import { clamp01 } from "@/motor/f4-weights";
import type {
  GTrendsNormalizedEvidence,
  GTrendsNormalizeOptions,
  GTrendsTermPayload,
} from "@/sources/gtrends/types";
import { GTRENDS_EVIDENCE_TYPE, GTRENDS_SOURCE_KEY } from "@/sources/gtrends/types";

function normalizeSourcePart(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "none";
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96) || "none";
}

export function buildGTrendsSourceItemId(payload: GTrendsTermPayload): string {
  return [
    GTRENDS_SOURCE_KEY,
    payload.tableId,
    payload.refreshDate,
    payload.week,
    payload.countryCode,
    payload.regionName ?? payload.dmaName,
    payload.term,
    payload.rank,
    GTRENDS_EVIDENCE_TYPE,
  ]
    .map(normalizeSourcePart)
    .join(":");
}

function scoreToNumber(score: number | null): number {
  if (score === null || Number.isNaN(score)) return 0;
  if (score > 1) return clamp01(score / 100);
  return clamp01(score);
}

export function deriveGTrendsStrength(payload: GTrendsTermPayload): number {
  const scoreComponent = scoreToNumber(payload.score);
  const rank = payload.rank ?? 25;
  const rankComponent = clamp01(1 - (Math.max(1, rank) - 1) / 25);
  const risingBoost = payload.isRising ? 0.12 : 0;
  return clamp01(Math.max(scoreComponent, rankComponent * 0.8) + risingBoost);
}

export function normalizeGTrendsEvidence(
  payload: GTrendsTermPayload,
  options: GTrendsNormalizeOptions = {},
): GTrendsNormalizedEvidence {
  const topicKey = options.canonicalTopicKey ?? toTopicKey(payload.term);
  const sourceItemId = buildGTrendsSourceItemId(payload);
  const geography =
    payload.countryCode ??
    payload.countryName ??
    payload.regionName ??
    payload.dmaName ??
    "global";

  return {
    sourceKey: GTRENDS_SOURCE_KEY,
    sourceItemId,
    sourceRef: payload.tableRef,
    evidenceType: GTRENDS_EVIDENCE_TYPE,
    topicKey,
    topicLabel: payload.term.slice(0, 200),
    observedAt: new Date(payload.refreshDate),
    language: "other",
    market: payload.countryCode ?? "global",
    summary: `Google Trends ${payload.isRising ? "rising" : "top"} query "${payload.term}" in ${geography}.`,
    painText: null,
    desireText: null,
    audienceHint: null,
    quoteExcerpt: null,
    strength: String(deriveGTrendsStrength(payload)),
    confidence: "0.900",
    axesJson: {
      trend: {
        source: GTRENDS_SOURCE_KEY,
        evidence_type: GTRENDS_EVIDENCE_TYPE,
        contributes_to_pain: false,
      },
    },
    metricsJson: {
      score: payload.score,
      rank: payload.rank,
      refresh_date: payload.refreshDate,
      week: payload.week,
      country_code: payload.countryCode,
      country_name: payload.countryName,
      region_name: payload.regionName,
      dma_id: payload.dmaId,
      dma_name: payload.dmaName,
      table: payload.tableId,
      match_mode: payload.matchMode,
    },
    metadataJson: {
      provider: payload.provider,
      project_id: payload.projectId,
      dataset_id: payload.datasetId,
      table_id: payload.tableId,
      table_ref: payload.tableRef,
      trigger: payload.trigger,
      limitations: [
        "bigquery_public_dataset_top_25_top_rising_only",
        "not_google_trends_explore",
        "no_arbitrary_keyword_lookup",
      ],
      raw: payload.raw,
    },
    rawItemId: null,
    signalId: null,
    manualInputId: options.manualInputId ?? null,
    watchTopicId: options.watchTopicId ?? null,
    embedding: null,
    blacklistTags: [],
  };
}
