import assert from "node:assert/strict";
import { lookupGTrendsTopic } from "@/sources/gtrends/collector";
import {
  buildGTrendsSourceItemId,
  deriveGTrendsStrength,
  normalizeGTrendsEvidence,
} from "@/sources/gtrends/normalizer";
import type { GTrendsTermPayload } from "@/sources/gtrends/types";

const payload: GTrendsTermPayload = {
  provider: "bigquery_public_dataset",
  sourceKey: "gtrends",
  evidenceType: "search_momentum",
  projectId: "bigquery-public-data",
  datasetId: "google_trends",
  tableId: "international_top_rising_terms",
  tableRef: "bigquery-public-data.google_trends.international_top_rising_terms",
  trigger: "cron",
  matchMode: "discovery_rising",
  term: "pdf editor online",
  rank: 3,
  score: 82,
  refreshDate: "2026-05-28",
  week: "2026-05-24",
  countryCode: "BR",
  countryName: "Brazil",
  regionName: "Sao Paulo",
  dmaId: null,
  dmaName: null,
  isRising: true,
  raw: { term: "pdf editor online", rank: 3, score: 82 },
};

const evidence = normalizeGTrendsEvidence(payload);
const metrics = evidence.metricsJson as Record<string, unknown>;
const metadata = evidence.metadataJson as Record<string, unknown>;

assert.equal(evidence.sourceKey, "gtrends");
assert.equal(evidence.evidenceType, "search_momentum");
assert.equal(evidence.painText, null);
assert.equal(evidence.audienceHint, null);
assert.equal(evidence.topicKey, "pdf-editor-online");
assert.equal(evidence.sourceItemId, buildGTrendsSourceItemId(payload));
assert.equal(metrics["rank"], 3);
assert.equal(metrics["score"], 82);
assert.equal(metadata["trigger"], "cron");
assert.equal(metadata["table_id"], "international_top_rising_terms");
assert.ok(Number(evidence.strength) > 0.8);

const sameEvidence = normalizeGTrendsEvidence(payload);
assert.equal(sameEvidence.sourceItemId, evidence.sourceItemId);

const topPayload = { ...payload, tableId: "international_top_terms" as const, isRising: false };
assert.ok(deriveGTrendsStrength(payload) > deriveGTrendsStrength(topPayload));

const lookup = lookupGTrendsTopic("pdf editor online", "manual");
assert.equal(lookup.status, "unsupported_by_bigquery_public_dataset");
assert.equal(lookup.trigger, "manual");

console.log(
  JSON.stringify(
    {
      status: "ok",
      sourceItemId: evidence.sourceItemId,
      topicKey: evidence.topicKey,
      lookupStatus: lookup.status,
    },
    null,
    2,
  ),
);
