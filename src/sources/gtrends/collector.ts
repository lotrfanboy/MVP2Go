import { BigQuery } from "@google-cloud/bigquery";
import { z } from "zod";
import type {
  GTrendsDiscoveryOptions,
  GTrendsDiscoveryResult,
  GTrendsLookupResult,
  GTrendsTableConfig,
  GTrendsTableId,
  GTrendsTableRunSummary,
  GTrendsTermPayload,
  GTrendsTrigger,
} from "@/sources/gtrends/types";
import { GTRENDS_TABLES } from "@/sources/gtrends/types";

const BYTES_PER_TIB = 1024 ** 4;
const BIGQUERY_USD_PER_TIB = 6.25;
const DEFAULT_MAX_ROWS = 25;
const DEFAULT_MAX_BYTES_BILLED = "25000000";

const QueryRowSchema = z.object({
  term: z.unknown(),
  rank: z.unknown().optional(),
  score: z.unknown().optional(),
  refresh_date: z.unknown().optional(),
  week: z.unknown().optional(),
  country_code: z.unknown().optional(),
  country_name: z.unknown().optional(),
  region_name: z.unknown().optional(),
  dma_id: z.unknown().optional(),
  dma_name: z.unknown().optional(),
});

type JobWithMetadata = {
  metadata?: {
    statistics?: {
      query?: {
        totalBytesProcessed?: string | number;
        totalBytesBilled?: string | number;
      };
    };
  };
};

function safeErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/Bearer\s+[A-Za-z0-9._-]+/g, "Bearer [redacted]").slice(0, 500);
}

function envFlag(name: string): boolean {
  return process.env[name] === "true" || process.env[name] === "1";
}

function optionalEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

function yesterdayUtcDateString(): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

function coerceString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "bigint") return String(value);
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "object" && "value" in value) {
    return coerceString((value as { value?: unknown }).value);
  }
  return String(value);
}

function coerceNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (typeof value === "object" && "value" in value) {
    return coerceNumber((value as { value?: unknown }).value);
  }
  return null;
}

function bytesToCostUsd(bytes: string | null): number | null {
  if (!bytes) return null;
  const value = Number(bytes);
  if (!Number.isFinite(value)) return null;
  return (value / BYTES_PER_TIB) * BIGQUERY_USD_PER_TIB;
}

function addByteStrings(a: string | null, b: string | null): string | null {
  if (!a) return b;
  if (!b) return a;
  return String(BigInt(a) + BigInt(b));
}

function isGreaterThanBytesLimit(estimatedBytes: string | null, maximumBytesBilled: string): boolean {
  if (!estimatedBytes) return false;
  try {
    return BigInt(estimatedBytes) > BigInt(maximumBytesBilled);
  } catch {
    return false;
  }
}

function buildQuery(config: GTrendsTableConfig, opts: RequiredQueryOptions): string {
  const tableRef = `${config.projectId}.${config.datasetId}.${config.tableId}`;
  const limit = Math.max(1, Math.min(opts.maxRows, 200));

  if (config.isInternational) {
    return `
SELECT
  DISTINCT term,
  rank,
  score
FROM \`${tableRef}\`
WHERE refresh_date = @refreshDate
  AND country_code = @countryCode
  ${opts.regionName ? "AND region_name = @regionName" : ""}
LIMIT ${limit}
`;
  }

  return `
SELECT
  DISTINCT term,
  rank,
  score
FROM \`${tableRef}\`
WHERE refresh_date = @refreshDate
  ${opts.regionName ? "AND dma_name = @regionName" : ""}
LIMIT ${limit}
`;
}

type RequiredQueryOptions = {
  countryCode: string;
  regionName: string | null;
  refreshDate: string;
  maxRows: number;
};

function toPayload(
  row: unknown,
  config: GTrendsTableConfig,
  trigger: GTrendsTrigger,
  queryOptions: RequiredQueryOptions,
): GTrendsTermPayload | null {
  const parsed = QueryRowSchema.safeParse(row);
  if (!parsed.success) return null;

  const term = coerceString(parsed.data.term);
  const refreshDate = coerceString(parsed.data.refresh_date) ?? queryOptions.refreshDate;
  if (!term || !refreshDate) return null;

  const tableRef = `${config.projectId}.${config.datasetId}.${config.tableId}`;

  return {
    provider: "bigquery_public_dataset",
    sourceKey: "gtrends",
    evidenceType: "search_momentum",
    projectId: config.projectId,
    datasetId: config.datasetId,
    tableId: config.tableId,
    tableRef,
    trigger,
    matchMode: config.matchMode,
    term,
    rank: coerceNumber(parsed.data.rank),
    score: coerceNumber(parsed.data.score),
    refreshDate,
    week: coerceString(parsed.data.week),
    countryCode: coerceString(parsed.data.country_code) ?? (config.isInternational ? queryOptions.countryCode : null),
    countryName: coerceString(parsed.data.country_name),
    regionName: coerceString(parsed.data.region_name) ?? (config.isInternational ? queryOptions.regionName : null),
    dmaId: coerceString(parsed.data.dma_id),
    dmaName: coerceString(parsed.data.dma_name) ?? (!config.isInternational ? queryOptions.regionName : null),
    isRising: config.isRising,
    raw: parsed.data,
  };
}

async function dryRunQuery(
  client: BigQuery,
  query: string,
  params: Record<string, string>,
  maximumBytesBilled: string,
): Promise<string | null> {
  const [job] = await client.createQueryJob({
    query,
    params,
    useLegacySql: false,
    dryRun: true,
    maximumBytesBilled,
  });
  const meta = job as JobWithMetadata;
  const queryStats = meta.metadata?.statistics?.query;
  const bytes = queryStats?.totalBytesProcessed ?? queryStats?.totalBytesBilled ?? null;
  return bytes === null ? null : String(bytes);
}

async function collectTable(opts: {
  client: BigQuery;
  tableId: GTrendsTableId;
  queryOptions: RequiredQueryOptions;
  maximumBytesBilled: string;
  dryRunOnly: boolean;
  trigger: GTrendsTrigger;
}): Promise<{ summary: GTrendsTableRunSummary; payloads: GTrendsTermPayload[] }> {
  const config = GTRENDS_TABLES[opts.tableId];
  const query = buildQuery(config, opts.queryOptions);
  const params: Record<string, string> = {
    refreshDate: opts.queryOptions.refreshDate,
    countryCode: opts.queryOptions.countryCode,
  };
  if (opts.queryOptions.regionName) {
    params.regionName = opts.queryOptions.regionName;
  }

  try {
    const estimatedBytes = await dryRunQuery(
      opts.client,
      query,
      params,
      opts.maximumBytesBilled,
    );

    if (isGreaterThanBytesLimit(estimatedBytes, opts.maximumBytesBilled)) {
      return {
        summary: {
          tableId: opts.tableId,
          status: "skipped",
          fetched: 0,
          estimatedBytes,
          estimatedCostUsd: bytesToCostUsd(estimatedBytes),
          error: "estimated_bytes_exceeds_maximum_bytes_billed",
        },
        payloads: [],
      };
    }

    if (opts.dryRunOnly) {
      return {
        summary: {
          tableId: opts.tableId,
          status: "dry_run",
          fetched: 0,
          estimatedBytes,
          estimatedCostUsd: bytesToCostUsd(estimatedBytes),
          error: null,
        },
        payloads: [],
      };
    }

    const [rows] = await opts.client.query({
      query,
      params,
      useLegacySql: false,
      maximumBytesBilled: opts.maximumBytesBilled,
    });
    const payloads = (rows as unknown[])
      .map((row) => toPayload(row, config, opts.trigger, opts.queryOptions))
      .filter((payload): payload is GTrendsTermPayload => Boolean(payload));

    return {
      summary: {
        tableId: opts.tableId,
        status: "ok",
        fetched: payloads.length,
        estimatedBytes,
        estimatedCostUsd: bytesToCostUsd(estimatedBytes),
        error: null,
      },
      payloads,
    };
  } catch (error: unknown) {
    return {
      summary: {
        tableId: opts.tableId,
        status: "error",
        fetched: 0,
        estimatedBytes: null,
        estimatedCostUsd: null,
        error: safeErrorMessage(error),
      },
      payloads: [],
    };
  }
}

export function lookupGTrendsTopic(topic: string, trigger: GTrendsTrigger): GTrendsLookupResult {
  return {
    status: "unsupported_by_bigquery_public_dataset",
    topic,
    trigger,
    reason:
      "The approved BigQuery public dataset supports Top 25 / Top Rising discovery, not complete arbitrary keyword lookup.",
  };
}

export async function collectGTrendsDiscovery(
  options: GTrendsDiscoveryOptions = {},
): Promise<GTrendsDiscoveryResult> {
  const enabled = options.enabled ?? envFlag("GTRENDS_ENABLED");
  if (!enabled) {
    return {
      status: "disabled",
      payloads: [],
      fetched: 0,
      estimatedBytes: null,
      estimatedCostUsd: null,
      tables: [],
      errors: ["gtrends_disabled"],
    };
  }

  const billingProjectId =
    options.billingProjectId ??
    optionalEnv("GOOGLE_CLOUD_PROJECT") ??
    optionalEnv("GCLOUD_PROJECT") ??
    optionalEnv("GOOGLE_CLOUD_QUOTA_PROJECT");

  if (!billingProjectId) {
    return {
      status: "missing_config",
      payloads: [],
      fetched: 0,
      estimatedBytes: null,
      estimatedCostUsd: null,
      tables: [],
      errors: ["missing_google_cloud_project"],
    };
  }

  const queryOptions: RequiredQueryOptions = {
    countryCode: options.countryCode ?? optionalEnv("GTRENDS_DEFAULT_COUNTRY_CODE") ?? "BR",
    regionName: options.regionName ?? optionalEnv("GTRENDS_DEFAULT_REGION_NAME") ?? null,
    refreshDate: options.refreshDate ?? optionalEnv("GTRENDS_REFRESH_DATE") ?? yesterdayUtcDateString(),
    maxRows: options.maxRows ?? parsePositiveInt(optionalEnv("GTRENDS_MAX_ROWS"), DEFAULT_MAX_ROWS),
  };
  const maximumBytesBilled =
    options.maximumBytesBilled ?? optionalEnv("GTRENDS_MAX_BYTES_BILLED") ?? DEFAULT_MAX_BYTES_BILLED;
  const dryRunOnly = options.dryRunOnly ?? false;
  const trigger = options.trigger ?? "cron";
  const tableIds =
    options.tables ??
    (["international_top_rising_terms", "international_top_terms"] satisfies GTrendsTableId[]);

  const client = new BigQuery({ projectId: billingProjectId });
  const tables: GTrendsTableRunSummary[] = [];
  let payloads: GTrendsTermPayload[] = [];
  let estimatedBytes: string | null = null;

  for (const tableId of tableIds) {
    const out = await collectTable({
      client,
      tableId,
      queryOptions,
      maximumBytesBilled,
      dryRunOnly,
      trigger,
    });
    tables.push(out.summary);
    payloads = payloads.concat(out.payloads);
    estimatedBytes = addByteStrings(estimatedBytes, out.summary.estimatedBytes);
  }

  const errors = tables.flatMap((table) => (table.error ? [`${table.tableId}: ${table.error}`] : []));
  const hasOk = tables.some((table) => table.status === "ok" || table.status === "dry_run");
  const status = dryRunOnly ? "dry_run" : hasOk ? "ok" : errors.length > 0 ? "error" : "ok";

  return {
    status,
    payloads,
    fetched: payloads.length,
    estimatedBytes,
    estimatedCostUsd: bytesToCostUsd(estimatedBytes),
    tables,
    errors,
  };
}
