import { and, eq, gt, ilike, or, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { rawItems, sources } from "@/db/schema";
import { listActiveBlacklistTerms, computeBlacklistTags } from "@/pipeline/blacklist";
import { computeHashes } from "@/pipeline/dedupe";
import { applyDeterministicFilter } from "@/pipeline/filter";
import { normalizeAlgoliaHit, type AlgoliaHnHit, type AlgoliaHnTag } from "@/pipeline/normalize";

const ALGOLIA_HN_URL = "https://hn.algolia.com/api/v1/search";
const DEFAULT_DAILY_CAP = 500;
const HITS_PER_PAGE = 100;
const PROCESS_BATCH_SIZE = 200;
const DEFAULT_TAGS: AlgoliaHnTag[] = ["story", "ask_hn", "show_hn"];

type SourceConfig = {
  daily_cap?: number;
  tags?: AlgoliaHnTag[];
};

type FetchResponse = {
  hits: AlgoliaHnHit[];
  nbPages: number;
};

export type CollectHnStats = {
  fetched: number;
  processed: number;
  deferred: number;
  inserted: number;
  candidates: number;
  filteredOut: number;
  blacklisted: number;
};

function toInt(input: unknown, fallback: number): number {
  const n = typeof input === "number" ? input : Number(input);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function toSourceConfig(input: unknown): SourceConfig {
  if (!input || typeof input !== "object") return {};
  const cfg = input as Record<string, unknown>;
  const tags = Array.isArray(cfg.tags)
    ? cfg.tags.filter((x): x is AlgoliaHnTag => x === "story" || x === "ask_hn" || x === "show_hn")
    : undefined;
  return { daily_cap: toInt(cfg.daily_cap, DEFAULT_DAILY_CAP), tags };
}

async function fetchWithRetry(url: URL, maxAttempts = 3): Promise<FetchResponse> {
  let attempt = 0;
  let delayMs = 500;

  while (attempt < maxAttempts) {
    attempt += 1;
    const response = await fetch(url, { method: "GET" });

    if (response.ok) {
      return (await response.json()) as FetchResponse;
    }

    const retryable = response.status === 429 || response.status >= 500;
    if (!retryable || attempt >= maxAttempts) {
      throw new Error(`Algolia HN request failed: status=${response.status} url=${url.toString()}`);
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs));
    delayMs *= 2;
  }

  throw new Error("Unexpected fetch retry flow.");
}

async function fetchTagWindow(tag: AlgoliaHnTag, fromUnix: number, cap: number): Promise<AlgoliaHnHit[]> {
  let page = 0;
  const hits: AlgoliaHnHit[] = [];

  while (hits.length < cap) {
    const url = new URL(ALGOLIA_HN_URL);
    url.searchParams.set("tags", tag);
    url.searchParams.set("numericFilters", `created_at_i>${fromUnix}`);
    url.searchParams.set("page", String(page));
    url.searchParams.set("hitsPerPage", String(HITS_PER_PAGE));

    const data = await fetchWithRetry(url, 3);
    if (!data.hits.length) break;
    hits.push(...data.hits);

    page += 1;
    if (page >= data.nbPages) break;
  }

  return hits.slice(0, cap);
}

export async function collectAlgoliaHn(params: { lookbackHours?: number } = {}): Promise<CollectHnStats> {
  const db = getDb();
  const lookbackHours = toInt(params.lookbackHours, 96);
  const fromUnix = Math.floor(Date.now() / 1000) - lookbackHours * 3600;

  const [source] = await db
    .select({
      id: sources.id,
      configJson: sources.configJson,
    })
    .from(sources)
    .where(and(eq(sources.active, true), ilike(sources.kind, "algolia-hn")))
    .limit(1);

  if (!source) {
    throw new Error("No active source configured for kind=algolia-hn.");
  }

  const config = toSourceConfig(source.configJson);
  const dailyCap = toInt(config.daily_cap, DEFAULT_DAILY_CAP);
  const tags = config.tags?.length ? config.tags : DEFAULT_TAGS;

  const allHits: Array<{ hit: AlgoliaHnHit; tag: AlgoliaHnTag }> = [];
  for (const tag of tags) {
    const tagHits = await fetchTagWindow(tag, fromUnix, dailyCap);
    allHits.push(...tagHits.map((hit) => ({ hit, tag })));
    if (allHits.length >= dailyCap) break;
  }

  const activeBlacklist = await listActiveBlacklistTerms(db);

  const entriesToProcess = allHits.slice(0, Math.min(PROCESS_BATCH_SIZE, dailyCap));
  const preparedRows: Array<typeof rawItems.$inferInsert> = [];

  for (const entry of entriesToProcess) {
    const normalized = normalizeAlgoliaHit(entry.hit, entry.tag);
    if (!normalized) continue;

    const { canonicalUrl, hashUrl, hashTextNorm } = computeHashes(
      normalized.url,
      normalized.payload.combinedText,
    );
    const filter = applyDeterministicFilter(normalized.payload.combinedText);
    const tagsFound = computeBlacklistTags(normalized.payload.combinedText, filter.language, activeBlacklist);

    preparedRows.push({
      sourceId: source.id,
      sourceExternalId: normalized.sourceExternalId,
      url: canonicalUrl,
      rawPayload: normalized.payload,
      fetchedAt: normalized.fetchedAt,
      hashUrl,
      hashTextNorm,
      language: filter.language,
      isFilteredOut: filter.isFilteredOut,
      filterReason: filter.reason,
      blacklistTags: tagsFound,
    });
  }

  if (preparedRows.length === 0) {
    return {
      fetched: allHits.length,
      processed: entriesToProcess.length,
      deferred: Math.max(0, allHits.length - entriesToProcess.length),
      inserted: 0,
      candidates: 0,
      filteredOut: 0,
      blacklisted: 0,
    };
  }

  const insertedRows = await db
    .insert(rawItems)
    .values(preparedRows)
    .onConflictDoNothing({ target: rawItems.hashUrl })
    .returning({
      isCandidate: rawItems.isCandidate,
      isFilteredOut: rawItems.isFilteredOut,
      blacklistTags: rawItems.blacklistTags,
    });

  const inserted = insertedRows.length;
  const candidates = insertedRows.filter((row) => row.isCandidate).length;
  const filteredOut = insertedRows.filter((row) => row.isFilteredOut).length;
  const blacklisted = insertedRows.filter((row) => row.blacklistTags.length > 0).length;

  return {
    fetched: allHits.length,
    processed: entriesToProcess.length,
    deferred: Math.max(0, allHits.length - entriesToProcess.length),
    inserted,
    candidates,
    filteredOut,
    blacklisted,
  };
}

export async function getColetaOverview(search?: string) {
  const db = getDb();
  const searchClause = search
    ? or(
        ilike(sql<string>`(${rawItems.rawPayload} ->> 'title')`, `%${search}%`),
        ilike(rawItems.url, `%${search}%`),
      )
    : undefined;

  const whereClause = searchClause ? and(gt(rawItems.fetchedAt, new Date(0)), searchClause) : undefined;
  return db
    .select({
      id: rawItems.id,
      language: rawItems.language,
      isCandidate: rawItems.isCandidate,
      isFilteredOut: rawItems.isFilteredOut,
      filterReason: rawItems.filterReason,
      blacklistTags: rawItems.blacklistTags,
      url: rawItems.url,
      fetchedAt: rawItems.fetchedAt,
      sourceName: sources.name,
      title: sql<string>`coalesce(${rawItems.rawPayload} ->> 'title', '')`,
    })
    .from(rawItems)
    .innerJoin(sources, eq(rawItems.sourceId, sources.id))
    .where(whereClause)
    .orderBy(sql`${rawItems.fetchedAt} DESC`);
}
