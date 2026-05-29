CREATE TABLE "evidence_clusters" (
	"evidence_id" uuid NOT NULL,
	"need_cluster_id" uuid NOT NULL,
	"distance" numeric(8, 6),
	"primary_evidence" boolean DEFAULT false NOT NULL,
	CONSTRAINT "evidence_clusters_evidence_id_need_cluster_id_pk" PRIMARY KEY("evidence_id","need_cluster_id")
);
--> statement-breakpoint
CREATE TABLE "evidences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_key" text NOT NULL,
	"source_item_id" text,
	"source_ref" text,
	"evidence_type" text NOT NULL,
	"topic_key" text,
	"topic_label" text,
	"observed_at" timestamp with time zone NOT NULL,
	"language" text DEFAULT 'other' NOT NULL,
	"market" text DEFAULT 'global' NOT NULL,
	"summary" text,
	"pain_text" text,
	"desire_text" text,
	"audience_hint" text,
	"quote_excerpt" text,
	"strength" numeric(4, 3) DEFAULT '0' NOT NULL,
	"confidence" numeric(4, 3) DEFAULT '0' NOT NULL,
	"axes_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"metrics_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"metadata_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"raw_item_id" uuid,
	"signal_id" uuid,
	"manual_input_id" uuid,
	"watch_topic_id" uuid,
	"embedding" vector(1536),
	"blacklist_tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "manual_inputs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"input_kind" text NOT NULL,
	"payload" text NOT NULL,
	"source_url" text,
	"language" text DEFAULT 'other' NOT NULL,
	"watch_topic_id" uuid,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "motor_runtime_state" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "need_clusters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" text,
	"summary" text,
	"pain_summary" text,
	"audience_summary" text,
	"topic_key" text,
	"topic_tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"evidence_count" integer DEFAULT 0 NOT NULL,
	"coherence_score" numeric(4, 3),
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunity_cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"need_cluster_id" uuid,
	"trend_candidate_id" uuid,
	"topic_key" text,
	"topic_label" text NOT NULL,
	"pain_summary" text,
	"audience_summary" text,
	"market" text DEFAULT 'global' NOT NULL,
	"language" text DEFAULT 'other' NOT NULL,
	"trend_score" numeric(4, 3) DEFAULT '0' NOT NULL,
	"pain_score" numeric(4, 3) DEFAULT '0' NOT NULL,
	"audience_score" numeric(4, 3) DEFAULT '0' NOT NULL,
	"source_confidence" numeric(4, 3) DEFAULT '0' NOT NULL,
	"launchability_score" numeric(4, 3) DEFAULT '0' NOT NULL,
	"opportunity_score" numeric(4, 3) DEFAULT '0' NOT NULL,
	"axes_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"evidence_count" integer DEFAULT 0 NOT NULL,
	"source_count" integer DEFAULT 0 NOT NULL,
	"gate_state" text DEFAULT 'opportunity_candidate' NOT NULL,
	"snoozed_until" timestamp with time zone,
	"reason_codes" text[] DEFAULT '{}'::text[] NOT NULL,
	"notes" text,
	"blacklist_tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunity_evidences" (
	"opportunity_id" uuid NOT NULL,
	"evidence_id" uuid NOT NULL,
	"contribution_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "opportunity_evidences_opportunity_id_evidence_id_pk" PRIMARY KEY("opportunity_id","evidence_id")
);
--> statement-breakpoint
CREATE TABLE "trend_candidates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic_key" text NOT NULL,
	"topic_label" text NOT NULL,
	"market" text DEFAULT 'global' NOT NULL,
	"language" text DEFAULT 'other' NOT NULL,
	"window_kind" text NOT NULL,
	"trend_score" numeric(4, 3) DEFAULT '0' NOT NULL,
	"recency" numeric(4, 3) DEFAULT '0' NOT NULL,
	"frequency" numeric(4, 3) DEFAULT '0' NOT NULL,
	"acceleration" numeric(4, 3) DEFAULT '0' NOT NULL,
	"persistence" numeric(4, 3) DEFAULT '0' NOT NULL,
	"source_diversity" numeric(4, 3) DEFAULT '0' NOT NULL,
	"evidence_count" integer DEFAULT 0 NOT NULL,
	"computed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "watch_topics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic_key" text NOT NULL,
	"topic_label" text NOT NULL,
	"language" text DEFAULT 'all' NOT NULL,
	"market" text DEFAULT 'global' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ideas" ADD COLUMN "opportunity_id" uuid;--> statement-breakpoint
ALTER TABLE "ideas" ADD COLUMN "gate_state" text DEFAULT 'idea_candidate' NOT NULL;--> statement-breakpoint
ALTER TABLE "evidence_clusters" ADD CONSTRAINT "evidence_clusters_evidence_id_evidences_id_fk" FOREIGN KEY ("evidence_id") REFERENCES "public"."evidences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_clusters" ADD CONSTRAINT "evidence_clusters_need_cluster_id_need_clusters_id_fk" FOREIGN KEY ("need_cluster_id") REFERENCES "public"."need_clusters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidences" ADD CONSTRAINT "evidences_raw_item_id_raw_items_id_fk" FOREIGN KEY ("raw_item_id") REFERENCES "public"."raw_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidences" ADD CONSTRAINT "evidences_signal_id_signals_id_fk" FOREIGN KEY ("signal_id") REFERENCES "public"."signals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidences" ADD CONSTRAINT "evidences_manual_input_id_manual_inputs_id_fk" FOREIGN KEY ("manual_input_id") REFERENCES "public"."manual_inputs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidences" ADD CONSTRAINT "evidences_watch_topic_id_watch_topics_id_fk" FOREIGN KEY ("watch_topic_id") REFERENCES "public"."watch_topics"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manual_inputs" ADD CONSTRAINT "manual_inputs_watch_topic_id_watch_topics_id_fk" FOREIGN KEY ("watch_topic_id") REFERENCES "public"."watch_topics"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_cards" ADD CONSTRAINT "opportunity_cards_need_cluster_id_need_clusters_id_fk" FOREIGN KEY ("need_cluster_id") REFERENCES "public"."need_clusters"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_cards" ADD CONSTRAINT "opportunity_cards_trend_candidate_id_trend_candidates_id_fk" FOREIGN KEY ("trend_candidate_id") REFERENCES "public"."trend_candidates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_evidences" ADD CONSTRAINT "opportunity_evidences_opportunity_id_opportunity_cards_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunity_cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_evidences" ADD CONSTRAINT "opportunity_evidences_evidence_id_evidences_id_fk" FOREIGN KEY ("evidence_id") REFERENCES "public"."evidences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "evidence_clusters_need_cluster_id_idx" ON "evidence_clusters" USING btree ("need_cluster_id");--> statement-breakpoint
CREATE INDEX "evidences_topic_key_idx" ON "evidences" USING btree ("topic_key");--> statement-breakpoint
CREATE INDEX "evidences_evidence_type_idx" ON "evidences" USING btree ("evidence_type");--> statement-breakpoint
CREATE INDEX "evidences_observed_at_idx" ON "evidences" USING btree ("observed_at" DESC);--> statement-breakpoint
CREATE INDEX "evidences_blacklist_tags_gin_idx" ON "evidences" USING gin ("blacklist_tags");--> statement-breakpoint
CREATE UNIQUE INDEX "evidences_source_dedupe_idx" ON "evidences" USING btree ("source_key",coalesce("source_item_id", ''),"evidence_type");--> statement-breakpoint
CREATE INDEX "manual_inputs_created_at_idx" ON "manual_inputs" USING btree ("created_at" DESC);--> statement-breakpoint
CREATE INDEX "need_clusters_created_at_idx" ON "need_clusters" USING btree ("created_at" DESC);--> statement-breakpoint
CREATE INDEX "opportunity_cards_opportunity_score_idx" ON "opportunity_cards" USING btree ("opportunity_score" DESC);--> statement-breakpoint
CREATE INDEX "opportunity_cards_gate_state_idx" ON "opportunity_cards" USING btree ("gate_state");--> statement-breakpoint
CREATE INDEX "opportunity_evidences_evidence_id_idx" ON "opportunity_evidences" USING btree ("evidence_id");--> statement-breakpoint
CREATE UNIQUE INDEX "trend_candidates_topic_window_market_unique_idx" ON "trend_candidates" USING btree ("topic_key","window_kind","market");--> statement-breakpoint
CREATE INDEX "trend_candidates_window_idx" ON "trend_candidates" USING btree ("window_kind");--> statement-breakpoint
CREATE INDEX "trend_candidates_topic_key_idx" ON "trend_candidates" USING btree ("topic_key");--> statement-breakpoint
CREATE UNIQUE INDEX "watch_topics_topic_key_unique_idx" ON "watch_topics" USING btree ("topic_key");--> statement-breakpoint
CREATE INDEX "ideas_opportunity_id_idx" ON "ideas" USING btree ("opportunity_id");--> statement-breakpoint
ALTER TABLE "ideas" ADD CONSTRAINT "ideas_opportunity_id_opportunity_cards_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunity_cards"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "evidences_embedding_ivfflat_idx" ON "evidences" USING ivfflat ("embedding" vector_cosine_ops) WITH (lists = 100) WHERE ("embedding" IS NOT NULL);