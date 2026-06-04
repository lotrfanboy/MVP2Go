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
| **Current phase** | Pós-F4OPS — Branching/Deployment workflow |
| **Last completed phase** | F4OPS — Vercel Preview / Staging + Performance Validation, aprovado com minors após review Agent 5 |
| **Active agent** | Agent 0 — encerramento F4OPS + formalização de `main`/`staging`/`feature/*` |
| **Last reviewer agent** | Agent 5 — revisou F4OPS como `approved_with_minors` em [`handback/F4OPS_REVIEW.md`](handback/F4OPS_REVIEW.md) e o fix de home/redirect em [`handback/F4OPS_HOME_REDIRECT_FIX_REVIEW.md`](handback/F4OPS_HOME_REDIRECT_FIX_REVIEW.md). |
| **Current branch** | `main` |
| **Last updated** | 2026-06-04 (F4OPS approved_with_minors; branching/deploy workflow em formalização) |

## Status por fase

| Fase | Brief | Handback | Review | Status |
|---|---|---|---|---|
| F0 — Fundação | [`agents/AGENT_2_F0_FUNDACAO.md`](agents/AGENT_2_F0_FUNDACAO.md) | [`handback/F0_DONE.md`](handback/F0_DONE.md) | [`handback/F0_REVIEW.md`](handback/F0_REVIEW.md) | DONE (`approved_with_minors`) |
| F1 — Coleta HN | [`agents/AGENT_3_F1_COLETA_HN.md`](agents/AGENT_3_F1_COLETA_HN.md) | [`handback/F1_DONE.md`](handback/F1_DONE.md) | [`handback/F1_REVIEW.md`](handback/F1_REVIEW.md) | DONE (`approved_with_minors`) |
| F2 — IA + Ideias (legado) | [`agents/AGENT_4_F2_IA_IDEIAS.md`](agents/AGENT_4_F2_IA_IDEIAS.md) | [`handback/F2_DONE.md`](handback/F2_DONE.md) | [`handback/F2_REVIEW.md`](handback/F2_REVIEW.md) | DONE (`approved_with_minors`) |
| F3 — Painel + Ações | Agent 6 ([`agents/AGENT_6_F3_UI.md`](agents/AGENT_6_F3_UI.md)) | [`handback/F3_DONE.md`](handback/F3_DONE.md) + [`handback/F3_QA_DONE.md`](handback/F3_QA_DONE.md) | [`handback/F3_REVIEW.md`](handback/F3_REVIEW.md) + [`handback/F3_QA_REVIEW_BY_AGENT5.md`](handback/F3_QA_REVIEW_BY_AGENT5.md) | DONE (`approved_with_minors`) |
| **F4A — Motor + Evidence Layer (HN-only)** | [`agents/AGENT_8_F4A_MOTOR.md`](agents/AGENT_8_F4A_MOTOR.md) + fix [`agents/AGENT_8_5_F4A_FIX.md`](agents/AGENT_8_5_F4A_FIX.md) | [`handback/F4A_DONE.md`](handback/F4A_DONE.md) + [`handback/F4A_FIX_DONE.md`](handback/F4A_FIX_DONE.md) | [`handback/F4A_REVIEW.md`](handback/F4A_REVIEW.md) + [`handback/F4A_FIX_REVIEW.md`](handback/F4A_FIX_REVIEW.md) | DONE (`approved_with_minors`) |
| **F4B — Cross-source Google Trends** | [`agents/AGENT_9_F4B_TRENDS.md`](agents/AGENT_9_F4B_TRENDS.md) | [`handback/F4B_DONE.md`](handback/F4B_DONE.md) + checkpoints GT | [`handback/F4B_REVIEW.md`](handback/F4B_REVIEW.md) | DONE (`approved_with_minors`) |
| **F4UX — Funil UX / Operator Clarity** | [`agents/AGENT_10_F4UX_FUNNEL_UI.md`](agents/AGENT_10_F4UX_FUNNEL_UI.md) | [`handback/F4UX_DONE.md`](handback/F4UX_DONE.md) | [`handback/F4UX_REVIEW.md`](handback/F4UX_REVIEW.md) | DONE (`approved_with_minors`) |
| **F4OPS — Vercel Preview / Staging + Performance Validation** | [`agents/AGENT_12_F4OPS_VERCEL_STAGING.md`](agents/AGENT_12_F4OPS_VERCEL_STAGING.md) | [`handback/F4OPS_DONE.md`](handback/F4OPS_DONE.md) + [`handback/F4OPS_HOME_REDIRECT_FIX.md`](handback/F4OPS_HOME_REDIRECT_FIX.md) | [`handback/F4OPS_REVIEW.md`](handback/F4OPS_REVIEW.md) + [`handback/F4OPS_HOME_REDIRECT_FIX_REVIEW.md`](handback/F4OPS_HOME_REDIRECT_FIX_REVIEW.md) | DONE (`approved_with_minors`) |
| **F4C — Feedback + Idea/Brief gates** | [`agents/AGENT_11_F4C_FEEDBACK.md`](agents/AGENT_11_F4C_FEEDBACK.md) | — | — | PENDING (após formalizar branch/staging workflow e aprovação explícita do operador) |
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
- `src/app/dashboard/page.tsx` antigo **removido** (rota duplicada). Em F4OPS, `src/app/(dashboard)/page.tsx` também foi removido por duplicar a raiz `/`; `src/app/page.tsx` controla o redirect principal e `/dashboard` segue em `src/app/(dashboard)/dashboard/page.tsx`.

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
- Briefs de implementação F4: `agents/AGENT_8_F4A_MOTOR.md`, `agents/AGENT_9_F4B_TRENDS.md`, `agents/AGENT_11_F4C_FEEDBACK.md`; F4UX adiciona `agents/AGENT_10_F4UX_FUNNEL_UI.md`.
- PRD atualizado para rodada 7 (visão idea→opportunity, fluxo evidence layer, scoring multi-axis, KPI custo IA US$ 5/mês, plano F4A/B/C + F5 source expansion + F6 hardening).
- DECISIONS atualizado com **D-11..D-20** e princípios **DP-15..DP-24** (opportunity-first, evidence layer, scoring multi-axis, cross-source obrigatório, gates+reasons, cap configurável, nova ordem de fontes, F4A estrutural, source adapter ≠ trigger, navegação orientada pelo MOTOR e Preview/Staging antes de novas mudanças profundas). **D-08 substituída** por D-16. **O-01/O-12** registrados.
- IMPLEMENTATION_PLAN reescrito com fases novas.
- AGENTS.md atualizado com Agent 8/9/10/11.
- Handback do redesign em `handback/AGENT_0_F4_REDESIGN.md`.

**Gate atual:**

1. ~~F4A implementada e corrigida.~~ **Aprovada com minors** após Agent 8.5 + review Agent 5.
2. ~~F4B implementada e revisada.~~ **Aprovada com minors** após Agent 9 + review Agent 5.
3. ~~F4UX implementada pelo Codex e revisada pelo Agent 5.~~ **Aprovada com minors** em [`handback/F4UX_REVIEW.md`](handback/F4UX_REVIEW.md).
4. ~~Antes de F4C/F5, executar **F4OPS** para validar Vercel Preview/Staging, performance real e fluxo branch → preview → main/produção.~~ **F4OPS aprovada com minors** em 2026-06-04.
5. F4OPS validou Production URL `https://mvp-2-go.vercel.app`, commit `450ca86`, deploy `Ready`, build Vercel sem ENOENT, login/redirects básicos, rotas protegidas, logs sem 5xx recentes e performance muito melhor que localhost.
6. F4OPS confirmou que a lentidão principal parece ligada ao localhost/dev server, não ao app hospedado.
7. Fix pós-review definiu `/funil/radar` como home operacional principal no código local; `/dashboard` segue como rota legada/F3. Review Agent 5 aprovou o fix com minor: precisa novo deploy/smoke público para confirmar a URL pública com o comportamento novo.
8. Novo fluxo de branches/deploy passa a valer para próximas features: `main` = produção, `staging` = teste/homologação fixo, `feature/*` = trabalho de agentes.

## Reviews pendentes

Nenhuma review de fase pendente. Antes de qualquer fase funcional nova, formalizar/pushar o workflow `staging`/`feature/*` e validar Preview da branch `staging`.

## Blockers conhecidos

- **B-01** — ~~Repositório local não é um git workspace.~~ **Resolvido em 2026-05-06**: commit `41c6212` em `origin/main`.
- **B-02** — ~~Documentação produto desatualizada (F0 vs F2).~~ **Resolvido em 2026-05-05**.
- **B-03** — ~~Figma MCP não configurado.~~ **Mitigado**: F3 entregue sem Figma MCP, com base em Figma Make + brief textual.
- **B-04** — ~~Arquivo Figma ainda não existe.~~ **Mitigado**: idem B-03.
- **B-05** — ~~Mudanças da F3 ainda não commitadas em git.~~ **Resolvido** em 2026-05-06 (`713d773`, `d2dc898`, push em `origin/main`).
- **B-06** — ~~PRD §3 alterado fora do escopo permitido (US$ 50→5).~~ **Resolvido** em 2026-05-06 (KPI restaurado para US$ 50). **Reaberto e re-resolvido** via **D-16**: teto de IA como **cap operacional configurável** (ENV + `cost_budgets`); **alvo típico** na validação F4/F5 do motor **US$ 5/mês** — não constante hardcoded no produto.
- **B-07** — ~~Rodada 7 do PRD ainda não commitada em git.~~ **Resolvido**: documentação rodada 7 commitada/pushada antes de iniciar Agent 8.
- **B-08** — ~~F4A rejected / gate oficial precisava ajuste.~~ **Resolvido** por D-18 + Agent 8.5: F4A aprovada com minors; F4B também já foi concluída.
- **B-09** — ~~F4B dependia de Google Trends como segunda fonte mínima.~~ **Resolvido** por Agent 9 + review Agent 5: F4B aprovada com minors; `source_confidence >= 0.65` não foi demonstrado por falta de overlap real GT+HN, mas isso é meta operacional, não blocker absoluto.
- **B-10** — ~~Localhost/Next dev instável e lento para uso operacional.~~ **Mitigado por F4OPS:** Vercel Production ficou muito mais rápida; localhost/dev server permanece lento, mas não bloqueia uso hospedado.
- **B-11** — ~~Preview Deploy inicial precisava validar remoção de rota raiz duplicada/redirect legado.~~ **Resolvido por F4OPS:** commit `450ca86` buildou na Vercel sem ENOENT.
- **B-12** — Branch `staging` fixa e Preview recorrente ainda não existem. **Mitigação:** documentar workflow agora e criar/pushar `staging` depois do commit atual em `main`, antes da próxima feature.

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
- **R-14** **Custo/configuração de Google Trends em F4B** — mitigado por approval-first do Agent 9: BigQuery public dataset como caminho preferencial, estimativa de custo BigQuery/API antes de editar, `assertBudget()` para IA, cap **vigente** (ENV/`cost_budgets`; alvo típico validação F4/F5 US$ 5 — D-16) e escalonamento se lookup arbitrário exigir provider pago/não aprovado.
- **R-15** **Schema F4A grande** — mitigado por migration única, idempotente, exibida em SQL (DP-02). Sem `DROP`. Apenas `CREATE` + `ALTER ADD COLUMN nullable`.
- **R-16** **Pipeline legado quebrar com adapter `signals → evidences`** — mitigado por executar adapter no mesmo handler de `extract` (sucesso/falha conjunto).
- **R-17** **Reabertura de PRD** — feita conscientemente nesta rodada com decisões D-11..D-20 e DP-24 explícitas. Toda mudança nominalmente justificada.
- **R-18** **F4B sem overlap real GT+HN** — aceito como minor em `F4B_REVIEW.md`: BigQuery Top/Rising inseriu `gtrends:search_momentum`, mas não cruzou com HN/need clusters atuais. Não falsear dados; `source_confidence >= 0.65` fica dependente de dados/match futuro.
- **R-19** **Cron Google Trends desligado** — decisão prudente: `/api/cron/collect-trends` existe e é protegido por `CRON_SECRET`, mas não está em `vercel.json` até decisão operacional sobre custo/cadência/caps.
- **R-20** ~~Funil operacional confuso antes de feedback.~~ **Mitigado** por F4UX; Agent 5 aprovou com minors.
- **R-21** ~~Performance real desconhecida fora do localhost~~ — **Mitigado por F4OPS**: Vercel Production respondeu muito melhor que localhost em smoke básico; manter monitoramento em staging.
- **R-22** **Deploy acionar automações indevidas** — F4OPS manteve cron Google Trends desligado e não alterou `vercel.json`, envs, motor, schema, sources ou migrations. Risco permanece para futuras mudanças de deploy.
- **R-23** **Feature futura ir direto para produção** — mitigação nova: agentes devem trabalhar em `feature/*`, mergear em `staging` para Preview/staging e só promover para `main` com aprovação do operador.
- **R-24** **Node Vercel 24.x automático** — minor F4OPS. Avaliar pin explícito de Node 20/22 em tarefa operacional separada, se a variabilidade virar problema.

## Próxima ação recomendada

1. Commitar e pushar em `main` tudo que já foi feito até o fechamento F4OPS: handbacks/reviews, docs, fix de home/redirect para `/funil/radar`.
2. Após `main` limpo, criar/pushar branch `staging` a partir de `main` e configurar/validar Preview recorrente da Vercel para `staging`.
3. A partir da próxima feature, agentes trabalham em `feature/*`, mergeiam em `staging` para teste do operador, e só então `staging` entra em `main` com aprovação explícita.
4. Não iniciar F4M, F4C ou F5 até o operador aprovar a próxima fase funcional.

## Do Not Do Yet

Bloqueios duros até nova aprovação:

- Nenhuma fase futura adiantada antes da formalização do workflow `staging`/`feature/*` e aprovação explícita do operador (F4M, F4C, F5x, F6 só nas suas vezes).
- Nenhuma fonte nova além das já implementadas; F4UX não cria collectors nem integrações.
- Não ativar cron Google Trends em `vercel.json` até decisão operacional explícita.
- Não configurar Vercel, Railway ou secrets neste chat Agent 0; apenas documentar workflow e comandos.
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
- OQ-11 — **Cadência de `/api/cron/collect-trends`**: F4B manteve cron GT desligado. Decisão futura: ativar ou não em `vercel.json`, com qual cadência e cap BigQuery.
- OQ-14 — **Lookup de tópico arbitrário em Trends**: BigQuery public dataset cobre apenas Top/Rising. Provider alternativo oficial/pago só entra com aprovação futura específica; F4UX/F4C não devem reabrir isso.
- OQ-15 — ~~Ambiente de dados do Preview/Staging~~ **Fechada temporariamente em F4OPS:** usar Supabase dev atual para Preview/Staging por enquanto; reavaliar se houver risco operacional.
- OQ-16 — ~~Causa da lentidão~~ **Mitigada em F4OPS:** lentidão parece majoritariamente localhost/dev server.
- OQ-17 — **Criação da branch `staging`:** criar a partir de `main` após o commit atual e validar Preview recorrente na Vercel antes da próxima feature.
- OQ-12 — **Quando `/coleta` legada some?** Mantida em F4A. Considerar deprecar em F5+ se redundante com `/funil/manual` + `/funil/source-confidence`.
- OQ-13 — **F4A inclui badge `LEGADO` em quais telas exatamente?** Sugestão Agent 0: Dashboard, Ranking, Filtradas, Detalhe da Ideia, Brief MVP, Sinais, Clusters. Não em Custos, Configurações, Fontes, Pesos, Blacklist, Prompts (são compartilhadas legado+novo). Confirmar em F4A.

## Status labels usados

- **DONE** — entregue, com handback e review aprovados.
- **IN_PROGRESS** — execução ativa de algum agente.
- **PENDING_REVIEW** — handback entregue, aguardando Agent 5.
- **PENDING** — fase ainda não iniciada.
- **BLOCKED** — bloqueio externo conhecido.
- **UNKNOWN** — sem evidência suficiente para classificar.
