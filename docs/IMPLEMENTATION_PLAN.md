# GoMVP V1 — Implementation Plan

> **Versão:** 1.1 (rodada 7 do PRD).
> **Status:** F0/F1/F2/F3 concluídas (`approved_with_minors` em todas). **F4A, F4B, F4UX e F4OPS concluídas (`approved_with_minors`)**. Antes da próxima fase funcional, formalizar `staging`/`feature/*` para Preview/staging. F5 segue como Source Expansion (PH > Reddit > YouTube > Reviews). Hardening fica em F6. Para o estado vivo do projeto, ver [`docs/PROJECT_STATE.md`](PROJECT_STATE.md).
> **Fonte canônica:** [`docs/PRD.md`](PRD.md). Detalhes de arquitetura F4: [`docs/architecture/F4_OPPORTUNITY_MOTOR.md`](architecture/F4_OPPORTUNITY_MOTOR.md). Roadmap F5: [`docs/architecture/F5_SOURCE_EXPANSION.md`](architecture/F5_SOURCE_EXPANSION.md). Em qualquer divergência, o **PRD vence**.

---

## Mapa de fases e ownership

| Fase | Owner agente | Brief | Handback gerado | Revisor |
|---|---|---|---|---|
| F0 Fundação | Agent 2 | [`docs/agents/AGENT_2_F0_FUNDACAO.md`](agents/AGENT_2_F0_FUNDACAO.md) | `docs/handback/F0_DONE.md` | Agent 5 |
| F1 Coleta HN | Agent 3 | [`docs/agents/AGENT_3_F1_COLETA_HN.md`](agents/AGENT_3_F1_COLETA_HN.md) | `docs/handback/F1_DONE.md` | Agent 5 |
| F2 IA + Ideias (legado) | Agent 4 | [`docs/agents/AGENT_4_F2_IA_IDEIAS.md`](agents/AGENT_4_F2_IA_IDEIAS.md) | `docs/handback/F2_DONE.md` | Agent 5 |
| F3 Painel + Ações | Agent 6 | [`docs/agents/AGENT_6_F3_UI.md`](agents/AGENT_6_F3_UI.md) | [`docs/handback/F3_DONE.md`](handback/F3_DONE.md) | Agent 5 |
| F3 QA | Agent 7 | [`docs/agents/AGENT_7_QA.md`](agents/AGENT_7_QA.md) | [`docs/handback/F3_QA_DONE.md`](handback/F3_QA_DONE.md) | Agent 5 |
| **F4A Motor + Evidence Layer (HN-only)** | **Agent 8** | [`docs/agents/AGENT_8_F4A_MOTOR.md`](agents/AGENT_8_F4A_MOTOR.md) | `docs/handback/F4A_DONE.md` | Agent 5 |
| **F4B Cross-source Google Trends** | **Agent 9** | [`docs/agents/AGENT_9_F4B_TRENDS.md`](agents/AGENT_9_F4B_TRENDS.md) | `docs/handback/F4B_DONE.md` | Agent 5 |
| **F4UX Funil UX / Operator Clarity** | **Agent 10** | [`docs/agents/AGENT_10_F4UX_FUNNEL_UI.md`](agents/AGENT_10_F4UX_FUNNEL_UI.md) | `docs/handback/F4UX_DONE.md` | Agent 5 |
| **F4OPS Vercel Preview / Staging** | **Agent 12** | [`docs/agents/AGENT_12_F4OPS_VERCEL_STAGING.md`](agents/AGENT_12_F4OPS_VERCEL_STAGING.md) | `docs/handback/F4OPS_DONE.md` | Agent 5 |
| **F4C Feedback + Idea/Brief gates** | **Agent 11** | [`docs/agents/AGENT_11_F4C_FEEDBACK.md`](agents/AGENT_11_F4C_FEEDBACK.md) | `docs/handback/F4C_DONE.md` | Agent 5 |
| F5A Product Hunt | a definir | a definir | `docs/handback/F5A_DONE.md` | Agent 5 |
| F5B Reddit | a definir | a definir | `docs/handback/F5B_DONE.md` | Agent 5 |
| F5C YouTube | a definir | a definir | `docs/handback/F5C_DONE.md` | Agent 5 |
| F5D Reviews | a definir | a definir | `docs/handback/F5D_DONE.md` | Agent 5 |
| F6 Hardening | a definir | a definir | `docs/handback/F6_DONE.md` | Agent 5 |

Sequência **estritamente serial** dentro do bloco F4 (F4A → F4B → F4UX → F4OPS → F4C). F4C só entra antes de F4OPS se o operador pular F4OPS explicitamente. F5 também serial (F5A → F5B → F5C → F5D), uma fonte por vez sob aprovação. F6 ao final.

---

## Guardrails permanentes (Apêndice E do PRD)

Aplicam-se a **todas as fases** e nunca podem ser violados sem aprovação escrita do operador:

1. Estrutura **flat** em `src/...` na raiz. Sem monorepo, sem `apps/web/`.
2. Toda migration é **gerada via `drizzle-kit generate`** e **exibida em SQL ao operador antes de aplicar**. **Não há autorização genérica** para aplicar migrations: cada arquivo/migration precisa de **aprovação explícita e específica** do operador. `db:migrate` só roda após essa aprovação.
3. Nenhum `git commit`, `git push` ou PR sem aprovação explícita do operador.
4. Nenhum MCP é dependência runtime. Toda integração de produção é via SDK direto ou fetch da API pública.
5. Toda chamada de IA passa por `assertBudget()` e grava em `ai_usage_logs` com `prompt_version` salvo.
6. Prompts versionados; alterar prompt em produção exige nova versão (`002`, `003`, ...). Nunca editar versão já usada.
7. F1 **não roda IA paga** e **não cria `signals`**. IA e `signals` começam em F2.
8. F2 começa **HN-only**; demais coletores (PH, RSS, Apple RSS, Stack Exchange, manual) entram **um por vez sob aprovação**, depois que HN estiver estável de ponta-a-ponta.
9. Blacklist sempre ativa após F1. Ranking principal só mostra itens sem `blacklist_tags`. Itens filtrados ficam em aba **Filtradas** (auditoria).
10. Vercel Cron é o **único orquestrador** na V1. `pg_cron` e Supabase Scheduled Functions ficam fora.
11. **Teto de IA** configurável via **ENV** (ex.: `AI_MONTHLY_BUDGET_USD`) e `cost_budgets.monthly_budget_usd`. Na validação **F4/F5** do motor, o **alvo operacional** documentado é **US$ 5/mês** (D-16) — **não** tratar como constante hardcoded eterna no produto. Thresholds fixos sobre o budget vigente: **0.80 warning**, **0.90 auto-stop em cron**, **1.00 hard-stop**.
12. Nenhum dado pessoal sensível persistido. Retenção: 30d `raw_items`, 90d `signals`, 180d `ideas`/`briefs`, 365d `ai_usage_logs`.
13. `category_bonus` e `preference_affinity` cap em ±0.05 cada. Não dominam o score.
14. Pacote NPM novo exige justificativa explícita (operação simples > sofisticação).

---

## Convenções operacionais

### Branching e commits

- Após F4OPS, o fluxo oficial é:
  - `main` = produção e Vercel Production Deploy.
  - `staging` = homologação/teste fixo do operador com Preview Deploy recorrente.
  - `feature/*` = branches de trabalho dos agentes, uma feature/fase por branch.
- Este fechamento F4OPS ainda entra direto em `main` por decisão explícita do operador; o novo branching vale para próximas features.
- Agentes devem declarar a branch antes de iniciar e não trabalhar direto em `main` em fases grandes sem aprovação explícita.
- Features aprovadas entram em `staging`; o operador testa; `staging` só entra em `main` quando o operador quiser promover para produção.
- Mensagens de commit em PT ou EN, imperativo, escopo claro: `feat(collectors): add algolia HN paginated fetcher`.
- Commits **só com aprovação humana**.

### Migrations

- Numeração sequencial: `0000_*.sql` (F0), `0001_*.sql` (F1), `0002_*.sql` (F2 — habilita pgvector e cria `signals`), e assim por diante.
- Cada migration tem nome semântico curto: `0000_init_foundation`, `0001_collect_storage`, `0002_ai_signals_clusters_ideas`.
- Migration revertível sempre que possível; quando não for, registrar nota no handback.

### ENVs

Toda variável nova entra em `.env.example` no PR/handback que a introduz. Server-only **nunca** ganha prefixo `NEXT_PUBLIC_`. Apenas valores realmente públicos (Supabase URL e anon key) são `NEXT_PUBLIC_`.

### Logging

- `runs` registra cada execução de cron/manual com `kind`, `started_at`, `finished_at`, `status`, `items_in/out`, `cost_usd`, `triggered_by`.
- `ai_usage_logs` registra **toda** chamada de IA (mesmo failed/cached) com `operation`, `model`, `tokens_in/out`, `estimated_cost_usd`, `prompt_version`, `status`, `latency_ms`.
- `runs.cost_usd` deve bater com a soma de `ai_usage_logs.estimated_cost_usd` da run.

### Custos

- Cada novo `kind` de run estima custo antes de rodar e respeita o budget mensal vigente (`cost_budgets.current_spend_usd / monthly_budget_usd`).
- `assertBudget(ctx)` é chamado **antes** de qualquer chamada IA. Em F0 isso só significa garantir que o helper existe e está testado.

### Testes

- Sem framework de testes em F0/F1 por padrão. F2+ pode propor adoção de `vitest` para extração/scoring (mas instalação só com aprovação).
- Validações críticas (e.g., thresholds do `assertBudget`) ficam em `scripts/test-*.ts` rodáveis com `tsx`.

---

## F0 — Fundação

**Owner:** Agent 2. **Brief:** [`docs/agents/AGENT_2_F0_FUNDACAO.md`](agents/AGENT_2_F0_FUNDACAO.md). **Tempo estimado:** 1–2 dias.

### Entregáveis

- Repositório local com Next.js 15 + TS estrito + Tailwind + shadcn/ui + ESLint/Prettier.
- Estrutura flat em `src/` conforme PRD §16, com pastas vazias `collectors/`, `pipeline/`, `feedback/`, `prompts/` (apenas `.gitkeep`).
- Drizzle + drizzle-kit configurados.
- Tabelas `runs`, `ai_usage_logs`, `cost_budgets` (e nada mais) conforme PRD §17.
- `cost_budgets` com seed idempotente do mês corrente: US$ 50, thresholds 0.80/0.90/1.00.
- Camada `AIProvider` (`src/ai/provider.ts`, `src/ai/openai.ts`, `src/ai/budget.ts`).
- Helper `withRun({ kind, triggeredBy, fn })` em `src/lib/runs.ts`.
- Supabase Auth funcional (1 conta operadora). Rota `(dashboard)` protegida. `/login` com email+senha. Botão de logout em "Hello GoMVP".
- `vercel.json` com `crons: []` e endpoint `/api/cron/health` validando `CRON_SECRET`.
- `.env.example` completo. `README.md` mínimo.

### Fora de escopo F0

- Qualquer coletor.
- Qualquer chamada real à OpenAI.
- Qualquer tabela de F1+ (`sources`, `raw_items`, `signals`, `clusters`, `ideas`, `briefs`, `weights`, `prompts`, `feedback`, `blacklist_terms`).
- Habilitar `pgvector`.
- Telas de F3+.

### Gates F0 (PRD Apêndice C)

- [ ] `npm install` completa sem erro.
- [ ] `npm run typecheck` passa.
- [ ] `npm run lint` passa.
- [ ] `npm run build` passa.
- [ ] `npm run dev` sobe em `http://localhost:3000`.
- [ ] `/` redireciona para `/dashboard` (autenticado) ou `/login` (anônimo).
- [ ] Login email+senha de uma conta no Supabase Auth funciona.
- [ ] `(dashboard)/page.tsx` mostra "Hello GoMVP" + botão logout.
- [ ] Logout volta para `/login`.
- [ ] Migration `0000_*.sql` exibida ao operador antes de aplicar.
- [ ] Migration aplicada no Supabase **dev**: cria `runs`, `ai_usage_logs`, `cost_budgets` com índices e defaults do PRD §17.
- [ ] `pgvector` **NÃO** habilitado.
- [ ] `db:seed` cria/atualiza linha em `cost_budgets` do mês corrente (US$ 50, 0.80/0.90/1.00).
- [ ] `assertBudget()` testado em script local nos 4 níveis: 78% (ok) / 82% (warning) / 92% (auto_stopped, libera manual) / 100% (hard_stopped, bloqueia tudo).
- [ ] `vercel.json` com `crons: []` e `/api/cron/health` aceitando apenas chamada com `Authorization: Bearer $CRON_SECRET`.

### Saída de F0

- `docs/handback/F0_DONE.md` com: resumo, lista de arquivos, snapshot do `package.json`, SQL aplicado, status de cada gate, evidência de teste do `assertBudget`, próximo passo (acionar Agent 5).
- Operador aciona Agent 5 com "Revisar F0".
- Após `approved` do Agent 5, F0 está fechada e operador pode acionar Agent 3.

---

## F1 — Coleta HN + Storage (sem IA)

**Owner:** Agent 3. **Brief:** [`docs/agents/AGENT_3_F1_COLETA_HN.md`](agents/AGENT_3_F1_COLETA_HN.md). **Tempo estimado:** 3–5 dias.

### Entregáveis

- Migration `0001_*.sql`: tabelas `sources`, `raw_items`, `blacklist_terms`. **Não cria `signals`.**
- Seed inicial de `blacklist_terms` cobrindo as 16 categorias do PRD §6.1 em PT+EN.
- Coletor `src/collectors/algolia-hn.ts` paginado, com cap diário e log em `runs(kind='collect_hn')`.
- Pipeline:
  - `src/pipeline/normalize.ts` — HN → `raw_items`.
  - `src/pipeline/dedupe.ts` — `hash_url` + `hash_text_norm` (lowercase, trim, sem stopwords, normalização Unicode).
  - `src/pipeline/filter.ts` — regras (idioma, tamanho mínimo, keywords bloqueadas).
  - `src/pipeline/blacklist.ts` — keyword/regex sobre `raw_items.blacklist_tags`.
- Tela "Coleta / Raw Items / Candidatos" somente leitura, com filtros (todos/filtrados/candidatos/blacklist) e link para fonte.
- Endpoint `/api/cron/collect-hn` protegido por `CRON_SECRET`. `vercel.json` com cron `0 11 * * 1,4` (sob aprovação).

### Gates F1

- [ ] Migration `0001_*.sql` exibida e aplicada com aprovação.
- [ ] ≥ 100 `raw_items` por execução **ou** ≥ 50 candidatos pós-filtro/execução.
- [ ] Dedupe < 5% em 2 execuções consecutivas no mesmo intervalo.
- [ ] **Custo IA = US$ 0** (verificar `ai_usage_logs` vazio para o período).
- [ ] Endpoint cron retorna 401 sem header e 200 com `Authorization: Bearer $CRON_SECRET`.
- [ ] Tela "Coleta" funcional, filtros visíveis, links de fonte clicáveis.
- [ ] Blacklist seedada com 16 categorias e aplica corretamente sobre `raw_items`.
- [ ] Nenhum outro coletor (PH/RSS/Apple/StackExchange/manual) introduzido.

### Saída de F1

- `docs/handback/F1_DONE.md` + revisão do Agent 5 + aprovação → operador aciona Agent 4.

---

## F2 — IA + Embeddings + Clusters + Ideias

**Owner:** Agent 4. **Brief:** [`docs/agents/AGENT_4_F2_IA_IDEIAS.md`](agents/AGENT_4_F2_IA_IDEIAS.md). **Tempo estimado:** 4–6 dias. **Início HN-only.**

### Entregáveis

- Migration `0002_*.sql`: habilita `pgvector`, cria `signals`, `clusters`, `signal_cluster`, `ideas`, `idea_signals`, `briefs`, `weights`, `prompts`, `feedback`. Adiciona índices ivfflat em `signals.embedding`, GIN em `signals.blacklist_tags` e `ideas.blacklist_tags`, `ideas(total_score DESC)`, `ideas(is_filtered_out)`.
- Seed de `weights` (defaults somando 1.0 + `category_bonus = 0.05`).
- Seed dos 5 prompts versão `001` (P-FIL-001, P-EXT-001, P-CLU-001, P-IDE-001, P-BRF-001) em `src/prompts/` e em tabela `prompts`.
- `src/pipeline/extract.ts` — gera `signals` a partir de `raw_items` candidatos, via P-EXT-001.
- `src/pipeline/filterAi.ts` — filtro híbrido (regras + IA leve em itens ambíguos), via P-FIL-001.
- `src/pipeline/cluster.ts` — cosine ≥ 0.78 (threshold em `weights`) + P-CLU-001.
- `src/pipeline/ideaGen.ts` — P-IDE-001, até 3 ideias por cluster, blacklist re-aplicada.
- `src/pipeline/score.ts` — scoring determinístico + `category_bonus`. Recalculável on-demand.
- Todas as chamadas IA passam por `assertBudget()` e gravam `ai_usage_logs` com `prompt_version='001'`.

### Gates F2

- [ ] Migration `0002_*.sql` aplicada com aprovação. `pgvector` ativo. ivfflat criado.
- [ ] ≥ 20 ideias/execução em JSON válido (validado com Zod).
- [ ] Cada chamada IA aparece em `ai_usage_logs` com `prompt_version='001'`.
- [ ] `runs.cost_usd` agregado bate com soma de `ai_usage_logs.estimated_cost_usd` da run.
- [ ] Threshold de orçamento bloqueia em teste (forçar `current_spend_usd ≥ 0.90 × budget` em cron e ≥ 1.00 em qualquer trigger).
- [ ] `ideas` com `blacklist_tags` ficam com `is_filtered_out = true`.
- [ ] Nenhum coletor adicional fora HN.
- [ ] Nenhuma tela de F3+ adiantada.

### Saída de F2

- `docs/handback/F2_DONE.md` + revisão do Agent 5 + aprovação. Apenas após aprovação, operador decide se introduz próximo coletor (PH, RSS, Apple, StackExchange, manual) **um por vez sob aprovação**.

---

## F3 — Painel + Ações

**Owner:** Agent 6 ([`docs/agents/AGENT_6_F3_UI.md`](agents/AGENT_6_F3_UI.md)). **Status:** DONE (`approved_with_minors`). Handback em [`docs/handback/F3_DONE.md`](handback/F3_DONE.md), review em [`docs/handback/F3_REVIEW.md`](handback/F3_REVIEW.md). **Tempo realizado:** dentro da estimativa.

### Entregáveis

- Telas PT-BR conforme PRD §18: Dashboard, Ranking principal (top 30), aba **Filtradas**, Detalhe da ideia, Custos, Sources (CRUD), Weights, Blacklist (CRUD), Sinais (debug), Clusters, Runs, Prompts (read-only).
- Ações no detalhe da ideia: aprovar, rejeitar, promissora, snooze (default 30d), nota.
- Botão "recalcular scores" na tela Weights.

### Gates F3

- [ ] 30 ideias revisadas em ≤ 30 min em fluxo manual.
- [ ] Aba Filtradas mostra motivo de blacklist por ideia.
- [ ] Tela Custos mostra gasto vs. budget e últimas 50 `ai_usage_logs`.
- [ ] Reversão manual de item filtrado exige nota e funciona.

---

## F4A — Motor Base / Evidence Layer (HN-only)

**Owner:** Agent 8 ([`docs/agents/AGENT_8_F4A_MOTOR.md`](agents/AGENT_8_F4A_MOTOR.md)). **Tempo estimado:** 5–7 dias.

Ver detalhes técnicos em [`docs/architecture/F4_OPPORTUNITY_MOTOR.md`](architecture/F4_OPPORTUNITY_MOTOR.md) §13 (F4A) e brief operacional do Agent 8.

### Entregáveis (resumo)

- Migration `0004_*.sql`: `watch_topics`, `manual_inputs`, `evidences`, `evidence_clusters`, `trend_candidates`, `need_clusters`, `opportunity_cards`, `opportunity_evidences`. Adição de `opportunity_id`/`gate_state` em `ideas`. Adição de `'evidence'` em `blacklist_terms.scope`.
- Pasta nova `src/sources/` (`hn/signal-to-evidence`, `manual/normalizer`, `watch/normalizer`).
- Pasta nova `src/motor/` (`evidence-store`, `trend-engine`, `need-cluster`, `opportunity-score`, `opportunity-gate`, `prompts`).
- Prompts versão `001`: `P-EVI-001`, `P-TRD-001`, `P-OPP-001` (seedados em `prompts`).
- Endpoints: `/api/cron/build-evidence`, `/api/cron/score-opportunities`, `/api/manual/analyze` (este último fora do cron, autenticado).
- Pesos `f4_*` seedados.
- Grupo de UI **Funil** (8 rotas): radar, watch-topics, manual, trends, need-clusters, opportunities, opportunities/[id], source-confidence.
- F3 legado intacto e marcado com badge `LEGADO`.

### Gates F4A

- [ ] Adapter `signals → evidences` processa **apenas sinais novos** (sem backfill retroativo). Smoke em dev: adaptar corretamente todos os sinais novos elegíveis no período; se houver menos de 10, registrar como **dados insuficientes**, não falha. Validar lote ≥ **10** com fixture/dev seed controlado quando necessário.
- [ ] ≥ 1 `opportunity_card` criada a partir de `need_cluster` válido. **`qualified_opportunity` não é obrigatório em F4A HN-only**; F4A valida estrutura do motor, não mercado amplo.
- [ ] Em **F4A (HN-only):** toda opportunity exibida como candidata/qualificada comunica **Baixa confiança de fonte** (ou equivalente).
- [ ] **`source_confidence ≤ 0.40` em 100% das opportunities** (assertion HN-only).
- [ ] Manual analysis end-to-end ok.
- [ ] Motor **rejeita** opportunity com `blacklist_tags`, categoria bloqueada, alto risco ou `not_indielab_fit`: `launchability_score` zero/quase zero, `gate_state='rejected'`, `reason_codes` preenchidos. Saúde/médico/regulatório/desinformação sensível é exemplo, não regra especial.
- [ ] State machine de gates testada (`scripts/test-opportunity-gate.ts`) e o script encerra sozinho.
- [ ] `assertBudget()` continua bloqueando.
- [ ] F3 legado sem regressão.
- [ ] Custo IA agregado da rodada de teste compatível com o **cap vigente** em dev (cenário típico D-16: ≤ US$ 0,10 incremental na fase).

---

## F4B — Cross-source com Google Trends

**Owner:** Agent 9 ([`docs/agents/AGENT_9_F4B_TRENDS.md`](agents/AGENT_9_F4B_TRENDS.md)). **Tempo estimado:** 4–6 dias.

### Entregáveis (resumo)

- Pasta `src/sources/gtrends/` (`README.md`, `collector.ts`, `normalizer.ts`).
- Endpoint `/api/cron/collect-trends` + atualização de `vercel.json`.
- Evidence `search_momentum` populando.
- Atualização em `opportunity-score` para considerar Trends em `trend_score`.
- Atualização UI em `/funil/trends` e `/funil/source-confidence`.
- Adapter `gtrends` reutilizável por trigger: cron geral (descoberta top/rising), `watch_topics` (lista monitorada) e `manual_inputs` (enriquecimento on-demand), quando houver provider aprovado para o modo necessário. Manual/watch não contam como fonte externa nem elevam `source_confidence`.

### Gates F4B

- [ ] Pelo menos 1 evidence `search_momentum` de `gtrends` persistida em dev e visível no evidence trace.
- [ ] Fluxo com `watch_topics` demonstrado como seed monitorada, sem elevar `source_confidence` por si só.
- [ ] Fluxo manual on-demand demonstrado ou documentado como bloqueado por falta de provider de lookup arbitrário aprovado.
- [ ] Evidence externa `gtrends` no mesmo `topic_key` participa corretamente do cálculo/trace de Source Confidence.
- [ ] **Meta operacional, não blocker absoluto:** ≥ 30 evidences `search_momentum`/dia em dev por 3 execuções; se não atingir, documentar limitação e pedir decisão do operador.
- [ ] **Meta operacional:** ≥ 1 `opportunity_card` com `source_confidence ≥ 0.65` (HN + GT); se não atingir, explicar se a causa é dados, match, fórmula ou threshold.
- [ ] Caso "trend forte sem dor" → `gate_state='trend_only'` correto.
- [ ] Caso "dor sem trend" → `gate_state='pain_candidate'` correto.
- [ ] Custo IA da fase em dev ≤ US$ 0,30.

---

## F4UX — Funil UX / Operator Clarity

**Owner:** Agent 10 ([`docs/agents/AGENT_10_F4UX_FUNNEL_UI.md`](agents/AGENT_10_F4UX_FUNNEL_UI.md)). **Status:** DONE (`approved_with_minors`) após [`docs/handback/F4UX_REVIEW.md`](handback/F4UX_REVIEW.md). **Tempo estimado:** fase curta.

### Entregáveis (resumo)

- Navegação/sidebar orientada pelo fluxo do MOTOR, não por source.
- Funil como fluxo principal: Radar → Evidências → Tendências → Dores agrupadas → Oportunidades → Ideias → Briefs.
- Legado F3 visualmente secundário, com labels claros.
- Auditabilidade genérica de `evidences` e Evidence Trace.
- Microcopy/estados vazios explicando baixa confiança, ausência de overlap, rejeições/filtros, manual/watch como seeds e próximo passo operacional.
- Nenhuma tela/menu específico para Google Trends, Product Hunt, Reddit, YouTube ou Reviews.

### Gates F4UX

- [ ] Operador consegue entender rapidamente o que o MOTOR encontrou e quais evidences sustentam cada item.
- [ ] UI explica origem/source de cada evidence sem organizar o produto por source.
- [ ] UI mostra/explica ausência de overlap e baixa confiança sem falsear validação.
- [ ] Funil, Legado, Configurações/Sistema e Fontes/Source Confidence ficam claramente separados.
- [ ] Não altera motor, scoring, schema, migrations, collectors, cron, feedback, ideias, briefs ou F5.
- [x] `npm run typecheck`, `npm run lint` e `npm run build` passaram após `npm install`.
- [x] Agent 5 confirmou F4UX como `approved_with_minors`.

---

## F4OPS — Vercel Preview / Staging + Performance Validation

**Owner:** Agent 12 ([`docs/agents/AGENT_12_F4OPS_VERCEL_STAGING.md`](agents/AGENT_12_F4OPS_VERCEL_STAGING.md)). **Status:** DONE (`approved_with_minors`) após [`docs/handback/F4OPS_REVIEW.md`](handback/F4OPS_REVIEW.md). **Tempo estimado:** fase curta.

### Entregáveis (resumo)

- Projeto Vercel configurado ou configuração existente validada, sob aprovação operacional do operador.
- Fluxo Git documentado: branch de feature → Preview Deploy → merge em `main` → Production.
- Env vars mapeadas por ambiente (`Production`, `Preview`, `Development`) sem registrar valores reais.
- Build validado em Vercel Preview.
- Login/Auth e rotas principais validadas em URL pública de Preview.
- Performance percebida comparada entre Vercel Preview e localhost.
- Gargalos documentados com propostas de correção, sem mexer em motor/scoring/schema/sources.
- Checklist de rollback documentado.
- Fix pós-review: `/funil/radar` passa a ser home operacional principal; `/dashboard` permanece legado/F3.

### Gates F4OPS

- [x] Projeto builda na Vercel Production em `main` (commit `450ca86`) e deploy está `Ready`.
- [x] App abre em URL pública: `https://mvp-2-go.vercel.app`.
- [x] Login/rotas protegidas funcionam no nível validado: `/login` 200, redirects anônimos e logs autenticados 200.
- [x] Rotas principais carregam sem 5xx recentes nos logs Vercel.
- [x] Não há tela branca nem erro crítico de server logs no smoke.
- [x] Navegação/performance comparada com localhost; Vercel muito mais rápida.
- [x] Gargalos documentados: lentidão parece majoritariamente localhost/dev server.
- [x] Cron Google Trends continua desligado.
- [x] Secrets não aparecem em docs/logs.
- [x] Motor/scoring/schema/migrations/sources não foram alterados.
- [ ] Branch `staging` fixa e Preview recorrente ainda precisam ser criados/validados antes das próximas features.

---

## F4C — Feedback estruturado + Idea/Brief gates

**Owner:** Agent 11 ([`docs/agents/AGENT_11_F4C_FEEDBACK.md`](agents/AGENT_11_F4C_FEEDBACK.md)). **Tempo estimado:** 3–5 dias.

### Entregáveis (resumo)

- Migration `0006_*.sql`: `feedback` polimórfico (`target_kind`, `target_id`, `reason_code`, `gate_after`) + backfill seguro do legado.
- Prompts versão `001`: `P-IDE-002`, `P-BRF-002` (P-IDE-001/P-BRF-001 mantidos).
- `src/motor/idea-from-opportunity.ts`, `src/motor/brief-from-idea.ts`.
- Endpoints `/api/funil/ideas/generate`, `/api/funil/brief/generate` (autenticados, fora do cron).
- UI: ações de aprovação/rejeição em opportunities/ideas exigem `reason_code`.
- Novas rotas `/funil/ideas`, `/funil/ideas/[id]`, `/funil/briefs`, `/funil/feedback-history`.
- Few-shot dinâmico em P-OPP-001 e P-IDE-002. Embeddings de preferência cap ±0.05.

### Gates F4C

- [ ] Backfill `feedback` legado validado: `count(*) WHERE target_kind IS NULL = 0`.
- [ ] Reason code obrigatório em toda transição (validação Zod).
- [ ] Idea só nasce com `opportunity_id NOT NULL` quando criada via funil.
- [ ] Brief só nasce com `idea.gate_state='idea_allowed'`.
- [ ] 2 ciclos de feedback movem `opportunity_score` médio do top-10.
- [ ] Custo IA da fase em dev ≤ US$ 0,50.

---

## F5 — Source Expansion (incremental)

Detalhes em [`docs/architecture/F5_SOURCE_EXPANSION.md`](architecture/F5_SOURCE_EXPANSION.md). Ordem: **PH > Reddit > YouTube > Reviews**. RSS/Apple/Stack Exchange ficam como backup.

Cada fonte segue o padrão `src/sources/<source>/` + endpoint `/api/cron/collect-<source>` + atualização de `sources` (uma linha) + handback dedicado (`F5x_DONE.md`) + revisão Agent 5.

**F5 não altera o motor.** Se exigir, parar e escalar Agent 0.

---

## F6 — Hardening

**Owner:** a definir. **Tempo estimado:** 2–3 dias.

### Entregáveis

- Kill switch testado E2E no **cap mensal vigente** configurado (cenário típico de validação F4/F5: US$ 5/mês).
- Retries idempotentes em coletores e pipeline.
- Alertas (e-mail/webhook) em warning de orçamento e em falha de coleta consecutiva.
- Job de retenção 30/90/180/365d. Endpoint de purge por `source_url`.
- `RUNBOOK.md`. Backup do banco testado em sandbox.

### Gates F6

- [ ] Hard cap dispara em teste; alerta chega.
- [ ] Retenção limpa janela esperada sem corromper dados.
- [ ] Restauração de backup em sandbox sobe banco em estado coerente.
- [ ] Endpoint de purge por URL remove registros conforme LGPD.

---

## Ordem de execução resumida

```
F0 → F1 → F2 → F3 → (DONE até aqui)
   → F4A (motor + evidence + opportunity, HN-only) → Agent 5 → approved
   → F4B (Google Trends, cross-source) → Agent 5 → approved
   → F4UX (funil UX / operator clarity) → Agent 5 → approved
   → F4OPS (Vercel Preview / staging + performance) → Agent 5 → approved
   → Branch workflow (main/staging/feature) → operador aprova
   → F4C (feedback + idea/brief gates) → Agent 5 → approved  [F4 fechada]
   → F5A (Product Hunt) → Agent 5 → approved
   → F5B (Reddit) → Agent 5 → approved
   → F5C (YouTube) → Agent 5 → approved
   → F5D (Reviews) → Agent 5 → approved
   → F6 (hardening) → Agent 5 → approved
   → V1 GA interno V2
```

---

## Critérios de sucesso da V1 V2 (PRD §22)

- Pipeline roda 2x/semana sem intervenção em ≥ 90% das execuções.
- ≥ 70% do top-10 do **funil de oportunidades** julgado "vale aprofundar".
- ≥ 4 **opportunities aprovadas/mês**.
- ≥ 2 **ideias aprovadas/mês** a partir de opportunity.
- ≥ 1 MVP construído/mês a partir do GoMVP.
- **Custo IA real ≤ cap mensal vigente** (na validação F4/F5, alvo típico US$ 5/mês — D-16; valor por ENV/`cost_budgets`).
- Operação ≤ 30 min/dia (KPI 30).
- ≥ 50% das opportunities qualified com `source_confidence ≥ 0.65` após F4B em produção.
