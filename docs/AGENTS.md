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
- **Responsabilidade:** auditar repo, manter docs de controle sincronizadas, preparar prompts dos próximos agentes, prevenir scope creep, **redesenhar arquitetura quando o operador autorizar mudança estratégica**.
- **Allowed scope:**
  - Ler tudo.
  - Criar/atualizar docs em `docs/PROJECT_STATE.md`, `docs/DECISIONS.md`, `docs/AGENTS.md`, `docs/HANDOFF_TEMPLATE.md`, `docs/NEXT_STEPS.md`, `docs/agents/*.md`, `docs/handback/AGENT_0_*.md`.
  - Criar/atualizar `docs/architecture/*.md` (autorizado em 2026-05-06 via redesign F4/F5 — ver D-11..D-19 e DP-23).
  - **Editar `docs/PRD.md`** apenas sob autorização explícita do operador para mudança estratégica registrada como D-XX (autorização concedida em 2026-05-06 para rodada 7 do PRD).
  - **Editar `docs/IMPLEMENTATION_PLAN.md`** quando refletir decisão registrada em DECISIONS.
  - **Editar `.cursor/rules/gomvp-product-rules.mdc`** apenas sob autorização explícita do operador para refletir princípios novos (autorização concedida em 2026-05-06).
- **Forbidden scope:**
  - Implementar features.
  - Editar schema, migrations, pipeline, coletores, AI logic, scoring, cron.
  - Tocar `.env*` ou secrets.
  - Chamar OpenAI.
  - Commit/push/PR sem autorização explícita.
- **Input docs:** PRD, Implementation Plan, Decisions, Project State, Cursor Rules, handbacks anteriores, briefs de outros agentes.
- **Expected handback:** Atualização das docs de controle + recomendação de próxima ação + prompt copy-paste do próximo agente.
- **Quando usar:** no início do projeto, após cada handback de fase, em mudança estratégica, e sempre que houver dúvida de coordenação.

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

## Agent 6 — F3 UI/UX (Painel + Ações)

- **Brief:** [`docs/agents/AGENT_6_F3_UI.md`](agents/AGENT_6_F3_UI.md).
- **Responsabilidade:** Fase F3 — Painel + Ações em PT-BR conforme PRD §18.
- **Allowed scope:**
  - Shell de aplicação: sidebar agrupada, topbar, budget pill, breadcrumb.
  - 15 rotas no grupo `(dashboard)/`: Dashboard, Ranking, Detalhe da Ideia, Filtradas, Sinais, Clusters, Runs, Custos, Fontes, Pesos, Blacklist, Prompts, Brief MVP, Configurações, **Coleta** (legada).
  - Server Actions com Zod para CRUD em `sources`, `weights`, `blacklist_terms` e ações em `feedback` (snooze, override de filtrada, etc.).
  - Recálculo de score determinístico via `runScoreIdeas()`.
  - `loading.tsx` / `error.tsx` no grupo `(dashboard)`.
  - Endurecimento do dev loop: porta fixa 3000, singleton de DB, `predev` limpando `.next`.
- **Forbidden scope:**
  - Mudar schema. Criar migration.
  - Adicionar coletor.
  - Implementar feedback humano completo (vai para F4).
  - Treinar/alterar embeddings ou prompts versionados.
  - Mudar pipeline IA, scoring, budget, cron.
  - Commit/push/PR sem aprovação.
- **Input docs:** PRD §6/§18/§19/§24, Implementation Plan F3, F2 done/review, Decisions, Cursor Rules, [`docs/design/FIGMA_DESIGN_BRIEF.md`](design/FIGMA_DESIGN_BRIEF.md).
- **Expected handback:** [`docs/handback/F3_DONE.md`](handback/F3_DONE.md).
- **Status atual:** DONE (`approved_with_minors`). Review em [`docs/handback/F3_REVIEW.md`](handback/F3_REVIEW.md).

---

## Agent 7 — Frontend QA / Playwright

- **Brief:** [`docs/agents/AGENT_7_QA.md`](agents/AGENT_7_QA.md).
- **Responsabilidade:** QA estruturado pós-F3 (sanidade técnica + E2E + evidência do KPI operacional de 30 ideias em <= 30 min).
- **Allowed scope:**
  - Playwright local (dev only).
  - `typecheck` / `lint` / `build` / `dev`.
  - Validação de rotas/fluxos e geração de evidência em `docs/handback/F3_QA_DONE.md`.
  - Correções pequenas de QA somente com aprovação do operador.
- **Forbidden scope:**
  - Playwright em produção.
  - Scraping externo via Playwright.
  - Mudar produto/escopo da fase.
  - Commit/push/PR sem aprovação explícita.
- **Expected handback:** [`docs/handback/F3_QA_DONE.md`](handback/F3_QA_DONE.md).
- **Status atual:** DONE (`approved_with_minors`), com revisão em [`docs/handback/F3_QA_REVIEW_BY_AGENT5.md`](handback/F3_QA_REVIEW_BY_AGENT5.md). Pode ser reativado em F4A para QA estruturado das telas `/funil/*` se operador autorizar.

---

## Agent 8 — F4A Opportunity Motor (Evidence Layer + Scoring + Gates)

- **Brief:** [`docs/agents/AGENT_8_F4A_MOTOR.md`](agents/AGENT_8_F4A_MOTOR.md).
- **Responsabilidade:** Fase F4A — Motor source-agnostic (`src/motor/*`), camada `evidences`, adapter `signals → evidences`, scoring multi-axis, state machine de gates, UI Funil mínima (8 rotas).
- **Allowed scope:**
  - Migration `0004_*.sql`: novas tabelas + alteração nullable em `ideas`.
  - Pasta nova `src/sources/{hn,manual,watch}/`.
  - Pasta nova `src/motor/`.
  - Prompts `001`: P-EVI-001, P-TRD-001, P-OPP-001 (arquivos novos, não tocam legado).
  - Endpoints `/api/cron/build-evidence`, `/api/cron/score-opportunities`, `/api/manual/analyze`.
  - Pesos `f4_*` em `weights`.
  - 8 rotas `/funil/*` (radar, watch-topics, manual, trends, need-clusters, opportunities, opportunities/[id], source-confidence).
  - Atualização de `nav-config.ts` (novo grupo "Funil" + badges `LEGADO`).
- **Forbidden scope:**
  - Adicionar fonte nova (Trends/PH/Reddit/etc).
  - Alterar `signals`, `clusters`, `signal_cluster`, `briefs`, `feedback` legados.
  - Alterar pipeline F2 (`extract`, `embed`, `cluster`, `ideaGen`, `score`).
  - Alterar prompts `001` legados.
  - Desligar `runIdeaGeneration` ou rotas legadas F3.
  - Migrar dados legados retroativamente para `evidences` (opção fica para operador decidir; default = não).
  - Tocar `.env*`, secrets, MCP.
  - Commit/push/PR sem aprovação.
- **Input docs:** PRD rodada 7, [`architecture/F4_OPPORTUNITY_MOTOR.md`](architecture/F4_OPPORTUNITY_MOTOR.md), [`architecture/F5_SOURCE_EXPANSION.md`](architecture/F5_SOURCE_EXPANSION.md), Implementation Plan (F4A), Decisions D-01..D-18, Cursor Rules, handbacks F2/F3.
- **Expected handback:** `docs/handback/F4A_DONE.md`.
- **Status atual:** DONE (`approved_with_minors`) após correção Agent 8.5 e review Agent 5.

---

## Agent 8.5 — F4A Fix (Gate, Blacklist, Launchability)

- **Brief:** [`docs/agents/AGENT_8_5_F4A_FIX.md`](agents/AGENT_8_5_F4A_FIX.md).
- **Responsabilidade:** correção pontual da F4A entregue pelo Agent 8 antes de liberar F4B, seguindo D-18.
- **Allowed scope:**
  - Corrigir `src/motor/*` para propagar `blacklist_tags`, derrubar `launchability_score` e rejeitar categoria bloqueada/alto risco/`not_indielab_fit`.
  - Ajustar `src/sources/*` somente se necessário para preservar blacklist/tags em `evidences`.
  - Corrigir/ampliar `scripts/test-opportunity-gate.ts` para encerrar sozinho e cobrir gates mínimos.
  - Ajustar UI `/funil/*` somente se necessário para baixa confiança ou estado `rejected`.
  - Criar `docs/handback/F4A_FIX_DONE.md`.
- **Forbidden scope:**
  - Iniciar F4B ou adicionar Google Trends.
  - Adicionar Product Hunt, Reddit, YouTube ou Reviews.
  - Alterar migration existente ou criar nova migration sem SQL preview + aprovação específica.
  - Fazer backfill retroativo.
  - Desligar pipeline F2 legado.
  - Tocar `.env*`, secrets, MCP.
  - Commit/push/PR sem aprovação.
- **Input docs:** PRD, F4 architecture, Implementation Plan, Decisions D-18, Project State, F4A_DONE, F4A_REVIEW, Agent 0 reassessment, Agent 8 brief.
- **Expected handback:** `docs/handback/F4A_FIX_DONE.md`.
- **Status atual:** DONE (`approved_with_minors`). F4B liberada para Agent 9.

---

## Agent 9 — F4B Cross-source com Google Trends

- **Brief:** [`docs/agents/AGENT_9_F4B_TRENDS.md`](agents/AGENT_9_F4B_TRENDS.md).
- **Responsabilidade:** Fase F4B — Google Trends como segunda fonte mínima do motor; valida cross-source confidence.
- **Allowed scope:**
  - Pasta nova `src/sources/gtrends/` (`README.md` ToS-first, `collector.ts`, `normalizer.ts`) com BigQuery-first/approval-first.
  - Adapter reutilizável: `cron`, `watch_topics` e `manual_inputs` podem acionar a mesma fonte para gerar `search_momentum`, quando houver provider aprovado.
  - Endpoint `/api/cron/collect-trends`.
  - Atualização leve em `src/motor/opportunity-score.ts` para incorporar `search_momentum`.
  - Atualização UI em `/funil/trends` e `/funil/source-confidence`.
- **Forbidden scope:**
  - Alterar schema do motor.
  - Alterar tabelas legadas.
  - Adicionar fonte além de Trends.
  - Transformar Trends em módulo isolado ou acoplar a integração apenas ao cron.
  - Contar `manual`/`watch` como fonte externa.
  - Desligar pipeline F2 ou adapter F4A.
  - Commit/push/PR sem aprovação.
- **Input docs:** PRD rodada 7, [`architecture/F4_OPPORTUNITY_MOTOR.md`](architecture/F4_OPPORTUNITY_MOTOR.md), [`architecture/F5_SOURCE_EXPANSION.md`](architecture/F5_SOURCE_EXPANSION.md), brief Agent 8, handbacks/reviews F4A, Decisions DP-22.
- **Expected handback:** `docs/handback/F4B_DONE.md`.
- **Status atual:** DONE (`approved_with_minors`) após [`docs/handback/F4B_REVIEW.md`](handback/F4B_REVIEW.md). Minors aceitos: sem overlap real GT+HN, cron GT desligado, `source_confidence >= 0.65` não demonstrado por falta de match.

---

## Agent 10 — F4UX Funil UX / Operator Clarity

- **Brief:** [`docs/agents/AGENT_10_F4UX_FUNNEL_UI.md`](agents/AGENT_10_F4UX_FUNNEL_UI.md).
- **Responsabilidade:** fase intermediária curta entre F4B e F4C para clareza operacional do Funil. Organizar a experiência pelo fluxo do MOTOR, não por source: Radar → Evidências → Tendências → Dores agrupadas → Oportunidades → Ideias → Briefs.
- **Allowed scope:**
  - Reorganizar navegação/sidebar se necessário.
  - Deixar Funil como fluxo principal e Legado visualmente secundário.
  - Padronizar labels em PT-BR.
  - Melhorar auditabilidade genérica de `evidences` e Evidence Trace.
  - Explicar overlap ausente, baixa confiança, seeds manual/watch e próximos passos operacionais.
  - Estados vazios/loading/error e microcopy operacional.
- **Forbidden scope:**
  - Alterar motor/scoring/schema/collectors/cron.
  - Criar migration.
  - Implementar feedback estruturado, geração de ideias ou briefs (F4C).
  - Criar menu/produto específico de Google Trends ou outras sources.
  - Iniciar F5.
  - Tocar `.env*`, secrets, MCP.
  - Commit/push/PR sem aprovação.
- **Input docs:** PRD, F4 architecture, Implementation Plan, Project State, F4B_DONE, F4B_REVIEW, frontend skill, rules.
- **Expected handback:** `docs/handback/F4UX_DONE.md`.
- **Status atual:** READY TO START.

---

## Agent 11 — F4C Feedback estruturado + Idea/Brief gates

- **Brief:** [`docs/agents/AGENT_11_F4C_FEEDBACK.md`](agents/AGENT_11_F4C_FEEDBACK.md).
- **Responsabilidade:** Fase F4C — `feedback` polimórfico com `reason_code` obrigatório; gates `idea_allowed` e `brief_allowed`; prompts P-IDE-002 e P-BRF-002.
- **Allowed scope:**
  - Migration `0006_*.sql`: alteração polimórfica em `feedback` (target_kind/target_id/reason_code/gate_after) + backfill seguro.
  - Prompts `001`: P-IDE-002, P-BRF-002 (arquivos novos).
  - `src/motor/idea-from-opportunity.ts`, `src/motor/brief-from-idea.ts`.
  - Endpoints `/api/funil/ideas/generate`, `/api/funil/brief/generate`.
  - Novas rotas `/funil/ideas`, `/funil/ideas/[id]`, `/funil/briefs`, `/funil/feedback-history`.
  - Few-shot dinâmico em P-OPP-001 e P-IDE-002.
- **Forbidden scope:**
  - Alterar prompts `001` legados.
  - Desligar `runIdeaGeneration` legado nem `/brief/[ideaId]` legado.
  - Alterar schema do motor além do escopo (`feedback` polimórfico).
  - Adicionar fonte nova.
  - Destruir feedback existente.
  - Commit/push/PR sem aprovação.
- **Input docs:** PRD rodada 7, [`architecture/F4_OPPORTUNITY_MOTOR.md`](architecture/F4_OPPORTUNITY_MOTOR.md), briefs Agent 8/9/10, handbacks F4A/F4B/F4UX.
- **Expected handback:** `docs/handback/F4C_DONE.md`. **F4 fecha após este handback aprovado.**
- **Status atual:** PENDING (entra após F4UX aprovado).

---

## Tabela resumida (quem chama quem)

| Agente | Entra após | Sai com handback | Próximo passo |
|---|---|---|---|
| Agent 0 | sempre, por demanda | atualização de docs de controle | preparar próximo prompt |
| Agent 2 | aprovação do operador (F0) | `F0_DONE.md` | acionar Agent 5 |
| Agent 3 | F0 aprovado | `F1_DONE.md` | acionar Agent 5 |
| Agent 4 | F1 aprovado | `F2_DONE.md` | acionar Agent 5 |
| Agent 5 | qualquer `F<N>_DONE.md` | `F<N>_REVIEW.md` | operador segue |
| Agent 6 | F2 aprovado + brief F3 aprovado | `F3_DONE.md` | acionar Agent 5 |
| Agent 7 | F3 aprovado | `F3_QA_DONE.md` | acionar Agent 5 |
| **Agent 8** | F3 QA aprovado + brief F4A aprovado pelo operador | `F4A_DONE.md` | acionar Agent 5 |
| **Agent 9** | F4A aprovado | `F4B_DONE.md` | acionar Agent 5 |
| **Agent 10** | F4B aprovado | `F4UX_DONE.md` | acionar Agent 5 |
| **Agent 11** | F4UX aprovado | `F4C_DONE.md` (fecha F4) | acionar Agent 5 |
