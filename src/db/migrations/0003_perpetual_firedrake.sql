CREATE EXTENSION IF NOT EXISTS vector;
--> statement-breakpoint
CREATE TABLE "briefs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"idea_id" uuid NOT NULL,
	"language" text DEFAULT 'other' NOT NULL,
	"objective" text NOT NULL,
	"hypothesis" text NOT NULL,
	"audience" text NOT NULL,
	"promise" text NOT NULL,
	"screens" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"features" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"stack" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"landing_copy" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"test_channels" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"metrics" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"decision_criteria" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"tech_risks" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"api_costs" text DEFAULT '' NOT NULL,
	"limitations" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"lgpd_notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clusters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" text,
	"summary" text,
	"common_pain" text,
	"common_audience" text,
	"topic_tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"coherence_score" numeric(4, 3),
	"centroid_signal_id" uuid,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"idea_id" uuid NOT NULL,
	"action" text NOT NULL,
	"note" text,
	"weights_delta" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"example_label" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "idea_signals" (
	"idea_id" uuid NOT NULL,
	"signal_id" uuid NOT NULL,
	"evidence_quote" text,
	"source_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ideas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cluster_id" uuid NOT NULL,
	"language" text DEFAULT 'other' NOT NULL,
	"name" text NOT NULL,
	"pain" text NOT NULL,
	"audience" text NOT NULL,
	"promise" text NOT NULL,
	"product_type" text DEFAULT 'other' NOT NULL,
	"mvp" text NOT NULL,
	"channel" text NOT NULL,
	"monetization" text DEFAULT 'other' NOT NULL,
	"support_level" text DEFAULT 'medium' NOT NULL,
	"lgpd_risk" text DEFAULT 'medium' NOT NULL,
	"build_difficulty" text DEFAULT 'medium' NOT NULL,
	"distribution_potential" text DEFAULT 'medium' NOT NULL,
	"subscores" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"total_score" numeric(6, 5) DEFAULT '0' NOT NULL,
	"score_justification" text,
	"next_step" text,
	"blacklist_tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"is_filtered_out" boolean GENERATED ALWAYS AS ((cardinality("blacklist_tags") > 0)) STORED NOT NULL,
	"status" text DEFAULT 'generated' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prompts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"version" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "signal_cluster" (
	"signal_id" uuid NOT NULL,
	"cluster_id" uuid NOT NULL,
	"distance" numeric(8, 6),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "signals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"raw_item_id" uuid NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"author_handle" text,
	"language" text DEFAULT 'other' NOT NULL,
	"posted_at" timestamp with time zone,
	"metric_score" integer,
	"metric_comments" integer,
	"embedding" vector(1536),
	"relevance_b2c" numeric(4, 3) DEFAULT '0' NOT NULL,
	"signal_strength" numeric(4, 3) DEFAULT '0' NOT NULL,
	"is_noise" boolean DEFAULT false NOT NULL,
	"blacklist_tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"value" numeric(6, 5) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "weights_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "briefs" ADD CONSTRAINT "briefs_idea_id_ideas_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."ideas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clusters" ADD CONSTRAINT "clusters_centroid_signal_id_signals_id_fk" FOREIGN KEY ("centroid_signal_id") REFERENCES "public"."signals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_idea_id_ideas_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."ideas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "idea_signals" ADD CONSTRAINT "idea_signals_idea_id_ideas_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."ideas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "idea_signals" ADD CONSTRAINT "idea_signals_signal_id_signals_id_fk" FOREIGN KEY ("signal_id") REFERENCES "public"."signals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ideas" ADD CONSTRAINT "ideas_cluster_id_clusters_id_fk" FOREIGN KEY ("cluster_id") REFERENCES "public"."clusters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signal_cluster" ADD CONSTRAINT "signal_cluster_signal_id_signals_id_fk" FOREIGN KEY ("signal_id") REFERENCES "public"."signals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signal_cluster" ADD CONSTRAINT "signal_cluster_cluster_id_clusters_id_fk" FOREIGN KEY ("cluster_id") REFERENCES "public"."clusters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signals" ADD CONSTRAINT "signals_raw_item_id_raw_items_id_fk" FOREIGN KEY ("raw_item_id") REFERENCES "public"."raw_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "briefs_idea_id_unique_idx" ON "briefs" USING btree ("idea_id");--> statement-breakpoint
CREATE INDEX "clusters_created_at_idx" ON "clusters" USING btree ("created_at" DESC);--> statement-breakpoint
CREATE INDEX "feedback_idea_id_created_at_idx" ON "feedback" USING btree ("idea_id","created_at" DESC);--> statement-breakpoint
CREATE UNIQUE INDEX "idea_signals_idea_id_signal_id_unique_idx" ON "idea_signals" USING btree ("idea_id","signal_id");--> statement-breakpoint
CREATE INDEX "idea_signals_signal_id_idx" ON "idea_signals" USING btree ("signal_id");--> statement-breakpoint
CREATE INDEX "ideas_total_score_desc_idx" ON "ideas" USING btree ("total_score" DESC);--> statement-breakpoint
CREATE INDEX "ideas_is_filtered_out_idx" ON "ideas" USING btree ("is_filtered_out");--> statement-breakpoint
CREATE INDEX "ideas_blacklist_tags_gin_idx" ON "ideas" USING gin ("blacklist_tags");--> statement-breakpoint
CREATE INDEX "ideas_cluster_id_idx" ON "ideas" USING btree ("cluster_id");--> statement-breakpoint
CREATE UNIQUE INDEX "prompts_name_version_unique_idx" ON "prompts" USING btree ("name","version");--> statement-breakpoint
CREATE UNIQUE INDEX "signal_cluster_signal_id_cluster_id_unique_idx" ON "signal_cluster" USING btree ("signal_id","cluster_id");--> statement-breakpoint
CREATE INDEX "signal_cluster_cluster_id_idx" ON "signal_cluster" USING btree ("cluster_id");--> statement-breakpoint
CREATE UNIQUE INDEX "signals_raw_item_id_unique_idx" ON "signals" USING btree ("raw_item_id");--> statement-breakpoint
CREATE INDEX "signals_blacklist_tags_gin_idx" ON "signals" USING gin ("blacklist_tags");--> statement-breakpoint
CREATE INDEX "signals_status_idx" ON "signals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "signals_created_at_idx" ON "signals" USING btree ("created_at" DESC);--> statement-breakpoint
CREATE INDEX "signals_embedding_ivfflat_idx" ON "signals" USING ivfflat ("embedding" vector_cosine_ops) WITH (lists = 100);--> statement-breakpoint
CREATE INDEX "weights_name_idx" ON "weights" USING btree ("name");