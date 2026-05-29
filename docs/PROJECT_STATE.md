# GoMVP — PROJECT STATE

> Documento de estado operacional do projeto. Mantido pelo **Agent 0 (Orchestrator)**.
> Não é fonte canônica de produto: o PRD em [`docs/PRD.md`](PRD.md) prevalece.

---

## Identidade

- **Projeto:** GoMVP V1 (Built2Go).
- **Tipo:** ferramenta interna, web-first, single-operator.
- **Stack:** Next.js 15 App Router + TypeScript estrito + Tailwind + shadcn/ui + Supabase (Postgres + Auth, `pgvector` em F2) + Drizzle ORM + OpenAI via `AIProvider` + Vercel + Vercel Cron.

## Fase corrente

| Campo | Valor |
|---|---|
| **Current phase** | F4A — Opportunity Motor em correção. Agent 8 entregou F4A, Agent 5 revisou como `rejected`; Agent 0 reavaliou o gate e criou Agent 8.5 para correção antes de qualquer F4B. |
| **Last completed phase** | F3 — Painel + Ações (com QA estruturado) |
| **Active agent** | Agent 8.5 (próximo) — correção pontual da F4A conforme D-18; Agent 0 preparou o brief. |
| **Last reviewer agent** | Agent 5 — revisou F4A como `rejected` em [`handback/F4A_REVIEW.md`](handback/F4A_REVIEW.md). |
| **Current branch** | `main` |
| **Last updated** | 2026-05-28 (reavaliação F4A) |

## Status por fase

| Fase | Brief | Handback | Review | Status |
|---|---|---|---|---|
| F0 — Fundação | [`agents/AGENT_2_F0_FUNDACAO.md`](agents/AGENT_2_F0_FUNDACAO.md) | [`handback/F0_DONE.md`](handback/F0_DONE.md) | [`handback/F0_REVIEW.md`](handback/F0_REVIEW.md) | DONE (`approved_with_minors`) |
| F1 — Coleta HN | [`agents/AGENT_3_F1_COLETA_HN.md`](agents/AGENT_3_F1_COLETA_HN.md) | [`handback/F1_DONE.md`](handback/F1_DONE.md) | [`handback/F1_REVIEW.md`](handback/F1_REVIEW.md) | DONE (`approved_with_minors`) |
| F2 — IA + Ideias (legado) | [`agents/AGENT_4_F2_IA_IDEIAS.md`](agents/AGENT_4_F2_IA_IDEIAS.md) | [`handback/F2_DONE.md`](handback/F2_DONE.md) | [`handback/F2_REVIEW.md`](handback/F2_REVIEW.md) | DONE (`approved_with_minors`) |
| F3 — Painel + Ações | Agent 6 ([`agents/AGENT_6_F3_UI.md`](agents/AGENT_6_F3_UI.md)) | [`handback/F3_DONE.md`](handback/F3_DONE.md) + [`handback/F3_QA_DONE.md`](handback/F3_QA_DONE.md) | [`handback/F3_REVIEW.md`](handback/F3_REVIEW.md) + [`handback/F3_QA_REVIEW_BY_AGENT5.md`](handback/F3_QA_REVIEW_BY_AGENT5.md) | DONE (`approved_with_minors`) |
| **F4A — Motor + Evidence Layer (HN-only)** | [`agents/AGENT_8_F4A_MOTOR.md`](agents/AGENT_8_F4A_MOTOR.md) + fix [`agents/AGENT_8_5_F4A_FIX.md`](agents/AGENT_8_5_F4A_FIX.md) | [`handback/F4A_DONE.md`](handback/F4A_DONE.md); aguardando `F4A_FIX_DONE.md` | [`handback/F4A_REVIEW.md`](handback/F4A_REVIEW.md) + reavaliação Agent 0 | **NEEDS_CORRECTION** (Agent 8.5; não iniciar F4B) |
| **F4B — Cross-source Google Trends** | [`agents/AGENT_9_F4B_TRENDS.md`](agents/AGENT_9_F4B_TRENDS.md) | — | — | PENDING (após F4A) |
| **F4C — Feedback + Idea/Brief gates** | [`agents/AGENT_10_F4C_FEEDBACK.md`](agents/AGENT_10_F4C_FEEDBACK.md) | — | — | PENDING (após F4B) |
| F5A — Product Hunt | a definir | — | — | PENDING (após F4C) |
| F5B — Reddit | a definir | — | — | PENDING |
| F5C — YouTube | a definir | — | — | PENDING |
| F5D — Reviews | a definir | — | — | PENDING |
| F6 — Hardening | a definir | — | — | PENDING |

## Trabalho concluído (resumo verificável)

Evidência cruzada com handbacks e arquivos no repositório:

### F0 / F1 / F2 (já validadas)

- Repositório com Next.js 15 + TS estrito + Tailwind + shadcn/ui em `src/` (estrutura flat conforme PRD §16).
- Tabelas F0 (`runs`, `ai_usage_logs`, `cost_budgets`) criadas e seedadas.
- `AIProvider` + `OpenAIProvider` + `assertBudget()` implementados (`src/ai/*`).
- Auth Supabase funcional.
- Coletor `algolia-hn.ts`, dedupe determinístico, filtros por regra e blacklist seedada (16 categorias) ativos.
- Tela legada "Coleta / Raw Items / Candidatos" em `/coleta` preservada.
- Migration F2 aplicada com `pgvector`, `signals`, `clusters`, `signal_cluster`, `ideas`, `idea_signals`, `briefs`, `weights`, `prompts`, `feedback`.
- 5 prompts versão `001` (P-EXT, P-FIL, P-CLU, P-IDE, P-BRF) versionados em `src/prompts/` e seedados em `prompts`.
- Pipeline IA F2 (`extract`, `embed`, `filter_ai`, `cluster`, `ideaGen`, `ideas-blacklist`, `score`).
- Cron F2 endpoints `/api/cron/extract` e `/api/cron/generate` registrados em `vercel.json`.
- Snapshot validado em dev (F2_DONE): `signals=168`, `clusters=23`, `ideas≈119`.

### F3 — Painel + Ações (entregue por Agent 6, revisada por Agent 5)

**Shell de aplicação (novo):**

- `src/components/dashboard/app-shell.tsx`, `app-sidebar.tsx`, `app-topbar.tsx`, `budget-pill.tsx`, `nav-config.ts`, `nav-group.tsx`, `nav-item.tsx`.
- Auth gate centralizado em `(dashboard)/layout.tsx`.
- Sidebar com 4 grupos fixos (Operação, Pipeline, Configuração, Sistema) — conforme **O-06**.
- Topbar com **budget pill** lendo `cost_budgets` do mês (com fallback resiliente).
- Layout responsivo até `max-w-[1440px]`.
- Fallback global de loading/error em `(dashboard)/loading.tsx` e `(dashboard)/error.tsx`.
- `src/app/icon.tsx` adicionado para eliminar 404 de favicon.
- `src/app/dashboard/page.tsx` antigo **removido** (rota duplicada). `(dashboard)/page.tsx` agora redireciona para `/dashboard`.

**15 rotas implementadas no grupo `(dashboard)`:**

| # | Rota | Origem dos dados |
|---|---|---|
| 1 | `/dashboard` | `runs`, `ideas`, `cost_budgets`, `ai_usage_logs` |
| 2 | `/ranking` | `ideas` (com override de filtrada via `feedback`) |
| 3 | `/ideias/[id]` (`force-dynamic`) | `ideas`, `idea_signals`, `signals`, `raw_items`, `clusters`, `feedback` |
| 4 | `/filtradas` | `ideas` filtradas + reversão via Server Action |
| 5 | `/sinais` | `signals`, `raw_items`, `sources` |
| 6 | `/clusters` | `clusters`, `signal_cluster`, `signals`, `ideas` |
| 7 | `/runs` | `runs` + drill-down em `ai_usage_logs` |
| 8 | `/custos` | `cost_budgets`, `ai_usage_logs` |
| 9 | `/fontes` | CRUD `sources` via Server Actions |
| 10 | `/pesos` | `weights` editáveis + recálculo determinístico (`runScoreIdeas()`) |
| 11 | `/blacklist` | CRUD `blacklist_terms` |
| 12 | `/prompts` | `prompts` (read-only) |
| 13 | `/brief/[ideaId]` (`force-dynamic`) | `briefs`, `ideas` |
| 14 | `/configuracoes` | ENV read-only + perfil + sair |
| 15 | `/coleta` | rota legada da F1, preservada e funcional (sem entrada na sidebar) |

**Server Actions com Zod (sem migration nova):**

- `ideias/[id]/actions.ts` — aprovar / rejeitar / promissora / snooze (`status='snoozed'` + `feedback.action='snooze' + note`).
- `filtradas/actions.ts` — `feedback.action='unfilter_override'` + `note` obrigatória (3..2000 chars).
- `fontes/actions.ts`, `pesos/actions.ts`, `blacklist/actions.ts` — CRUD básico.

**Dev-loop hardening (decisões operacionais O-07/O-08):**

- `package.json`: porta fixa `next dev -p 3000` e `next start -p 3000`.
- `package.json`: `predev` limpa `.next` para evitar inconsistência de chunks.
- `src/db/index.ts`: cliente Postgres como singleton em `globalThis`, com `prepare:false` e `max:1` (mitiga `EMAXCONNSESSION` em dev sem alterar comportamento de produção).
- README atualizado documentando porta fixa.

**Custo IA agregado no encerramento da F3 (mês 2026-05):**

- Budget mensal dev no período F3: **US$ 5,00** (via `cost_budgets` + ENV; alvo típico D-16 na validação F4/F5 do motor — configurável).
- Gasto atual: **~US$ 0,061** (≈ 1,2% do budget).
- F3 não introduziu chamada IA nova — recálculo de score é determinístico em código.

## Trabalho em andamento

**Redesign F4/F5** entregue pelo Agent 0 nesta rodada (2026-05-06):

- Nova pasta `docs/architecture/` criada com `F4_OPPORTUNITY_MOTOR.md` e `F5_SOURCE_EXPANSION.md`.
- 3 novos briefs de implementação: `agents/AGENT_8_F4A_MOTOR.md`, `agents/AGENT_9_F4B_TRENDS.md`, `agents/AGENT_10_F4C_FEEDBACK.md`.
- PRD atualizado para rodada 7 (visão idea→opportunity, fluxo evidence layer, scoring multi-axis, KPI custo IA US$ 5/mês, plano F4A/B/C + F5 source expansion + F6 hardening).
- DECISIONS atualizado com **D-11..D-17** (mudança de visão, evidence layer, scoring multi-axis, cross-source obrigatório, gates+reasons, cap US$ 5, nova ordem de fontes). **D-08 substituída** por D-16. **O-01 encerrada**.
- IMPLEMENTATION_PLAN reescrito com fases novas.
- AGENTS.md atualizado com Agent 8/9/10.
- Handback do redesign em `handback/AGENT_0_F4_REDESIGN.md`.

**Aguardando do operador:**

1. ~~Validação dos docs entregues nesta rodada (rodada 7).~~ **Direção estratégica aprovada** (2026-05-09).
2. ~~Ativação inicial do Agent 8.~~ **F4A implementada e revisada como rejected**.
3. **Correção F4A pelo Agent 8.5** com o gate D-18: sem exigir `qualified_opportunity`, sem falsear volume, aplicando blacklist/domain-risk/`not_indielab_fit` antes de promover `opportunity_candidate`.

## Reviews pendentes

F4A tem review Agent 5 concluída como `rejected`. Próxima review: nova revisão Agent 5 após `F4A_FIX_DONE.md` do Agent 8.

## Blockers conhecidos

- **B-01** — ~~Repositório local não é um git workspace.~~ **Resolvido em 2026-05-06**: commit `41c6212` em `origin/main`.
- **B-02** — ~~Documentação produto desatualizada (F0 vs F2).~~ **Resolvido em 2026-05-05**.
- **B-03** — ~~Figma MCP não configurado.~~ **Mitigado**: F3 entregue sem Figma MCP, com base em Figma Make + brief textual.
- **B-04** — ~~Arquivo Figma ainda não existe.~~ **Mitigado**: idem B-03.
- **B-05** — ~~Mudanças da F3 ainda não commitadas em git.~~ **Resolvido** em 2026-05-06 (`713d773`, `d2dc898`, push em `origin/main`).
- **B-06** — ~~PRD §3 alterado fora do escopo permitido (US$ 50→5).~~ **Resolvido** em 2026-05-06 (KPI restaurado para US$ 50). **Reaberto e re-resolvido** via **D-16**: teto de IA como **cap operacional configurável** (ENV + `cost_budgets`); **alvo típico** na validação F4/F5 do motor **US$ 5/mês** — não constante hardcoded no produto.
- **B-07** — ~~Rodada 7 do PRD ainda não commitada em git.~~ **Resolvido**: documentação rodada 7 commitada/pushada antes de iniciar Agent 8.
- **B-08** — **F4A rejected / gate oficial precisava ajuste.** Agent 5 rejeitou por ausência de `qualified_opportunity` e <10 evidences; Agent 0 reclassificou parte disso como regra documental inadequada para HN-only. Bloqueios reais: opportunity com categoria bloqueada/alto risco passou como `opportunity_candidate`; `test:opportunity-gate` não encerra; cobertura de gate fraca.

## Riscos conhecidos

- **R-01** ~~Scope creep em F3.~~ **Verificado**: nenhuma fase futura adiantada.
- **R-02** Drift de prompts versionados — sem alteração observada. Em F4A/B/C novos prompts entram como versão `001` em arquivos novos (P-EVI, P-TRD, P-OPP, P-IDE-002, P-BRF-002), sem tocar legados.
- **R-03** ~~Divergência de budget (50 vs 5 em dev).~~ **Resolvido** por D-16: um único modelo de cap **configurável**; alvo típico documentado na validação F4/F5 é US$ 5/mês. O-01 encerrada.
- **R-04** ~~Validação E2E formal de F3 ainda parcial~~ **Resolvido**.
- **R-05** **Warning persistente de ESLint/Next no build** — débito crônico. Tratar fora do ciclo de fases.
- **R-06** LGPD — retenção 30/90/180/365d e endpoint de purge migram para **F6** (antes era F5).
- **R-07** Dependência operacional de cron — Vercel Cron é único orquestrador automático. F4A adiciona `/api/manual/analyze` autenticado, fora do cron.
- **R-08** **Estabilidade do dev server** — `EMAXCONNSESSION` mitigado por singleton de DB + `predev` limpando `.next`. Risco persistente em sessões longas — observar.
- **R-09** ~~KPI operacional (30 ideias revisadas em ≤30min) não comprovado~~ **Resolvido**.
- **R-10** **Snooze sem `snoozed_until`** em ideias legadas — limite conhecido. F4A introduz `opportunity_cards.snoozed_until` para o funil novo.
- **R-11** **Reversão de filtrada via override** — `feedback.action='unfilter_override'` mantém `blacklist_tags` intacta; override de exibição.
- **R-12** **Confusão entre `signals` e `evidences`** — alta criticidade. Mitigado por glossário em [`F4_OPPORTUNITY_MOTOR.md`](architecture/F4_OPPORTUNITY_MOTOR.md) §18, badge `LEGADO` na UI antiga, e DP-16 (decisão dura: nunca renomear ou substituir).
- **R-13** **Source Confidence inflada** — mitigado por cap automático no motor (`distinct_external==1 ⇒ ≤0.40`) e exclusão de manual/watch da contagem (D-14, RF-28).
- **R-14** **Custo IA explodir em F4B com Trends** — mitigado por `assertBudget()` + cap **vigente** (ENV/`cost_budgets`; alvo típico validação F4/F5 US$ 5 — D-16) + obrigação do Agent 9 medir antes de subir produção.
- **R-15** **Schema F4A grande** — mitigado por migration única, idempotente, exibida em SQL (DP-02). Sem `DROP`. Apenas `CREATE` + `ALTER ADD COLUMN nullable`.
- **R-16** **Pipeline legado quebrar com adapter `signals → evidences`** — mitigado por executar adapter no mesmo handler de `extract` (sucesso/falha conjunto).
- **R-17** **Reabertura de PRD** — feita conscientemente nesta rodada com decisões D-11..D-17 explícitas. Toda mudança nominalmente justificada.

## Próxima ação recomendada

1. Operador roda o prompt de [`agents/AGENT_8_5_F4A_FIX.md`](agents/AGENT_8_5_F4A_FIX.md) em chat dedicado para Agent 8.5.
2. Agent 8.5 corrige somente F4A: gate/blacklist/launchability/teste, sem iniciar F4B e sem nova fonte.
3. Agent 8.5 entrega `docs/handback/F4A_FIX_DONE.md`.
4. Agent 5 revisa F4A contra D-18 e critérios atualizados.
5. **Somente se F4A for approved/approved_with_minors**, ativar Agent 9 (F4B).
6. Após F4B done + revisão Agent 5 → ativar Agent 10 (F4C).
7. F4 fecha após F4C `approved`. Daí F5A.

## Do Not Do Yet

Bloqueios duros até nova aprovação:

- Nenhuma fase futura adiantada (F4B, F4C, F5x, F6 só nas suas vezes).
- Nenhum coletor novo enquanto F4A não fechar.
- Nenhuma migration nova sem SQL preview + **aprovação humana explícita e específica daquela migration** (Q-G).
- Nenhuma alteração em prompts `001` já em produção (P-EXT/P-FIL/P-CLU/P-IDE/P-BRF). Para mudar, criar versão `002`. P-EVI/P-TRD/P-OPP/P-IDE-002/P-BRF-002 entram como **arquivos novos** versão `001`.
- Nenhuma chamada IA fora dos pipelines existentes que ignore `assertBudget()`.
- Sem pacote npm novo sem justificativa (DP-14).
- Não substituir/renomear `signals` (DP-16).
- Não desligar pipeline legado F2 (`runIdeaGeneration`, P-IDE-001, P-BRF-001).
- Não tocar `.env*`, secrets, `mcp.json`.
- Nenhum commit/push/PR sem aprovação explícita (DP-03).

## Open questions

- OQ-01..OQ-08 — fechadas em rodadas anteriores.
- OQ-09 — ~~Snooze sem `snoozed_until`.~~ **Endereçado em F4A** via `opportunity_cards.snoozed_until` para o funil; legado mantém comportamento atual.
- OQ-10 — ~~**Backfill retroativo `signals → evidences` em F4A?**~~ **Fechada (operador 2026-05-09):** F4A processa **apenas sinais novos**; **sem** backfill retroativo. Backfill futuro = job manual opcional com dry-run e **aprovação separada** (ver [`AGENT_8_F4A_MOTOR.md`](agents/AGENT_8_F4A_MOTOR.md), RF-24).
- OQ-11 — **Cadência de `/api/cron/collect-trends` em F4B**: piggyback em seg/qui (15:00 entre `collect-hn` e `extract`) ou cron separado? Decisão fica para Agent 9 propor com base em rate limit Trends.
- OQ-12 — **Quando `/coleta` legada some?** Mantida em F4A. Considerar deprecar em F5+ se redundante com `/funil/manual` + `/funil/source-confidence`.
- OQ-13 — **F4A inclui badge `LEGADO` em quais telas exatamente?** Sugestão Agent 0: Dashboard, Ranking, Filtradas, Detalhe da Ideia, Brief MVP, Sinais, Clusters. Não em Custos, Configurações, Fontes, Pesos, Blacklist, Prompts (são compartilhadas legado+novo). Confirmar em F4A.

## Status labels usados

- **DONE** — entregue, com handback e review aprovados.
- **IN_PROGRESS** — execução ativa de algum agente.
- **PENDING_REVIEW** — handback entregue, aguardando Agent 5.
- **PENDING** — fase ainda não iniciada.
- **BLOCKED** — bloqueio externo conhecido.
- **UNKNOWN** — sem evidência suficiente para classificar.
