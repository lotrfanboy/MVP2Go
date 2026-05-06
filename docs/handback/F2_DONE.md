# F2 DONE — IA + Embeddings + Clusters + Ideias

## Resumo do que foi feito

- Estrutura F2 adicionada no schema e migration SQL (`pgvector`, `signals`, `clusters`, `signal_cluster`, `ideas`, `idea_signals`, `briefs`, `prompts`, `weights`, `feedback`).
- Prompts versionados `001` criados em `src/prompts/`.
- Pipeline F2 criada em `src/pipeline/`:
  - `extract.ts`
  - `embed.ts`
  - `filter_ai.ts` (integrado ao `extract` para casos ambiguos)
  - `cluster.ts`
  - `ideaGen.ts`
  - `ideas-blacklist.ts`
  - `score.ts`
- Endpoints cron F2 criados:
  - `src/app/api/cron/extract/route.ts`
  - `src/app/api/cron/generate/route.ts`
- `vercel.json` atualizado para agendar `extract` e `generate` apos `collect-hn`.
- Seed atualizada para inserir prompts (`name+version`) e pesos default.
- Tela de coleta atualizada para mostrar conversao `raw_items candidatos -> signals`.
- Validacao local concluida: `npm run typecheck`, `npm run lint`, `npm run build`.

## SQL da migration

- Arquivo: `src/db/migrations/0003_perpetual_firedrake.sql`

## Conteudo final dos 5 prompts (versao 001)

- `P-EXT-001`: `src/prompts/p_ext_001.ts`
- `P-FIL-001`: `src/prompts/p_fil_001.ts`
- `P-CLU-001`: `src/prompts/p_clu_001.ts`
- `P-IDE-001`: `src/prompts/p_ide_001.ts`
- `P-BRF-001`: `src/prompts/p_brf_001.ts`

## Pesos seedados em `weights`

- `pain_clarity`: `0.18`
- `b2c_fit`: `0.15`
- `evidence_volume`: `0.12`
- `signal_strength`: `0.10`
- `audience_specificity`: `0.10`
- `build_simplicity`: `0.10`
- `distribution_potential`: `0.08`
- `recency`: `0.07`
- `support_low`: `0.05`
- `lgpd_safety`: `0.05`
- `category_bonus`: `0.05`
- `cosine_threshold`: `0.78`

## Metricas da ultima execucao completa

- Ultimo snapshot validado em dev:
  - `raw_items candidatos`: `168`
  - `signals`: `168`
  - `clusters`: `23`
  - `ideas`: `101`
  - `ai_usage_logs` custo acumulado: `US$ 0.055635`
  - `cost_budgets.current_spend_usd`: `0.041313` (budget mensal configurado em `US$ 5.00`)
  - `filter_ai` observado em execucao (`ai_usage_logs.operation='filter_ai'`, contagem atual: `1`)

## Evidencia dos testes de threshold

- Executado via `npm run test:budget:live` (scripts/test-budget-live.ts), com restauracao do gasto original ao final.
- Evidencias:
  - `0.79` -> `cron=ok`, `manual=ok`, `manual+override=ok` (todas assercoes passam).
  - `0.85` -> `cron=warning`, `manual=warning`, `manual+override=warning` (todas assercoes passam).
  - `0.95` -> `cron=auto_stopped`, `manual=auto_stopped`, `manual+override=warning` (cron/manual bloqueados; override manual liberado).
  - `1.00` -> `cron=hard_stopped`, `manual=hard_stopped`, `manual+override=hard_stopped` (bloqueio total, inclusive override).

## Status dos gates F2

- [x] Migration SQL criada e pronta para revisao/aprovacao.
- [x] Migration aplicada no ambiente dev.
- [x] `pgvector` habilitado em dev (via migration).
- [x] Indices ivfflat criados em banco.
- [x] Prompts seedados em `prompts` (5 entradas v001) em banco.
- [x] Weights seedadas em banco.
- [x] `npm run typecheck` / `lint` / `build` passam local.
- [x] Pipeline ponta-a-ponta HN gera >= 20 ideias por execucao.
- [x] Cada chamada IA registrada em `ai_usage_logs` com `prompt_version`.
- [x] Testes de threshold documentados com evidencia.
- [x] `assertBudget` bloqueia cron >= 0.90 e permite manual+override.
- [x] `ideas.blacklist_tags` reflete `is_filtered_out = true`.
- [x] Nenhum coletor adicional foi adicionado.
- [x] Filtro hibrido F2 ativo em execucao (regras + IA leve com `P-FIL-001`).

## Pendencias conhecidas

- Refinar estabilidade de chamadas manuais longas para evitar runs `status=running` orfas quando o cliente interrompe a requisicao.

## Notas operacionais

- Para alinhamento com restricao do operador, o ambiente dev esta com `AI_MONTHLY_BUDGET_USD=5` (em vez do default de projeto `50`), mantendo os mesmos thresholds 0.80/0.90/1.00.
- Reconciliacao de custo por run normalizada:
  - `withRun` agora grava `runs.cost_usd` a partir da soma real de `ai_usage_logs` da run (inclusive em erro).
  - Backfill executado para runs historicas ja existentes, zerando divergencias de custo.

## Proximo agente

- Agent 5 (Revisao) antes de iniciar F3.
