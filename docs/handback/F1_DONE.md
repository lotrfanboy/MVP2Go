# F1_DONE — Agent 3 (F1 Coleta HN sem IA)

## Resumo do que foi feito

F1 foi implementada conforme `docs/agents/AGENT_3_F1_COLETA_HN.md`:

- Migrations F1 aplicadas:
  - `0001_lonely_ken_ellis.sql` com criação de `sources`, `raw_items`, `blacklist_terms`.
  - `0002_stale_midnight.sql` corretiva para alinhar defaults de `blacklist_terms` ao PRD §17 (`scope='all'`, `language='all'`).
- Seed idempotente de `sources` para Algolia HN e seed inicial de blacklist (16 categorias PRD §6.1, PT/EN).
- Coletor Algolia HN com 3 tags (`story`, `ask_hn`, `show_hn`), janela por `created_at_i`, paginação `hitsPerPage=100`, cap diário por `sources.config_json.daily_cap` e retry/backoff.
- Hardening operacional aplicado para cron:
  - processamento limitado a 1 lote por execução (`processed=200`, restante em `deferred`),
  - inserção em lote (batch) para reduzir latência total de DB,
  - endpoint cron com `try/catch` e erro JSON consistente (`{ ok: false, error }`).
- Correções pós-review do Agent 5:
  - defaults de `blacklist_terms` alinhados ao PRD §17 com migration corretiva (`scope='all'`, `language='all'`);
  - filtro de blacklist atualizado para aceitar termos `scope='all'` e `language='all'`;
  - fallback amigável na página `/coleta` em caso de falha de conexão DB (sem quebrar runtime).
- Pipeline determinístico implementado em `src/pipeline/`:
  - normalização,
  - dedupe por `hash_url` + `hash_text_norm`,
  - filtro por regras (idioma/tamanho/palavras bloqueadas),
  - blacklist em `raw_items`.
- Endpoint cron `POST /api/cron/collect-hn` com validação `Authorization: Bearer <CRON_SECRET>` e `withRun`.
- `vercel.json` atualizado com cron seg/qui às 11:00 UTC.
- Tela read-only `Coleta / Raw Items / Candidatos` com filtros e paginação.

## SQL das migrations aplicadas

Arquivos:

- `src/db/migrations/0001_lonely_ken_ellis.sql`
- `src/db/migrations/0002_stale_midnight.sql`

```sql
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

ALTER TABLE "blacklist_terms" ALTER COLUMN "scope" SET DEFAULT 'all';--> statement-breakpoint
ALTER TABLE "blacklist_terms" ALTER COLUMN "language" SET DEFAULT 'all';
```

## Snapshot de validação

### `npm run typecheck`

```text
> gomvp@0.1.0 typecheck
> tsc --noEmit
```

### `npm run lint`

```text
> gomvp@0.1.0 lint
> eslint .
```

### `npm run build`

```text
> gomvp@0.1.0 build
> next build
✓ Compiled successfully
✓ Generating static pages (7/7)
```

## Métricas da última execução do coletor

Última execução pós-hardening (`runId=f8104439-108a-4435-97b5-32044709fc3e`):

- fetched: 500
- processed: 200
- deferred: 300
- inserted: 0
- candidates: 0
- filteredOut: 0
- blacklisted: 0

Execução de validação final para re-review (`runId=8abb070f-0f79-4a53-a49c-65c87456ab97`):

- fetched: 500
- processed: 200
- deferred: 300
- inserted: 0
- candidates: 0
- filteredOut: 0
- blacklisted: 0

Execução de carga inicial (`runId=0ce8aff7-8913-4e73-9835-19f0e0c2ee76`):

- fetched: 500
- inserted: 486
- candidates: 167
- filteredOut: 311
- blacklisted: 8

Execução de dedupe no mesmo intervalo (`runId=173f1aee-2d83-43c6-9733-6bc42fd530f7`):

- fetched: 500
- inserted: 1
- dedupe observado: 499/500 não inseridos (0.2% inserção líquida)

Snapshot agregado atual no banco:

- `raw_items`: 487
- `is_candidate=true`: 167
- `is_filtered_out=true`: 312
- `ai_usage_logs`: 0
- blacklist por categoria:
  - `adult`: 2
  - `regulated_legal`: 2
  - `crypto_finance`: 2
  - `gambling`: 1
  - `marketplace`: 1

## Status dos gates F1

- [x] Migration `0001_*.sql` mostrada e aprovada antes de aplicar.
- [x] Migration aplicada em Supabase dev sem erro.
- [x] Seed de `sources` (HN) e `blacklist_terms` aplicado.
- [x] `npm run typecheck` / `lint` / `build` passam.
- [x] Endpoint `/api/cron/collect-hn` retorna 401 sem `CRON_SECRET` e 200 com.
- [x] Após 1 execução: ≥ 100 `raw_items` ou ≥ 50 candidatos (`is_candidate=true`).
- [x] Dedupe < 5%: 2ª execução no mesmo intervalo inseriu 1 de 500 itens (0.2%).
- [x] Custo IA = US$ 0,00 (`ai_usage_logs` vazio).
- [ ] Tela "Coleta / Raw Items / Candidatos" carrega < 1s com filtros funcionando (pendente validação manual no browser).
- [x] Vercel Cron ativo no `vercel.json` apontando para o endpoint correto.
- [x] Defaults de `blacklist_terms` alinhados ao PRD §17 (`scope='all'`, `language='all'`).

## Pendências conhecidas

1. Validação manual de UX/performance da tela `/coleta` no browser para confirmar `< 1s` em ambiente do operador.
2. Warning conhecido herdado de F0 no build sobre plugin ESLint do Next (não bloqueante para F1).

## Pacote para revisão (Agent 5)

Arquivos-chave para inspeção:

- `src/db/schema.ts`
- `src/db/migrations/0001_lonely_ken_ellis.sql`
- `src/collectors/algolia-hn.ts`
- `src/pipeline/normalize.ts`
- `src/pipeline/dedupe.ts`
- `src/pipeline/filter.ts`
- `src/pipeline/blacklist.ts`
- `src/app/api/cron/collect-hn/route.ts`
- `src/app/(dashboard)/coleta/page.tsx`
- `vercel.json`

Comandos sugeridos para validação do Agent 5:

1. `npm run typecheck`
2. `npm run lint`
3. `npm run build`
4. `POST /api/cron/collect-hn` sem bearer -> 401
5. `POST /api/cron/collect-hn` com bearer válido -> 200
6. Conferir `ai_usage_logs` vazio e dedupe em duas execuções consecutivas
7. Confirmar defaults de `blacklist_terms` (`scope='all'`, `language='all'`)

Resultado esperado na revisão:

- Sem IA em F1 (`ai_usage_logs = 0`)
- `signals` inexistente
- Cron protegido por `CRON_SECRET`
- Dedupe efetivo por `hash_url`
- Blacklist ativa nas 16 categorias seedadas
- Defaults do `blacklist_terms` aderentes ao PRD (`all/all`)

## Próximo agente

Próximo agente recomendado: **Agent 5 (Revisão)** antes de seguir para Agent 4.
