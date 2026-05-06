# GoMVP — AGENTS

> Mapa oficial dos agentes do projeto. Mantido pelo **Agent 0**.
> Cada agente tem responsabilidade única, escopo permitido e escopo proibido. Os briefs operacionais ficam em [`docs/agents/`](agents/).

---

## Princípios gerais

- Cada agente é instanciado **uma vez por fase ou gate**, nunca em paralelo dentro da mesma fase.
- Nenhum agente decide produto. Decisões fechadas estão em [`docs/DECISIONS.md`](DECISIONS.md) e no PRD.
- Nenhum agente toca produção. MCP nunca é runtime.
- Nenhum agente faz commit/push/PR/migration sem aprovação explícita do operador.
- Toda saída de implementação termina em handback usando [`docs/HANDOFF_TEMPLATE.md`](HANDOFF_TEMPLATE.md).
- Toda fase fecha com revisão de Agent 5.

---

## Agent 0 — Orchestrator / Project Lead

- **Brief:** [`docs/agents/AGENT_0_PL.MD`](agents/AGENT_0_PL.MD).
- **Responsabilidade:** auditar repo, manter docs de controle sincronizadas, preparar prompts dos próximos agentes, prevenir scope creep.
- **Allowed scope:**
  - Ler tudo.
  - Criar/atualizar **somente** docs em `docs/PROJECT_STATE.md`, `docs/DECISIONS.md`, `docs/AGENTS.md`, `docs/HANDOFF_TEMPLATE.md`, `docs/NEXT_STEPS.md` e `docs/agents/*.md`.
- **Forbidden scope:**
  - Implementar features.
  - Editar schema, migrations, pipeline, coletores, AI logic, scoring, cron.
  - Tocar `.env*` ou secrets.
  - Chamar OpenAI.
  - Commit/push/PR.
- **Input docs:** PRD, Implementation Plan, Decisions, Project State, Cursor Rules, handbacks anteriores.
- **Expected handback:** Atualização das docs de controle + recomendação de próxima ação + prompt copy-paste do próximo agente.
- **Quando usar:** no início do projeto, após cada handback de fase, e sempre que houver dúvida de coordenação.

---

## Agent 2 — F0 Foundation

- **Brief:** [`docs/agents/AGENT_2_F0_FUNDACAO.md`](agents/AGENT_2_F0_FUNDACAO.md).
- **Responsabilidade:** Fase F0 — Fundação técnica do repo.
- **Allowed scope:**
  - Next.js 15 + TS estrito + Tailwind + shadcn/ui + ESLint/Prettier.
  - Estrutura flat em `src/`.
  - Drizzle + drizzle-kit.
  - Tabelas `runs`, `ai_usage_logs`, `cost_budgets` (e seed do mês corrente).
  - `AIProvider` + `OpenAIProvider` + `assertBudget()`.
  - Auth Supabase de 1 conta operadora.
  - Página `(dashboard)` "Hello GoMVP" + logout.
  - Vercel Cron registrado vazio + `/api/cron/health`.
- **Forbidden scope:**
  - Qualquer coletor.
  - Qualquer chamada real à OpenAI.
  - Tabelas de F1+.
  - Habilitar `pgvector`.
  - Telas de F3+.
- **Input docs:** PRD §6/§11/§15/§16/§17/§24, Apêndice E, Decisions D-01..D-10, Cursor Rules.
- **Expected handback:** [`docs/handback/F0_DONE.md`](handback/F0_DONE.md).
- **Status atual:** DONE.

---

## Agent 3 — F1 Collection + Storage (HN only)

- **Brief:** [`docs/agents/AGENT_3_F1_COLETA_HN.md`](agents/AGENT_3_F1_COLETA_HN.md).
- **Responsabilidade:** Fase F1 — Coleta HN + storage, **sem IA paga**.
- **Allowed scope:**
  - Migration de `sources`, `raw_items`, `blacklist_terms` (com seed das 16 categorias).
  - Coletor `algolia-hn.ts`.
  - Pipeline `normalize`, `dedupe`, `filter`, `blacklist`.
  - Endpoint cron `/api/cron/collect-hn` com `CRON_SECRET`.
  - Tela "Coleta / Raw Items / Candidatos" read-only.
  - `vercel.json` com cron `0 11 * * 1,4`.
- **Forbidden scope:**
  - Outros coletores (PH, RSS, Apple, Stack Exchange, manual).
  - Qualquer chamada IA (`assertBudget` é só verificação; sem chamada real).
  - Habilitar `pgvector` ou criar `signals`.
  - Telas de F3+.
- **Input docs:** PRD §6.1/§8/§9/§10/§17/§24/Apêndice E, F0 done/review, Cursor Rules.
- **Expected handback:** [`docs/handback/F1_DONE.md`](handback/F1_DONE.md).
- **Status atual:** DONE.

---

## Agent 4 — F2 AI / Embeddings / Clusters / Ideas (HN only first)

- **Brief:** [`docs/agents/AGENT_4_F2_IA_IDEIAS.md`](agents/AGENT_4_F2_IA_IDEIAS.md).
- **Responsabilidade:** Fase F2 — pipeline IA completo sobre HN.
- **Allowed scope:**
  - Habilitar `pgvector` em dev.
  - Migration F2: `signals`, `clusters`, `signal_cluster`, `ideas`, `idea_signals`, `briefs`, `weights`, `prompts`, `feedback` + índices ivfflat e GIN.
  - Prompts versionados `001` em `src/prompts/` + seed em `prompts`.
  - Pipeline IA `extract`, `embed`, `filter_ai`, `cluster`, `ideaGen`, blacklist em ideas, `score`.
  - Endpoints cron `/api/cron/extract` e `/api/cron/generate`.
- **Forbidden scope:**
  - Coletores adicionais antes de HN estar estável e operador aprovar caso a caso.
  - Telas de F3+.
  - `feedback` ativo (tabela criada em F2, alimentação real começa em F4).
  - Mudar prompt já em produção sem criar nova versão.
- **Input docs:** PRD §9/§10/§14/§17/§19/§20/§24/Apêndice D/Apêndice E, F0/F1 done/review, Cursor Rules.
- **Expected handback:** [`docs/handback/F2_DONE.md`](handback/F2_DONE.md).
- **Status atual:** DONE (`approved_with_minors`).

---

## Agent 5 — Reviewer / QA / Patches

- **Brief:** [`docs/agents/AGENT_5_REVISAO.md`](agents/AGENT_5_REVISAO.md).
- **Responsabilidade:** revisar gate F0/F1/F2/F3/F4/F5 contra PRD e gates do plano. Pode aplicar correções pequenas locais.
- **Allowed scope:**
  - Rodar `typecheck`/`lint`/`build`.
  - Rodar `dev` para conferir UI.
  - Ler qualquer arquivo. Rodar SQL **read-only** no dev.
  - Inspecionar `runs`/`ai_usage_logs`/`cost_budgets`.
  - Correções pequenas (typo, await, validação Zod, índice em falta, mensagem engolida).
  - Atualizar PRD apenas para corrigir erros factuais (typo, número, contradição).
- **Forbidden scope:**
  - Adicionar feature.
  - Reabrir D-01..D-10.
  - Implementar fase que ele não está revisando.
  - Commit/push/PR sem aprovação.
  - Aplicar migration sem aprovação.
  - Chamar IA paga sem `assertBudget()`.
  - Editar prompt versionado já usado em produção.
- **Input docs:** PRD inteiro (foco na fase), `F<N>_DONE.md` da fase, reviews anteriores, diffs, Cursor Rules.
- **Expected handback:** `docs/handback/F<N>_REVIEW.md` com `approved`, `approved_with_minors` ou `rejected`.
- **Quando usar:** uma vez por gate, após cada `F<N>_DONE.md`.

---

## Agent 6 — F3 UI/UX (Painel + Ações) — **proposto**

> Brief operacional ainda não criado. Será gerado pelo Agent 0 sob aprovação.

- **Responsabilidade:** Fase F3 — Painel + Ações em PT-BR conforme PRD §18.
- **Allowed scope (proposta inicial, sujeita à aprovação do operador):**
  - Telas de leitura/ações:
    - Login (já existe; revisar).
    - Dashboard (métricas, atalhos, alertas).
    - Ranking principal (top 30 com filtros: status, fonte, score mínimo, idioma, tipo).
    - Aba **Filtradas** (auditoria, motivo de blacklist, reversão manual com nota).
    - Detalhe da ideia (com evidência clicável).
    - Brief MVP (somente após aprovação; gera/regera/copia — geração pode ficar gated por flag até F4 entrar).
    - Sinais (explorer).
    - Clusters (lista + sinais).
    - Runs (histórico + custo + erro).
    - Custos (gasto vs. budget + últimas 50 `ai_usage_logs`).
    - Sources (CRUD).
    - Weights (edição + botão "recalcular scores").
    - Blacklist (CRUD).
    - Prompts (read-only).
  - Ações no detalhe da ideia: aprovar, rejeitar, promissora, snooze (default 30d), nota.
  - Componentes shadcn/ui necessários para essas telas.
  - Server Actions / Route Handlers de leitura e ações de operador.
- **Forbidden scope (proposta inicial):**
  - Mudar schema fora de migrations adicionais aprovadas (ex.: tabelas auxiliares de UI seriam exceção e só com SQL preview).
  - Adicionar coletor.
  - Implementar feedback humano completo (vai para F4).
  - Treinar/alterar embeddings ou prompts.
  - Mudar pipeline IA.
  - Commit/push/PR.
- **Input docs (recomendado):** PRD §6/§18/§19/§24, Implementation Plan F3, F2 done/review, Decisions, Cursor Rules.
- **Expected handback:** `docs/handback/F3_DONE.md`.
- **Status atual:** PENDING (brief a ser produzido pelo Agent 0 sob aprovação).

---

## Agent 7 — Frontend QA / Playwright — **proposto**

> Brief operacional ainda não criado. Será gerado sob aprovação.

- **Responsabilidade:** smoke E2E local do painel após F3 fechar (e em handovers futuros).
- **Allowed scope (proposta inicial):**
  - Playwright local (já há MCP configurado em `mcp.json`).
  - Specs cobrindo: auth, ranking, filtradas, detalhe, ações, custos.
  - Ambiente: `npm run dev` + Supabase dev.
- **Forbidden scope (proposta inicial):**
  - Playwright em produção.
  - Scraping externo via Playwright.
  - Mudar produto.
- **Status atual:** PENDING (brief a ser produzido sob aprovação).

---

## Tabela resumida (quem chama quem)

| Agente | Entra após | Sai com handback | Próximo passo |
|---|---|---|---|
| Agent 0 | sempre, por demanda | atualização de docs de controle | preparar próximo prompt |
| Agent 2 | aprovação do operador (F0) | `F0_DONE.md` | acionar Agent 5 |
| Agent 3 | F0 aprovado | `F1_DONE.md` | acionar Agent 5 |
| Agent 4 | F1 aprovado | `F2_DONE.md` | acionar Agent 5 |
| Agent 5 | qualquer `F<N>_DONE.md` | `F<N>_REVIEW.md` | operador segue |
| Agent 6 (proposto) | F2 aprovado + brief F3 aprovado | `F3_DONE.md` | acionar Agent 5 |
| Agent 7 (proposto) | F3 aprovado | `F3_QA_DONE.md` | acionar Agent 5 |
