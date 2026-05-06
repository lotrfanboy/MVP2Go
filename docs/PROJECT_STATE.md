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
| **Current phase** | Pós-F3 QA concluído (`approved_with_minors`). Próxima fase prevista: F4 (sob aprovação do operador). |
| **Last completed phase** | F3 — Painel + Ações |
| **Active agent** | Agent 0 (Orchestrator) — consolidando pós-QA e preparando entrada da F4 |
| **Last reviewer agent** | Agent 5 — fechou QA estruturado de F3 com `approved_with_minors` |
| **Current branch** | `main` (`41c6212` + `713d773` + `d2dc898`, push concluído em `origin/main`) |
| **Last updated** | 2026-05-06 |

## Status por fase

| Fase | Brief | Handback | Review | Status |
|---|---|---|---|---|
| F0 — Fundação | [`agents/AGENT_2_F0_FUNDACAO.md`](agents/AGENT_2_F0_FUNDACAO.md) | [`handback/F0_DONE.md`](handback/F0_DONE.md) | [`handback/F0_REVIEW.md`](handback/F0_REVIEW.md) | DONE (`approved_with_minors`) |
| F1 — Coleta HN | [`agents/AGENT_3_F1_COLETA_HN.md`](agents/AGENT_3_F1_COLETA_HN.md) | [`handback/F1_DONE.md`](handback/F1_DONE.md) | [`handback/F1_REVIEW.md`](handback/F1_REVIEW.md) | DONE (`approved_with_minors`) |
| F2 — IA + Ideias | [`agents/AGENT_4_F2_IA_IDEIAS.md`](agents/AGENT_4_F2_IA_IDEIAS.md) | [`handback/F2_DONE.md`](handback/F2_DONE.md) | [`handback/F2_REVIEW.md`](handback/F2_REVIEW.md) | DONE (`approved_with_minors`) |
| F3 — Painel + Ações | Agent 6 — UI/UX ([`agents/AGENT_6_F3_UI.md`](agents/AGENT_6_F3_UI.md)) | [`handback/F3_DONE.md`](handback/F3_DONE.md) + [`handback/F3_QA_DONE.md`](handback/F3_QA_DONE.md) | [`handback/F3_REVIEW.md`](handback/F3_REVIEW.md) + [`handback/F3_QA_REVIEW_BY_AGENT5.md`](handback/F3_QA_REVIEW_BY_AGENT5.md) | DONE (`approved_with_minors`) |
| F4 — Feedback + Brief | a definir | — | — | PENDING |
| F5 — Hardening | a definir | — | — | PENDING |

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

- Budget mensal dev: **US$ 5,00** (override O-01).
- Gasto atual: **~US$ 0,061** (≈ 1,2% do budget).
- F3 não introduziu chamada IA nova — recálculo de score é determinístico em código.

## Trabalho em andamento

Nenhum trabalho de fase em andamento. F3 fechada (`approved_with_minors`). Aguardando decisão do operador sobre próxima fase (F4 vs novo coletor).

## Reviews pendentes

Nenhuma review pendente. O ciclo extra de QA estruturado de F3 também foi revisado pelo Agent 5.

## Blockers conhecidos

- **B-01** — ~~Repositório local não é um git workspace.~~ **Resolvido em 2026-05-06**: commit `41c6212` em `origin/main`.
- **B-02** — ~~Documentação produto desatualizada (F0 vs F2).~~ **Resolvido em 2026-05-05**.
- **B-03** — ~~Figma MCP não configurado.~~ **Mitigado**: F3 entregue sem Figma MCP, com base em Figma Make + brief textual (registrado como desvio aceito no F3_DONE §11).
- **B-04** — ~~Arquivo Figma ainda não existe.~~ **Mitigado**: idem B-03.
- **B-05** — ~~Mudanças da F3 ainda não commitadas em git.~~ **Resolvido** em 2026-05-06 (`713d773`, `d2dc898`, push em `origin/main`).
- **B-06** — ~~PRD §3 alterado fora do escopo permitido.~~ **Resolvido** em 2026-05-06 antes do commit da F3 (KPI canônico restaurado para US$ 50/mês).

## Riscos conhecidos

- **R-01** ~~Scope creep em F3.~~ **Verificado**: nenhuma fase futura adiantada. F3 ficou dentro do escopo do brief.
- **R-02** Drift de prompts versionados — sem alteração observada em F3.
- **R-03** Divergência de budget (50 vs 5 em dev) — em vigor (O-01).
- **R-04** ~~Validação E2E formal de F3 ainda parcial~~ **Resolvido** com `F3_QA_DONE.md` + `F3_QA_REVIEW_BY_AGENT5.md`.
- **R-05** **Warning persistente de ESLint/Next no build** — registrado em F0/F1/F2 e agora também F3 reviews. Já é débito técnico crônico. Sugestão: tratar fora do ciclo de fases, em uma "house-cleaning task".
- **R-06** LGPD — retenção 30/90/180/365d e endpoint de purge continuam em F5.
- **R-07** Dependência operacional de cron — Vercel Cron é único orquestrador.
- **R-08** **Estabilidade do dev server** — handback F3 reportou `EMAXCONNSESSION` (Postgres) e cache Next quebrado durante longas sessões. Mitigado pelo singleton em `db/index.ts` e `predev` limpando `.next`. Agent 5 confirmou que após ambiente limpo as rotas críticas respondem `200`. Risco persistente em sessões longas — observar.
- **R-09** ~~KPI operacional (30 ideias revisadas em ≤30min) não comprovado~~ **Resolvido** em QA estruturado de F3 (`30/30` reportado).
- **R-10** **Snooze sem `snoozed_until`** — UI mostra "snooze" via `feedback.action='snooze'`, sem expiração automática. Limite conhecido até migration aprovada (provavelmente em F4).
- **R-11** **Reversão de filtrada via override** — `feedback.action='unfilter_override'` mantém `blacklist_tags` intacta; é override de exibição. Garante reversão sem alterar schema, mas exige consciência de que ranking pode mostrar item filtrado se houver feedback registrado.

## Próxima ação recomendada

1. Operador decide entre 2 caminhos pós-F3:
   - **(A)** Iniciar F4 (Feedback dinâmico + Brief on-demand).
   - **(B)** Adicionar 1 coletor (PH, RSS, Apple ou Stack Exchange) antes de F4.
2. Recomendação default do Agent 0, após QA estruturado concluído: **(A)**.

## Do Not Do Yet

Bloqueios duros até nova aprovação:

- Nenhum coletor adicional além de HN. PH, RSS, Apple RSS, Stack Exchange, manual entry só após HN estabilizar e operador aprovar caso a caso.
- Nenhuma feature de F4 (feedback dinâmico + brief humano on-demand) ou F5 (hardening) adiantada.
- Nenhuma migration nova sem SQL preview + aprovação humana (inclui campos como `snoozed_until` que ficaram como gap em F3).
- Nenhum commit/push/PR sem aprovação explícita (DP-03).
- Nenhuma alteração em prompts `001` já em produção. Para mudar, criar versão `002`.
- Nenhuma chamada IA fora dos pipelines existentes que ignore `assertBudget()`.
- Sem pacote npm novo sem justificativa (DP-14). F3 fechou com **zero** novo pacote.

## Open questions

- OQ-01 — ~~Git local agora ou ao iniciar F3?~~ **Resolvido** em 2026-05-06.
- OQ-02 — Após F3, adicionar coletor antes de F4? **Pendente** (default sugerido: não, focar em F4).
- OQ-03 — ~~Figma usado? Em que nível?~~ **Resolvido** (O-05).
- OQ-04 — ~~Agent 7 entra agora ou só em F4/F5?~~ **Resolvido:** Agent 7 será usado agora, entre F3 e F4.
- OQ-05 — Manter `AI_MONTHLY_BUDGET_USD=5` em dev até quando? **Decisão pendente.** Sem urgência.
- OQ-06 — ~~Operador vai criar Figma e configurar Figma MCP?~~ **Resolvido**: Agent 6 entregou F3 com Figma Make + brief textual, sem Figma MCP. Eventual divergência visual fina é débito conhecido (F3_DONE §11).
- OQ-07 — **Quando o ESLint/Next plugin warning vai virar tarefa formal?** Está em todos os reviews desde F0. Sugestão: criar uma "house-cleaning task" não-fásica.
- OQ-08 — **`/coleta` continua como rota legada acessível ou some?** Decisão registrada em **O-09** (mantida fora da nav, acessível por URL direto).
- OQ-09 — **Comportamento do snooze** depende de migration `snoozed_until`. Quando aprovar?

## Status labels usados

- **DONE** — entregue, com handback e review aprovados.
- **IN_PROGRESS** — execução ativa de algum agente.
- **PENDING_REVIEW** — handback entregue, aguardando Agent 5.
- **PENDING** — fase ainda não iniciada.
- **BLOCKED** — bloqueio externo conhecido.
- **UNKNOWN** — sem evidência suficiente para classificar.
