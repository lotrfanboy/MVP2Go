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
| **Current phase** | F3 — Painel + Ações (não iniciada) |
| **Last completed phase** | F2 — IA + Embeddings + Clusters + Ideias |
| **Active agent** | Agent 0 (Orchestrator) preparando entrada da F3 |
| **Last reviewer agent** | Agent 5 — fechou F2 com `approved_with_minors` |
| **Current branch** | UNKNOWN — diretório não é git workspace local (`git rev-parse` retornou `not a git repository`) |
| **Last updated** | 2026-05-05 |

## Status por fase

| Fase | Brief | Handback | Review | Status |
|---|---|---|---|---|
| F0 — Fundação | [`agents/AGENT_2_F0_FUNDACAO.md`](agents/AGENT_2_F0_FUNDACAO.md) | [`handback/F0_DONE.md`](handback/F0_DONE.md) | [`handback/F0_REVIEW.md`](handback/F0_REVIEW.md) | DONE (`approved_with_minors`) |
| F1 — Coleta HN | [`agents/AGENT_3_F1_COLETA_HN.md`](agents/AGENT_3_F1_COLETA_HN.md) | [`handback/F1_DONE.md`](handback/F1_DONE.md) | [`handback/F1_REVIEW.md`](handback/F1_REVIEW.md) | DONE (`approved_with_minors`) |
| F2 — IA + Ideias | [`agents/AGENT_4_F2_IA_IDEIAS.md`](agents/AGENT_4_F2_IA_IDEIAS.md) | [`handback/F2_DONE.md`](handback/F2_DONE.md) | [`handback/F2_REVIEW.md`](handback/F2_REVIEW.md) | DONE (`approved_with_minors`) |
| F3 — Painel + Ações | a definir (proposta: Agent 6 — UI/UX) | — | — | PENDING |
| F4 — Feedback + Brief | a definir | — | — | PENDING |
| F5 — Hardening | a definir | — | — | PENDING |

## Trabalho concluído (resumo verificável)

Evidência cruzada com handbacks e arquivos no repositório:

- Repositório com Next.js 15 + TS estrito + Tailwind + shadcn/ui em `src/` (estrutura flat conforme PRD §16).
- Tabelas F0 (`runs`, `ai_usage_logs`, `cost_budgets`) criadas e seedadas.
- `AIProvider` + `OpenAIProvider` + `assertBudget()` implementados (`src/ai/*`).
- Auth Supabase funcional, dashboard mínimo "Hello GoMVP" e logout.
- Coletor `algolia-hn.ts`, dedupe determinístico, filtros por regra e blacklist seedada (16 categorias) ativos.
- Tela "Coleta / Raw Items / Candidatos" em `/coleta`.
- Migration F2 aplicada com `pgvector`, `signals`, `clusters`, `signal_cluster`, `ideas`, `idea_signals`, `briefs`, `weights`, `prompts`, `feedback`.
- 5 prompts versão `001` (P-EXT, P-FIL, P-CLU, P-IDE, P-BRF) versionados em `src/prompts/` e seedados em `prompts`.
- Pipeline IA F2 (`extract`, `embed`, `filter_ai`, `cluster`, `ideaGen`, `ideas-blacklist`, `score`).
- Cron F2 endpoints `/api/cron/extract` e `/api/cron/generate` registrados em `vercel.json`.
- Snapshot validado em dev (F2_DONE): `signals=168`, `clusters=23`, `ideas=101..119`, `ai_usage_logs` populando com `prompt_version='001'`.

## Trabalho em andamento

Nenhum trabalho de fase em andamento no momento. Etapa atual é **camada de controle/documentação** sob Agent 0.

## Reviews pendentes

Nenhuma review pendente. Próxima review prevista: F3, após handback de Agent 6 (a ser confirmado).

## Blockers conhecidos

- **B-01** — Repositório local não é um git workspace (`git rev-parse` falha). Sem `.git`, não há rastreabilidade de branch/diff. Não bloqueia F3, mas precisa decisão do operador.
- **B-02** — Documentação produto desatualizada antes desta rodada (README e Implementation Plan referenciavam F0). Endereçado por Agent 0 nesta rodada (atualização parcial sob aprovação).

## Riscos conhecidos

- **R-01** Scope creep em F3 — Painel e ações têm muitas telas (PRD §18). Risco de adicionar features além do PRD. Mitigação: `docs/AGENTS.md` define escopo do Agent 6 e `docs/NEXT_STEPS.md` lista entregáveis explícitos.
- **R-02** Drift de prompts versionados — qualquer alteração precisa criar `002`, não editar `001`.
- **R-03** Divergência de budget (50 vs 5 em dev) — dev override documentado em `DECISIONS.md` como nota operacional. Produção continua US$ 50.
- **R-04** Falta de docs para Agent 6 (UI/UX) e Agent 7 (QA Frontend/Playwright). Mitigado em parte por `docs/AGENTS.md`; briefs detalhados continuam pendentes.
- **R-05** Warning recorrente de ESLint/Next no build (MINOR registrado em F0/F1/F2 reviews). Não bloqueia, mas merece higienização em F3 ou separadamente.
- **R-06** LGPD — retenção 30/90/180/365d e endpoint de purge ainda em F5. Manter como guardrail visível em decisões.
- **R-07** Dependência operacional de cron — Vercel Cron é único orquestrador. Falha consecutiva precisa de alerta (vem em F5).

## Próxima ação recomendada

1. Operador valida esta camada de controle.
2. Agent 0 prepara o brief do **Agent 6 — F3 Painel + Ações** com escopo derivado do PRD §18 e Implementation Plan F3.
3. Operador aprova brief de F3 antes de qualquer código.

## Do Not Do Yet

Bloqueios duros até nova aprovação:

- Nenhum coletor adicional além de HN. PH, RSS, Apple RSS, Stack Exchange, manual entry só após HN estabilizar e operador aprovar caso a caso.
- Nenhuma feature de F4 (feedback + brief humano) ou F5 (hardening) adiantada.
- Nenhuma migration nova fora de F3 sem SQL preview + aprovação humana.
- Nenhum commit/push/PR sem aprovação explícita.
- Nenhuma alteração em prompts `001` já em produção. Para mudar, criar versão `002`.
- Nenhuma chamada IA fora dos pipelines existentes que ignore `assertBudget()`.

## Open questions

- OQ-01 — Operador quer adotar git local imediatamente, ou só ao iniciar F3?
- OQ-02 — Quando F3 terminar e antes de F4, vamos introduzir 1 coletor adicional? Se sim, qual prioridade (PH > RSS > Apple > Stack Exchange)?
- OQ-03 — Fonte de design para Agent 6: Figma será usado? Em qual nível (mockups / DS completo)?
- OQ-04 — Necessidade de Agent 7 (QA Playwright) já em F3 ou após F3 fechar?
- OQ-05 — Manter `AI_MONTHLY_BUDGET_USD=5` em dev até quando? Plano para subir para 50 antes de produção.

## Status labels usados

- **DONE** — entregue, com handback e review aprovados.
- **IN_PROGRESS** — execução ativa de algum agente.
- **PENDING_REVIEW** — handback entregue, aguardando Agent 5.
- **PENDING** — fase ainda não iniciada.
- **BLOCKED** — bloqueio externo conhecido.
- **UNKNOWN** — sem evidência suficiente para classificar.
