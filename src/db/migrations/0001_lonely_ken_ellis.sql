CREATE TABLE "blacklist_terms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"term" text NOT NULL,
	"category" text NOT NULL,
	"scope" text DEFAULT 'raw_items' NOT NULL,
	"language" text DEFAULT 'other' NOT NULL,
	"match_kind" text DEFAULT 'keyword' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "raw_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" uuid NOT NULL,
	"source_external_id" text,
	"url" text NOT NULL,
	"raw_payload" jsonb NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"hash_url" text NOT NULL,
	"hash_text_norm" text NOT NULL,
	"language" text DEFAULT 'other' NOT NULL,
	"is_filtered_out" boolean DEFAULT false NOT NULL,
	"filter_reason" text,
	"blacklist_tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"is_candidate" boolean GENERATED ALWAYS AS (
		((NOT "is_filtered_out") AND cardinality("blacklist_tags") = 0)
	) STORED
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"kind" text NOT NULL,
	"config_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "raw_items" ADD CONSTRAINT "raw_items_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blacklist_terms_active_idx" ON "blacklist_terms" USING btree ("active");--> statement-breakpoint
CREATE INDEX "blacklist_terms_category_idx" ON "blacklist_terms" USING btree ("category");--> statement-breakpoint
CREATE UNIQUE INDEX "raw_items_hash_url_unique_idx" ON "raw_items" USING btree ("hash_url");--> statement-breakpoint
CREATE INDEX "raw_items_hash_text_norm_idx" ON "raw_items" USING btree ("hash_text_norm");--> statement-breakpoint
CREATE INDEX "raw_items_blacklist_tags_gin_idx" ON "raw_items" USING gin ("blacklist_tags");--> statement-breakpoint
CREATE INDEX "raw_items_is_candidate_true_idx" ON "raw_items" USING btree ("is_candidate") WHERE "raw_items"."is_candidate" = true;--> statement-breakpoint
CREATE INDEX "raw_items_source_fetched_idx" ON "raw_items" USING btree ("source_id","fetched_at" DESC);--> statement-breakpoint
CREATE UNIQUE INDEX "sources_kind_name_unique_idx" ON "sources" USING btree ("kind","name");--> statement-breakpoint

INSERT INTO "sources" ("name", "kind", "config_json", "active")
VALUES ('Algolia HN', 'algolia-hn', '{"daily_cap":500,"tags":["story","ask_hn","show_hn"]}'::jsonb, true)
ON CONFLICT ("kind", "name")
DO UPDATE SET "config_json" = EXCLUDED."config_json", "active" = EXCLUDED."active";--> statement-breakpoint

INSERT INTO "blacklist_terms" ("term", "category", "scope", "language", "match_kind", "active")
VALUES
	('gambling', 'gambling', 'raw_items', 'en', 'keyword', true),
	('betting', 'gambling', 'raw_items', 'en', 'keyword', true),
	('casino', 'gambling', 'raw_items', 'en', 'keyword', true),
	('lottery', 'gambling', 'raw_items', 'en', 'keyword', true),
	('apostas', 'gambling', 'raw_items', 'pt', 'keyword', true),
	('cassino', 'gambling', 'raw_items', 'pt', 'keyword', true),
	('loteria', 'gambling', 'raw_items', 'pt', 'keyword', true),

	('crypto', 'crypto_finance', 'raw_items', 'en', 'keyword', true),
	('trading', 'crypto_finance', 'raw_items', 'en', 'keyword', true),
	('day trade', 'crypto_finance', 'raw_items', 'en', 'keyword', true),
	('cripto', 'crypto_finance', 'raw_items', 'pt', 'keyword', true),
	('day trade', 'crypto_finance', 'raw_items', 'pt', 'keyword', true),
	('investimento financeiro', 'crypto_finance', 'raw_items', 'pt', 'keyword', true),

	('diagnosis', 'regulated_health', 'raw_items', 'en', 'keyword', true),
	('treatment', 'regulated_health', 'raw_items', 'en', 'keyword', true),
	('prescription', 'regulated_health', 'raw_items', 'en', 'keyword', true),
	('diagnostico', 'regulated_health', 'raw_items', 'pt', 'keyword', true),
	('tratamento', 'regulated_health', 'raw_items', 'pt', 'keyword', true),
	('prescricao', 'regulated_health', 'raw_items', 'pt', 'keyword', true),

	('legal advice', 'regulated_legal', 'raw_items', 'en', 'keyword', true),
	('lawsuit', 'regulated_legal', 'raw_items', 'en', 'keyword', true),
	('advocacia', 'regulated_legal', 'raw_items', 'pt', 'keyword', true),
	('juridico', 'regulated_legal', 'raw_items', 'pt', 'keyword', true),
	('peca processual', 'regulated_legal', 'raw_items', 'pt', 'keyword', true),

	('credit underwriting', 'regulated_finance', 'raw_items', 'en', 'keyword', true),
	('securities', 'regulated_finance', 'raw_items', 'en', 'keyword', true),
	('insurance policy', 'regulated_finance', 'raw_items', 'en', 'keyword', true),
	('credito', 'regulated_finance', 'raw_items', 'pt', 'keyword', true),
	('seguros', 'regulated_finance', 'raw_items', 'pt', 'keyword', true),
	('cvm', 'regulated_finance', 'raw_items', 'pt', 'keyword', true),

	('porn', 'adult', 'raw_items', 'en', 'keyword', true),
	('adult content', 'adult', 'raw_items', 'en', 'keyword', true),
	('sexual dating', 'adult', 'raw_items', 'en', 'keyword', true),
	('pornografia', 'adult', 'raw_items', 'pt', 'keyword', true),
	('conteudo adulto', 'adult', 'raw_items', 'pt', 'keyword', true),
	('dating sexual', 'adult', 'raw_items', 'pt', 'keyword', true),

	('tobacco', 'regulated_substances', 'raw_items', 'en', 'keyword', true),
	('alcohol', 'regulated_substances', 'raw_items', 'en', 'keyword', true),
	('cannabis', 'regulated_substances', 'raw_items', 'en', 'keyword', true),
	('tabaco', 'regulated_substances', 'raw_items', 'pt', 'keyword', true),
	('alcool', 'regulated_substances', 'raw_items', 'pt', 'keyword', true),
	('farmacos controlados', 'regulated_substances', 'raw_items', 'pt', 'keyword', true),

	('weapon', 'weapons', 'raw_items', 'en', 'keyword', true),
	('ammunition', 'weapons', 'raw_items', 'en', 'keyword', true),
	('arma', 'weapons', 'raw_items', 'pt', 'keyword', true),
	('municao', 'weapons', 'raw_items', 'pt', 'keyword', true),

	('marketplace', 'marketplace', 'raw_items', 'en', 'keyword', true),
	('two-sided market', 'marketplace', 'raw_items', 'en', 'keyword', true),
	('marketplace', 'marketplace', 'raw_items', 'pt', 'keyword', true),

	('social network', 'social_network', 'raw_items', 'en', 'keyword', true),
	('community platform', 'social_network', 'raw_items', 'en', 'keyword', true),
	('rede social', 'social_network', 'raw_items', 'pt', 'keyword', true),
	('comunidade', 'social_network', 'raw_items', 'pt', 'keyword', true),

	('native ios app', 'mobile_native_required', 'raw_items', 'en', 'keyword', true),
	('native android app', 'mobile_native_required', 'raw_items', 'en', 'keyword', true),
	('app nativo', 'mobile_native_required', 'raw_items', 'pt', 'keyword', true),

	('enterprise sales', 'b2b_enterprise', 'raw_items', 'en', 'keyword', true),
	('annual contract', 'b2b_enterprise', 'raw_items', 'en', 'keyword', true),
	('vendas enterprise', 'b2b_enterprise', 'raw_items', 'pt', 'keyword', true),
	('contrato anual', 'b2b_enterprise', 'raw_items', 'pt', 'keyword', true),

	('managed service', 'recurring_human_support', 'raw_items', 'en', 'keyword', true),
	('human support team', 'recurring_human_support', 'raw_items', 'en', 'keyword', true),
	('atendimento humano', 'recurring_human_support', 'raw_items', 'pt', 'keyword', true),
	('sla de suporte', 'recurring_human_support', 'raw_items', 'pt', 'keyword', true),

	('custom implementation', 'high_customization', 'raw_items', 'en', 'keyword', true),
	('tailored per client', 'high_customization', 'raw_items', 'en', 'keyword', true),
	('customizacao por cliente', 'high_customization', 'raw_items', 'pt', 'keyword', true),
	('muito customizavel', 'high_customization', 'raw_items', 'pt', 'keyword', true),

	('complex integration', 'complex_integrations_required', 'raw_items', 'en', 'keyword', true),
	('erp integration', 'complex_integrations_required', 'raw_items', 'en', 'keyword', true),
	('integracao complexa', 'complex_integrations_required', 'raw_items', 'pt', 'keyword', true),
	('integracao com erp', 'complex_integrations_required', 'raw_items', 'pt', 'keyword', true),

	('social security number', 'sensitive_personal_data', 'raw_items', 'en', 'keyword', true),
	('biometric data', 'sensitive_personal_data', 'raw_items', 'en', 'keyword', true),
	('health records', 'sensitive_personal_data', 'raw_items', 'en', 'keyword', true),
	('cpf', 'sensitive_personal_data', 'raw_items', 'pt', 'keyword', true),
	('biometria', 'sensitive_personal_data', 'raw_items', 'pt', 'keyword', true),
	('dados sensiveis', 'sensitive_personal_data', 'raw_items', 'pt', 'keyword', true)
ON CONFLICT DO NOTHING;