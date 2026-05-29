## Cabeçalho

- **Agente:** Agent 8
- **Fase / Gate:** F4A — Opportunity Motor (Evidence Layer + Scoring + Gates + UI Funil)
- **Tipo de handback:** done
- **Status final do gate:** pending_review
- **Data:** 2026-05-28
- **Branch / Worktree:** main
- **Reviewer solicitado:** Agent 5

---

## 1. Scope completed

- [x] Migration F4A `0004_dashing_blonde_phantom.sql` criada e aplicada em dev com aprovação explícita do operador.
- [x] Tabelas F4A criadas: `watch_topics`, `manual_inputs`, `evidences`, `evidence_clusters`, `trend_candidates`, `need_clusters`, `opportunity_cards`, `opportunity_evidences` e `motor_runtime_state`.
- [x] `ideas` alterada com `opportunity_id` nullable e `gate_state`.
- [x] Adapter `signals -> evidences` criado para HN, com cutoff persistido em `motor_runtime_state` para evitar backfill retroativo.
- [x] Normalizers `manual` e `watch` criados, sem elevar Source Confidence externa.
- [x] Motor F4A criado: evidence store, trend engine, need clustering, opportunity scoring, gates e pipelines.
- [x] Prompts novos P-EVI-001, P-TRD-001 e P-OPP-001 criados e seedados.
- [x] Pesos `f4_*` seedados em `weights`.
- [x] Endpoints criados: `/api/cron/build-evidence`, `/api/cron/score-opportunities`, `/api/manual/analyze`.
- [x] `vercel.json` atualizado com crons F4A.
- [x] UI `/funil/*` criada com estados vazios, loading/error e disclaimer obrigatório.
- [x] Nav atualizado com grupo "Funil" e badges `Legado`.
- [x] Script `test:opportunity-gate` criado e validado.

## 2. Files created

- `src/db/migrations/0004_dashing_blonde_phantom.sql`
- `src/db/migrations/meta/0004_snapshot.json`
- `scripts/test-opportunity-gate.ts`
- `src/lib/topic-key.ts`
- `src/components/dashboard/funil-disclaimer.tsx`
- `src/app/api/cron/build-evidence/route.ts`
- `src/app/api/cron/score-opportunities/route.ts`
- `src/app/api/manual/analyze/route.ts`
- `src/app/(dashboard)/funil/layout.tsx`
- `src/app/(dashboard)/funil/loading.tsx`
- `src/app/(dashboard)/funil/error.tsx`
- `src/app/(dashboard)/funil/radar/page.tsx`
- `src/app/(dashboard)/funil/watch-topics/actions.ts`
- `src/app/(dashboard)/funil/watch-topics/page.tsx`
- `src/app/(dashboard)/funil/watch-topics/watch-topic-form.tsx`
- `src/app/(dashboard)/funil/manual/page.tsx`
- `src/app/(dashboard)/funil/manual/manual-input-form.tsx`
- `src/app/(dashboard)/funil/trends/page.tsx`
- `src/app/(dashboard)/funil/need-clusters/page.tsx`
- `src/app/(dashboard)/funil/opportunities/page.tsx`
- `src/app/(dashboard)/funil/opportunities/[id]/page.tsx`
- `src/app/(dashboard)/funil/opportunities/[id]/actions.ts`
- `src/app/(dashboard)/funil/opportunities/[id]/gate-form.tsx`
- `src/app/(dashboard)/funil/source-confidence/page.tsx`
- `src/motor/blacklist-evidence.ts`
- `src/motor/evidence-store.ts`
- `src/motor/f4-weights.ts`
- `src/motor/need-cluster.ts`
- `src/motor/opportunity-gate.ts`
- `src/motor/opportunity-score.ts`
- `src/motor/prompts.ts`
- `src/motor/run-build-evidence.ts`
- `src/motor/run-score-opportunities.ts`
- `src/motor/runtime-state.ts`
- `src/motor/trend-engine.ts`
- `src/prompts/p_evi_001.ts`
- `src/prompts/p_trd_001.ts`
- `src/prompts/p_opp_001.ts`
- `src/sources/hn/signal-to-evidence.ts`
- `src/sources/manual/normalizer.ts`
- `src/sources/watch/normalizer.ts`

## 3. Files changed

- `package.json` — adiciona script `test:opportunity-gate`.
- `src/components/dashboard/nav-config.ts` — adiciona grupo Funil e marca legado.
- `src/components/dashboard/nav-item.tsx` — renderiza badge `Legado`.
- `src/db/schema.ts` — adiciona schema F4A e colunas F4 em `ideas`.
- `src/db/seed.ts` — seeda prompts F4A e pesos `f4_*`.
- `src/db/migrations/meta/_journal.json` — registra migration `0004`.
- `src/prompts/index.ts` — registra P-EVI/P-TRD/P-OPP.
- `src/prompts/p_opp_001.ts` — torna `suggested_gate_hint` tolerante a valores inválidos; o campo é apenas advisory e o gate segue determinístico.
- `vercel.json` — adiciona crons F4A.

## 4. Commands executed

| Comando | Resultado | Observação |
|---|---|---|
| `npm run typecheck` | ok | Executado antes e depois dos ajustes. |
| `npm run lint` | ok | Sem erros finais. |
| `npm run build` | ok | Build final passou; warning existente do Next ESLint plugin permanece. |
| `npm run db:generate` | ok | Gerou `0004_dashing_blonde_phantom.sql`. |
| `npm run db:migrate` | failed / ok | Primeira tentativa falhou porque o Supabase estava pausado; retry aprovado pelo operador aplicou a migration. |
| `npm run db:seed` | ok | Seedou 8 prompts totais e 36 pesos `f4_*`. |
| `npm run test:opportunity-gate` | ok | Casos `trend_only` e `weak_signal` OK. |
| Smoke endpoints via `fetch` local | ok | `CRON_SECRET` usado sem logar valor. |
| Playwright MCP rotas | ok | Funil + legado F3 sem tela branca/console error crítico. |

## 5. Packages installed

Nenhum.

## 6. Migrations proposed / applied

- **Arquivo:** `src/db/migrations/0004_dashing_blonde_phantom.sql`.
- **Status:** applied.
- **Banco alvo:** dev.
- **SQL preview entregue ao operador antes de aplicar?** sim.
- **Resumo do schema afetado:** cria tabelas F4A, índices, FK de `ideas.opportunity_id`, índice ivfflat parcial em `evidences.embedding`, colunas `ideas.opportunity_id` e `ideas.gate_state`.

Snapshot read-only após apply/seed:

- `manual_inputs`: 1
- `evidences`: 3
- `trend_candidates`: 7
- `need_clusters`: 1
- `opportunity_cards`: 1
- `opportunity_evidences`: 2
- `motor_runtime_state`: 1
- `weights` com `f4_%`: 36
- Prompts F4A seedados: P-EVI-001, P-TRD-001, P-OPP-001

Opportunity real HN-only criada no smoke:

- `opportunity_cards.id`: `8350026b-524d-47b0-84c8-afa64dcf34f5`
- `topic_label`: "The seed oil panic is hurting my cardiac patients"
- `gate_state`: `opportunity_candidate`
- `source_confidence`: `0.400`
- `evidence_count`: 2
- `source_count`: 1

Esta evidência valida a estrutura do motor F4A (evidence -> need_cluster -> opportunity_card), **não valida mercado**.

## 7. Env vars introduced or changed

Nenhuma.

`.env.example` atualizado? não.

## 8. Tests / checks run

- Automatizados:
  - `npm run typecheck`: ok
  - `npm run lint`: ok
  - `npm run test:opportunity-gate`: ok
  - `npm run build`: ok
- Endpoints:
  - `POST /api/cron/build-evidence`: 200, `runId=4c458120-31d5-4363-9056-9ec8618e3f54`, `adapted=0`, `costUsd=0`.
  - `POST /api/cron/score-opportunities`: 200, `runId=54fdd78f-4b30-4d56-9a74-3303a6f6008a`, `created=0`, `costUsd=0`.
  - `POST /api/manual/analyze` sem sessão: 401 esperado.
  - `POST /api/manual/analyze` autenticado via Playwright: 200, criou `manual_input` e `manual_seed`.
  - `POST /api/cron/build-evidence` após manual: 200, `runId=8cb082d5-b35b-4988-befe-478574c17b15`, gerou 4 `trend_candidates`.
- Pipeline HN real executado diretamente em dev:
  - `collect_hn`: `runId=12beba65-7141-4a26-a782-2f220a6d649a`, `processed=200`, `inserted=200`, `candidates=57`.
  - `extract`: `runId=b59d4c01-2c9d-49e2-a281-1aefcedbd7a4`, `processed=10`, `inserted=10`, `embedded=1`.
  - `build_evidence`: `runId=df716dbf-4d12-4fc3-b687-c940fd79a630`, `adapted=2`, `clusters=1`, `assigned=2`.
  - `score_opportunities`: `runId=9efce384-e497-4327-920b-6e87f883db9c`, `created=1`.
- Rotas Funil validadas com Playwright:
  - `/funil/radar`
  - `/funil/watch-topics`
  - `/funil/manual`
  - `/funil/trends`
  - `/funil/need-clusters`
  - `/funil/opportunities`
  - `/funil/source-confidence`
- Rotas F3 legadas validadas com Playwright:
  - `/dashboard`, `/ranking`, `/filtradas`, `/sinais`, `/clusters`, `/runs`, `/custos`, `/fontes`, `/pesos`, `/blacklist`, `/prompts`, `/configuracoes`, `/coleta`.
- Resultado Playwright: rotas carregam, sem tela branca, estados vazios aparecem, sem erro crítico de console.

## 9. AI cost in this phase

- Período: 2026-05-28..2026-05-28.
- Mês corrente: 2026-05.
- Budget mensal vigente: US$ 5.00 (fonte: `cost_budgets.monthly_budget_usd` + ENV; alvo típico F4/F5 conforme D-16).
- Gasto acumulado no mês: US$ 0.062792.
- Gasto incremental desta rodada F4A de smoke/pipeline real: ~US$ 0.001823.
- Operações usadas no smoke real:
  - `extract`: 10 chamadas, ~US$ 0.001196.
  - `filter_ai`: 9 chamadas, ~US$ 0.000384.
  - `embedding`: 1 chamada, custo arredondado para US$ 0.000000.
  - `evidence_extract`: 1 chamada, ~US$ 0.000122.
  - `opportunity_score`: 1 chamada, ~US$ 0.000121.

## 10. Known issues

- `manual_seed` criado pelo endpoint manual não possui embedding e não deve elevar `source_confidence`; por isso não forma `need_cluster` sozinho nesta implementação.
- A opportunity criada é HN-only (`source_confidence=0.400`) e valida apenas a estrutura do motor. Não representa validação real de mercado.
- Warning do build sobre plugin Next.js no ESLint config permanece como débito crônico já conhecido.
- O índice ivfflat foi criado com pouco dado e o Postgres emitiu notice de baixa recall; esperado em dev vazio.

## 11. Deviations from plan

- **O que mudou:** P-TRD-001 foi criado e seedado, mas não foi ativado no cron.
- **Por que mudou:** decisão operacional do operador nesta etapa: manter desligado por controle de custo e ativar futuramente apenas para top-N tópicos.
- **Risco aceito:** trends usam scoring determinístico sem resumo IA por enquanto.
- **Aprovação:** sim, operador solicitou manter P-TRD desligado nesta etapa.

- **O que mudou:** transições de gate em F4A atualizam `opportunity_cards.reason_codes`, mas não gravam histórico em `feedback`.
- **Por que mudou:** `feedback` polimórfico é escopo F4C; a tabela atual ainda é acoplada a `idea_id`.
- **Risco aceito:** auditoria completa de transições fica pendente até F4C.
- **Aprovação:** alinhado ao escopo serial F4A/F4C.

- **O que mudou:** parser de `PoppResultSchema.suggested_gate_hint` passou a ignorar valores inválidos.
- **Por que mudou:** P-OPP retornou texto livre nesse campo opcional, causando falha do score. O campo não é usado para decidir gate; a state machine determinística segue intacta.
- **Risco aceito:** baixo; validação segue forte nos campos usados pelo motor (`launchability_score`, `risk_penalty`, `axis_notes`).
- **Aprovação:** correção técnica necessária durante smoke real HN.

## 12. Open questions

- Ativar P-TRD-001 futuramente para top-N tópicos com limite explícito de custo.
- Continuar rodando coletas reais em baixo volume para observar estabilidade de oportunidades HN-only pós-cutoff.
- Definir se o manual analysis deve gerar embedding em fase futura ou permanecer apenas audit seed.

## 13. Next recommended step

> Acionar Agent 5 para revisão da F4A contra PRD, arquitetura F4 e gates do brief.

## 14. Reviewer requested

- Reviewer: Agent 5.
- Foco recomendado da review:
  - Migration `0004` e compatibilidade com F3 legado.
  - Regra de cutoff do adapter `signals -> evidences` sem backfill.
  - Source Confidence HN-only/manual-watch.
  - UI `/funil/*` e estados vazios.
  - Endpoints cron com `CRON_SECRET` e ausência de exposição de segredo.
  - Pendência P-TRD desligado por custo.

