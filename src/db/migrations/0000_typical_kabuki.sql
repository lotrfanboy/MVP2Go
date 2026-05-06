CREATE TABLE "ai_usage_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_id" uuid,
	"operation" text NOT NULL,
	"source" text,
	"model" text NOT NULL,
	"tokens_in" integer DEFAULT 0 NOT NULL,
	"tokens_out" integer DEFAULT 0 NOT NULL,
	"embedding_count" integer DEFAULT 0 NOT NULL,
	"estimated_cost_usd" numeric(10, 6) DEFAULT '0' NOT NULL,
	"related_entity_type" text,
	"related_entity_id" text,
	"prompt_version" text,
	"status" text DEFAULT 'ok' NOT NULL,
	"latency_ms" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cost_budgets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"period_month" date NOT NULL,
	"monthly_budget_usd" numeric(10, 2) NOT NULL,
	"warning_threshold" numeric(3, 2) DEFAULT '0.80' NOT NULL,
	"stop_auto_threshold" numeric(3, 2) DEFAULT '0.90' NOT NULL,
	"hard_stop_threshold" numeric(3, 2) DEFAULT '1.00' NOT NULL,
	"current_spend_usd" numeric(10, 6) DEFAULT '0' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cost_budgets_period_month_unique" UNIQUE("period_month")
);
--> statement-breakpoint
CREATE TABLE "runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" text NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"status" text DEFAULT 'running' NOT NULL,
	"items_in" integer DEFAULT 0 NOT NULL,
	"items_out" integer DEFAULT 0 NOT NULL,
	"cost_usd" numeric(10, 6) DEFAULT '0' NOT NULL,
	"error" text,
	"triggered_by" text DEFAULT 'manual' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_usage_logs" ADD CONSTRAINT "ai_usage_logs_run_id_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."runs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_usage_logs_created_at_idx" ON "ai_usage_logs" USING btree ("created_at" DESC);--> statement-breakpoint
CREATE INDEX "ai_usage_logs_operation_idx" ON "ai_usage_logs" USING btree ("operation");--> statement-breakpoint
CREATE INDEX "runs_started_at_idx" ON "runs" USING btree ("started_at" DESC);