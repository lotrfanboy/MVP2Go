import { sql } from "drizzle-orm";
import {
  boolean,
  customType,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * `runs` — ledger de execuções de coleta/pipeline/cron/manual.
 *
 * PRD §17. Em F0 só nasce esta tabela (junto com `ai_usage_logs` e `cost_budgets`).
 * `kind` segue convenções como `collect_*`, `extract`, `cluster`, `idea_gen`, `score`.
 * `triggered_by`: 'cron' | 'manual'.
 */
export const runs = pgTable(
  "runs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kind: text("kind").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    status: text("status").notNull().default("running"),
    itemsIn: integer("items_in").notNull().default(0),
    itemsOut: integer("items_out").notNull().default(0),
    costUsd: numeric("cost_usd", { precision: 10, scale: 6 }).notNull().default("0"),
    error: text("error"),
    triggeredBy: text("triggered_by").notNull().default("manual"),
  },
  (t) => [index("runs_started_at_idx").on(sql`${t.startedAt} DESC`)],
);

/**
 * `ai_usage_logs` — uma linha por chamada de IA (mesmo cached/failed).
 *
 * PRD §17 + RNF "Toda chamada de IA passa por assertBudget() e grava em ai_usage_logs".
 * `prompt_version` salvo em cada chamada (PRD RF-16). Em F0 a tabela é criada
 * mas permanece vazia (nenhuma chamada IA real).
 */
export const aiUsageLogs = pgTable(
  "ai_usage_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    runId: uuid("run_id").references(() => runs.id, { onDelete: "set null" }),
    operation: text("operation").notNull(),
    source: text("source"),
    model: text("model").notNull(),
    tokensIn: integer("tokens_in").notNull().default(0),
    tokensOut: integer("tokens_out").notNull().default(0),
    embeddingCount: integer("embedding_count").notNull().default(0),
    estimatedCostUsd: numeric("estimated_cost_usd", { precision: 10, scale: 6 })
      .notNull()
      .default("0"),
    relatedEntityType: text("related_entity_type"),
    relatedEntityId: text("related_entity_id"),
    promptVersion: text("prompt_version"),
    status: text("status").notNull().default("ok"),
    latencyMs: integer("latency_ms"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("ai_usage_logs_created_at_idx").on(sql`${t.createdAt} DESC`),
    index("ai_usage_logs_operation_idx").on(t.operation),
  ],
);

/**
 * `cost_budgets` — uma linha por mês, com thresholds e gasto acumulado.
 *
 * PRD §17 + D-08: hard cap US$ 50/mês. Thresholds 0.80 / 0.90 / 1.00.
 * `period_month` é UNIQUE para permitir seed/upsert idempotente por mês.
 */
export const costBudgets = pgTable("cost_budgets", {
  id: uuid("id").primaryKey().defaultRandom(),
  periodMonth: date("period_month").notNull().unique(),
  monthlyBudgetUsd: numeric("monthly_budget_usd", { precision: 10, scale: 2 }).notNull(),
  warningThreshold: numeric("warning_threshold", { precision: 3, scale: 2 })
    .notNull()
    .default("0.80"),
  stopAutoThreshold: numeric("stop_auto_threshold", { precision: 3, scale: 2 })
    .notNull()
    .default("0.90"),
  hardStopThreshold: numeric("hard_stop_threshold", { precision: 3, scale: 2 })
    .notNull()
    .default("1.00"),
  currentSpendUsd: numeric("current_spend_usd", { precision: 10, scale: 6 })
    .notNull()
    .default("0"),
  status: text("status").notNull().default("active"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sources = pgTable(
  "sources",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    kind: text("kind").notNull(),
    configJson: jsonb("config_json").notNull().default(sql`'{}'::jsonb`),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("sources_kind_name_unique_idx").on(t.kind, t.name)],
);

export const rawItems = pgTable(
  "raw_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sourceId: uuid("source_id")
      .notNull()
      .references(() => sources.id, { onDelete: "restrict" }),
    sourceExternalId: text("source_external_id"),
    url: text("url").notNull(),
    rawPayload: jsonb("raw_payload").notNull(),
    fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
    hashUrl: text("hash_url").notNull(),
    hashTextNorm: text("hash_text_norm").notNull(),
    language: text("language").notNull().default("other"),
    isFilteredOut: boolean("is_filtered_out").notNull().default(false),
    filterReason: text("filter_reason"),
    blacklistTags: text("blacklist_tags").array().notNull().default(sql`'{}'::text[]`),
    isCandidate: boolean("is_candidate")
      .generatedAlwaysAs(sql`((NOT "is_filtered_out") AND cardinality("blacklist_tags") = 0)`)
      .notNull(),
  },
  (t) => [
    uniqueIndex("raw_items_hash_url_unique_idx").on(t.hashUrl),
    index("raw_items_hash_text_norm_idx").on(t.hashTextNorm),
    index("raw_items_blacklist_tags_gin_idx").using("gin", t.blacklistTags),
    index("raw_items_is_candidate_true_idx").on(t.isCandidate).where(sql`${t.isCandidate} = true`),
    index("raw_items_source_fetched_idx").on(t.sourceId, sql`${t.fetchedAt} DESC`),
  ],
);

export const blacklistTerms = pgTable(
  "blacklist_terms",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    term: text("term").notNull(),
    category: text("category").notNull(),
    scope: text("scope").notNull().default("all"),
    language: text("language").notNull().default("all"),
    matchKind: text("match_kind").notNull().default("keyword"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("blacklist_terms_active_idx").on(t.active), index("blacklist_terms_category_idx").on(t.category)],
);

const vector1536 = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return "vector(1536)";
  },
  toDriver(value) {
    return `[${value.join(",")}]`;
  },
  fromDriver(value) {
    return value
      .slice(1, -1)
      .split(",")
      .filter((item) => item.length > 0)
      .map((item) => Number(item));
  },
});

export const signals = pgTable(
  "signals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    rawItemId: uuid("raw_item_id")
      .notNull()
      .references(() => rawItems.id, { onDelete: "cascade" }),
    title: text("title").notNull().default(""),
    body: text("body").notNull().default(""),
    authorHandle: text("author_handle"),
    language: text("language").notNull().default("other"),
    postedAt: timestamp("posted_at", { withTimezone: true }),
    metricScore: integer("metric_score"),
    metricComments: integer("metric_comments"),
    embedding: vector1536("embedding"),
    relevanceB2c: numeric("relevance_b2c", { precision: 4, scale: 3 }).notNull().default("0"),
    signalStrength: numeric("signal_strength", { precision: 4, scale: 3 }).notNull().default("0"),
    isNoise: boolean("is_noise").notNull().default(false),
    blacklistTags: text("blacklist_tags").array().notNull().default(sql`'{}'::text[]`),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("signals_raw_item_id_unique_idx").on(t.rawItemId),
    index("signals_blacklist_tags_gin_idx").using("gin", t.blacklistTags),
    index("signals_status_idx").on(t.status),
    index("signals_created_at_idx").on(sql`${t.createdAt} DESC`),
  ],
);

export const clusters = pgTable(
  "clusters",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    label: text("label"),
    summary: text("summary"),
    commonPain: text("common_pain"),
    commonAudience: text("common_audience"),
    topicTags: text("topic_tags").array().notNull().default(sql`'{}'::text[]`),
    coherenceScore: numeric("coherence_score", { precision: 4, scale: 3 }),
    centroidSignalId: uuid("centroid_signal_id").references(() => signals.id, { onDelete: "set null" }),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("clusters_created_at_idx").on(sql`${t.createdAt} DESC`)],
);

export const signalCluster = pgTable(
  "signal_cluster",
  {
    signalId: uuid("signal_id")
      .notNull()
      .references(() => signals.id, { onDelete: "cascade" }),
    clusterId: uuid("cluster_id")
      .notNull()
      .references(() => clusters.id, { onDelete: "cascade" }),
    distance: numeric("distance", { precision: 8, scale: 6 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("signal_cluster_signal_id_cluster_id_unique_idx").on(t.signalId, t.clusterId),
    index("signal_cluster_cluster_id_idx").on(t.clusterId),
  ],
);

export const ideas = pgTable(
  "ideas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clusterId: uuid("cluster_id")
      .notNull()
      .references(() => clusters.id, { onDelete: "cascade" }),
    language: text("language").notNull().default("other"),
    name: text("name").notNull(),
    pain: text("pain").notNull(),
    audience: text("audience").notNull(),
    promise: text("promise").notNull(),
    productType: text("product_type").notNull().default("other"),
    mvp: text("mvp").notNull(),
    channel: text("channel").notNull(),
    monetization: text("monetization").notNull().default("other"),
    supportLevel: text("support_level").notNull().default("medium"),
    lgpdRisk: text("lgpd_risk").notNull().default("medium"),
    buildDifficulty: text("build_difficulty").notNull().default("medium"),
    distributionPotential: text("distribution_potential").notNull().default("medium"),
    subscores: jsonb("subscores").notNull().default(sql`'{}'::jsonb`),
    totalScore: numeric("total_score", { precision: 6, scale: 5 }).notNull().default("0"),
    scoreJustification: text("score_justification"),
    nextStep: text("next_step"),
    blacklistTags: text("blacklist_tags").array().notNull().default(sql`'{}'::text[]`),
    isFilteredOut: boolean("is_filtered_out")
      .generatedAlwaysAs(sql`(cardinality("blacklist_tags") > 0)`)
      .notNull(),
    status: text("status").notNull().default("generated"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("ideas_total_score_desc_idx").on(sql`${t.totalScore} DESC`),
    index("ideas_is_filtered_out_idx").on(t.isFilteredOut),
    index("ideas_blacklist_tags_gin_idx").using("gin", t.blacklistTags),
    index("ideas_cluster_id_idx").on(t.clusterId),
  ],
);

export const ideaSignals = pgTable(
  "idea_signals",
  {
    ideaId: uuid("idea_id")
      .notNull()
      .references(() => ideas.id, { onDelete: "cascade" }),
    signalId: uuid("signal_id")
      .notNull()
      .references(() => signals.id, { onDelete: "cascade" }),
    evidenceQuote: text("evidence_quote"),
    sourceUrl: text("source_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("idea_signals_idea_id_signal_id_unique_idx").on(t.ideaId, t.signalId),
    index("idea_signals_signal_id_idx").on(t.signalId),
  ],
);

export const briefs = pgTable(
  "briefs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ideaId: uuid("idea_id")
      .notNull()
      .references(() => ideas.id, { onDelete: "cascade" }),
    language: text("language").notNull().default("other"),
    objective: text("objective").notNull(),
    hypothesis: text("hypothesis").notNull(),
    audience: text("audience").notNull(),
    promise: text("promise").notNull(),
    screens: jsonb("screens").notNull().default(sql`'[]'::jsonb`),
    features: jsonb("features").notNull().default(sql`'[]'::jsonb`),
    stack: jsonb("stack").notNull().default(sql`'{}'::jsonb`),
    landingCopy: jsonb("landing_copy").notNull().default(sql`'{}'::jsonb`),
    testChannels: jsonb("test_channels").notNull().default(sql`'[]'::jsonb`),
    metrics: jsonb("metrics").notNull().default(sql`'{}'::jsonb`),
    decisionCriteria: jsonb("decision_criteria").notNull().default(sql`'{}'::jsonb`),
    techRisks: jsonb("tech_risks").notNull().default(sql`'[]'::jsonb`),
    apiCosts: text("api_costs").notNull().default(""),
    limitations: jsonb("limitations").notNull().default(sql`'[]'::jsonb`),
    lgpdNotes: text("lgpd_notes").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("briefs_idea_id_unique_idx").on(t.ideaId)],
);

export const prompts = pgTable(
  "prompts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    version: text("version").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("prompts_name_version_unique_idx").on(t.name, t.version)],
);

export const weights = pgTable(
  "weights",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    value: numeric("value", { precision: 6, scale: 5 }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("weights_name_idx").on(t.name)],
);

export const feedback = pgTable(
  "feedback",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ideaId: uuid("idea_id")
      .notNull()
      .references(() => ideas.id, { onDelete: "cascade" }),
    action: text("action").notNull(),
    note: text("note"),
    weightsDelta: jsonb("weights_delta").notNull().default(sql`'{}'::jsonb`),
    exampleLabel: text("example_label"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("feedback_idea_id_created_at_idx").on(t.ideaId, sql`${t.createdAt} DESC`)],
);

export type Run = typeof runs.$inferSelect;
export type NewRun = typeof runs.$inferInsert;
export type AiUsageLog = typeof aiUsageLogs.$inferSelect;
export type NewAiUsageLog = typeof aiUsageLogs.$inferInsert;
export type CostBudget = typeof costBudgets.$inferSelect;
export type NewCostBudget = typeof costBudgets.$inferInsert;
export type Source = typeof sources.$inferSelect;
export type NewSource = typeof sources.$inferInsert;
export type RawItem = typeof rawItems.$inferSelect;
export type NewRawItem = typeof rawItems.$inferInsert;
export type BlacklistTerm = typeof blacklistTerms.$inferSelect;
export type NewBlacklistTerm = typeof blacklistTerms.$inferInsert;
export type Signal = typeof signals.$inferSelect;
export type NewSignal = typeof signals.$inferInsert;
export type Cluster = typeof clusters.$inferSelect;
export type NewCluster = typeof clusters.$inferInsert;
export type SignalCluster = typeof signalCluster.$inferSelect;
export type NewSignalCluster = typeof signalCluster.$inferInsert;
export type Idea = typeof ideas.$inferSelect;
export type NewIdea = typeof ideas.$inferInsert;
export type IdeaSignal = typeof ideaSignals.$inferSelect;
export type NewIdeaSignal = typeof ideaSignals.$inferInsert;
export type Brief = typeof briefs.$inferSelect;
export type NewBrief = typeof briefs.$inferInsert;
export type Prompt = typeof prompts.$inferSelect;
export type NewPrompt = typeof prompts.$inferInsert;
export type Weight = typeof weights.$inferSelect;
export type NewWeight = typeof weights.$inferInsert;
export type Feedback = typeof feedback.$inferSelect;
export type NewFeedback = typeof feedback.$inferInsert;
