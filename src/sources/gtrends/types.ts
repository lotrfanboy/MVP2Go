import type { NewEvidence } from "@/db/schema";

export const GTRENDS_SOURCE_KEY = "gtrends";
export const GTRENDS_EVIDENCE_TYPE = "search_momentum";

export type GTrendsTableId =
  | "international_top_terms"
  | "international_top_rising_terms"
  | "top_terms"
  | "top_rising_terms";

export type GTrendsTrigger = "cron" | "watch_topic" | "manual";

export type GTrendsMatchMode =
  | "discovery_top"
  | "discovery_rising"
  | "watch_topic_top_rising_match"
  | "manual_top_rising_match";

export type GTrendsTableConfig = {
  projectId: "bigquery-public-data";
  datasetId: "google_trends";
  tableId: GTrendsTableId;
  isInternational: boolean;
  isRising: boolean;
  matchMode: GTrendsMatchMode;
};

export const GTRENDS_TABLES: Record<GTrendsTableId, GTrendsTableConfig> = {
  international_top_terms: {
    projectId: "bigquery-public-data",
    datasetId: "google_trends",
    tableId: "international_top_terms",
    isInternational: true,
    isRising: false,
    matchMode: "discovery_top",
  },
  international_top_rising_terms: {
    projectId: "bigquery-public-data",
    datasetId: "google_trends",
    tableId: "international_top_rising_terms",
    isInternational: true,
    isRising: true,
    matchMode: "discovery_rising",
  },
  top_terms: {
    projectId: "bigquery-public-data",
    datasetId: "google_trends",
    tableId: "top_terms",
    isInternational: false,
    isRising: false,
    matchMode: "discovery_top",
  },
  top_rising_terms: {
    projectId: "bigquery-public-data",
    datasetId: "google_trends",
    tableId: "top_rising_terms",
    isInternational: false,
    isRising: true,
    matchMode: "discovery_rising",
  },
};

export type GTrendsTermPayload = {
  provider: "bigquery_public_dataset";
  sourceKey: typeof GTRENDS_SOURCE_KEY;
  evidenceType: typeof GTRENDS_EVIDENCE_TYPE;
  projectId: "bigquery-public-data";
  datasetId: "google_trends";
  tableId: GTrendsTableId;
  tableRef: string;
  trigger: GTrendsTrigger;
  matchMode: GTrendsMatchMode;
  term: string;
  rank: number | null;
  score: number | null;
  refreshDate: string;
  week: string | null;
  countryCode: string | null;
  countryName: string | null;
  regionName: string | null;
  dmaId: string | null;
  dmaName: string | null;
  isRising: boolean;
  raw: Record<string, unknown>;
};

export type GTrendsLookupResult = {
  status: "unsupported_by_bigquery_public_dataset";
  topic: string;
  trigger: GTrendsTrigger;
  reason: string;
};

export type GTrendsDiscoveryOptions = {
  enabled?: boolean;
  billingProjectId?: string;
  countryCode?: string;
  regionName?: string;
  refreshDate?: string;
  maxRows?: number;
  maximumBytesBilled?: string;
  dryRunOnly?: boolean;
  tables?: GTrendsTableId[];
  trigger?: GTrendsTrigger;
};

export type GTrendsTableRunSummary = {
  tableId: GTrendsTableId;
  status: "ok" | "dry_run" | "skipped" | "error";
  fetched: number;
  estimatedBytes: string | null;
  estimatedCostUsd: number | null;
  error: string | null;
};

export type GTrendsDiscoveryResult = {
  status: "ok" | "disabled" | "missing_config" | "dry_run" | "error";
  payloads: GTrendsTermPayload[];
  fetched: number;
  estimatedBytes: string | null;
  estimatedCostUsd: number | null;
  tables: GTrendsTableRunSummary[];
  errors: string[];
};

export type GTrendsNormalizeOptions = {
  manualInputId?: string | null;
  watchTopicId?: string | null;
  canonicalTopicKey?: string | null;
};

export type GTrendsNormalizedEvidence = NewEvidence & {
  sourceKey: typeof GTRENDS_SOURCE_KEY;
  evidenceType: typeof GTRENDS_EVIDENCE_TYPE;
  sourceItemId: string;
};
