# Google Trends source adapter (F4B)

> Status: BigQuery-first adapter implemented and validated in dev.
> Package: `@google-cloud/bigquery`.
> Collector: discovery Top/Rising implemented.
> Runtime provider: BigQuery public dataset.

This folder is reserved for the F4B Google Trends adapter. The adapter must produce source-agnostic `evidences` with:

- `source_key='gtrends'`
- `evidence_type='search_momentum'`
- `metrics_json` containing Trends metrics such as `score`, `rank`, `refresh_date`, `week`, `country_code`, and `region_name` when available
- `metadata_json` containing trigger metadata such as `trigger='cron' | 'watch_topic' | 'manual'`

The motor remains source-agnostic. Google Trends is a source adapter; cron, watch topics, and manual analysis are only triggers/seeds.

## Approved direction

The preferred F4B path is the official Google Trends public dataset in BigQuery:

- `bigquery-public-data.google_trends.top_terms`
- `bigquery-public-data.google_trends.top_rising_terms`
- `bigquery-public-data.google_trends.international_top_terms`
- `bigquery-public-data.google_trends.international_top_rising_terms`

This path is preferred because it uses an official Google Cloud surface and avoids scraping, browser automation, unofficial web endpoints, or unmaintained libraries.

No paid third-party provider, direct Google Trends web fetch, headless browser, or unofficial library is approved in this README.

## What BigQuery covers

BigQuery covers discovery-oriented Google Trends data:

- Top 25 overall queries.
- Top 25 rising queries.
- Daily partitions keyed by `refresh_date`.
- US data segmented by DMA.
- International data segmented by country and, where available, region/sub-region.
- Historical context exposed by the dataset according to Google's public dataset documentation.

This is useful for F4B discovery:

- Cron discovery can collect current top/rising queries for configured countries/regions.
- Watch topic monitoring can compare active `watch_topics` against terms surfaced in top/rising partitions.
- The motor can receive `search_momentum` evidence when a `gtrends` term maps to the same `topic_key` as an HN/manual/watch seed.

## What BigQuery does not cover

BigQuery public Trends data is not equivalent to Google Trends Explore.

Important limitations:

- It is limited to Top 25 / Top Rising query sets.
- It does not provide complete arbitrary keyword lookup for any topic at any time.
- A watch topic or manual input may not appear in the Top/Rising dataset even if there is real demand.
- Absence from this dataset is not evidence of absence of demand.
- Region and country coverage depends on Google's public dataset availability.
- Query results should be constrained by `refresh_date`, country, and region whenever possible to control cost and avoid scanning unnecessary partitions.

Because of those limits, F4B must not reject or downgrade an opportunity solely because BigQuery Trends has no matching term.

## Planned adapter shape

The adapter should be reusable by different triggers without creating a global source framework:

```ts
collectGTrendsDiscovery(...)
collectGTrendsWatchTopics(...)
lookupTopicMomentum(...)
normalizeGTrendsEvidence(...)
```

Expected behavior:

- `collectGTrendsDiscovery(...)`: enabled after README approval and implementation approval. Reads Top/Rising partitions and returns candidate `search_momentum` payloads.
- `collectGTrendsWatchTopics(...)`: enabled after implementation approval. Uses active `watch_topics` as seeds and records `gtrends` evidence only when the BigQuery Top/Rising dataset contains matching external search momentum.
- `lookupTopicMomentum(...)`: planned architecture hook only. It must remain disabled/stubbed with an explicit "unsupported_by_bigquery_public_dataset" result until the operator approves a provider that supports arbitrary topic lookup.
- `normalizeGTrendsEvidence(...)`: converts approved source payloads into rows for `evidences`.

Manual on-demand enrichment can call the same adapter only when an approved provider supports the required lookup mode. With BigQuery public dataset alone, manual lookup is limited to matching against Top/Rising rows and must be documented as partial.

## Compliance rules

Allowed:

- BigQuery public dataset queries through official Google Cloud APIs/SDKs.
- Read-only queries over public dataset tables.
- Low-volume queries with partition filters and country/region filters.
- Dry-run bytes estimation before running broader queries when possible.

Forbidden unless separately approved:

- Scraping Google Trends pages.
- Headless/browser automation for Google Trends.
- Direct fetches to undocumented Google Trends web endpoints.
- Unofficial packages such as `google-trends-api`.
- Paid providers such as SerpAPI or similar services.
- Persisting unnecessary personal data.

Operational rules:

- Do not store Google credentials in source code.
- Do not edit `.env*` in this phase without explicit approval.
- Use server-only credentials/configuration.
- Keep source URLs/refs traceable when the dataset provides stable references; otherwise store a dataset/table reference in `source_ref`/`metadata_json`.
- Manual inputs and watch topics remain seeds and never count as external sources for `source_confidence`.

## Cost model

BigQuery on-demand pricing charges by bytes processed. Google's documented public pricing includes a monthly free tier for query processing, but the actual cost depends on the operator's Google Cloud billing account and total usage across projects.

F4B must keep cost low by default:

- Query only required columns.
- Always filter by `refresh_date`.
- Filter by `country_code` and `region_name` where applicable.
- Use low caps for discovery rows.
- Prefer dry-run bytes estimates before broad queries.
- Consider `maximumBytesBilled` in the implementation.
- Log or expose estimated bytes/cost in the run summary when possible.

Expected dev cost for the approved F4B shape should be near zero under the free tier when using narrow partitioned queries, but this must not be hardcoded or treated as guaranteed.

AI cost for Trends collection should be zero. Any downstream motor scoring that calls existing F4A AI paths must continue to use `assertBudget()` and `ai_usage_logs`.

## Environment/config needed later

No environment file is changed by this README.

Likely server-only configuration for implementation:

- `GOOGLE_CLOUD_PROJECT`
- Google Cloud credentials via Application Default Credentials or an approved server-only service account mechanism
- optional default country, e.g. `GTRENDS_DEFAULT_COUNTRY_CODE=BR`
- optional default region, e.g. `GTRENDS_DEFAULT_REGION_NAME`
- optional query cap, e.g. `GTRENDS_MAX_ROWS`
- optional BigQuery safety cap, e.g. `GTRENDS_MAX_BYTES_BILLED`

Any `.env.example` change requires separate approval.

## Evidence mapping

The normalizer should create `search_momentum` evidence only from external Trends data:

- `source_key`: `gtrends`
- `evidence_type`: `search_momentum`
- `topic_key`: generated from the Trends term or matched to an existing watch/manual/HN topic key
- `topic_label`: human-readable Trends term
- `observed_at`: derived from `refresh_date`/`week` where available
- `market`: `BR`, `US`, `global`, or the configured market representation used by GoMVP
- `language`: `pt`, `en`, or `other` if unknown
- `summary`: concise description of the search momentum
- `pain_text`: `null` by default, because search momentum is not pain evidence
- `strength`: derived from score/rank/rising status
- `confidence`: parser/source confidence for the BigQuery row
- `metrics_json`: raw score/rank/date/geo fields
- `metadata_json`: dataset/table name, trigger, match mode, and limitations

Search momentum can raise `trend_score` and participate in external source diversity. It must not create pain by itself.

## Gate implications

Expected F4B behavior:

- A topic with `hn` pain evidence plus matching `gtrends` search momentum can reach external source count 2 and `source_confidence=0.65`.
- A topic with only `gtrends` search momentum and no pain should remain `trend_only` when trend is strong enough.
- A topic with pain but no Trends match can remain `pain_candidate` or another lower gate based on existing motor rules.
- Watch/manual seeds alone never raise external source confidence.

## Current implementation status

- README: present and updated after validation.
- Package install: `@google-cloud/bigquery` installed.
- Collector: implemented in `collector.ts` for BigQuery public dataset discovery/top/rising.
- Normalizer: implemented in `normalizer.ts`.
- Cron route: implemented at `/api/cron/collect-trends`, protected by `CRON_SECRET`.
- Local normalizer test: implemented as `npm run test:gtrends-normalizer`.
- BigQuery validation in dev: completed with narrow Top/Rising BR collection.
- Persisted dev evidences: 6 rows with `source_key='gtrends'` and `evidence_type='search_momentum'`.
- Motor validation: `runTrendEngine()` recognized GT evidences and produced `trend_candidates`.
- Cross-source overlap: no overlap found between current `gtrends.topic_key` values and current HN/`need_clusters` topic keys.
- Source confidence: did not increase in validation because no GT + HN/need-cluster topic match exists in current data.
- Arbitrary lookup: still unsupported; `lookupGTrendsTopic(...)` returns `unsupported_by_bigquery_public_dataset`.
- Operational cron: not activated in `vercel.json`.
- `vercel.json`: unchanged.
- UI: not specialized for Google Trends; evidence auditability may be shown through generic evidence-layer pages/components.
- Paid provider: not added.
- Scraping/direct fetch/unofficial library: not used.

Next step after operator approval: decide whether to keep improving generic evidence-layer auditability, add controlled Top/Rising matching against existing watch topics, or proceed toward final F4B handback once required gates are demonstrable. Do not activate operational cron until explicitly approved.
