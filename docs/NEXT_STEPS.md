# GoMVP — NEXT STEPS

> Plano operacional curto. Escopo: o que fazer **agora** e **logo depois**.
> Mantido pelo **Agent 0**. Atualizado a cada gate.

---

## Estado atual em uma linha

**F4B aprovada com minors.** Google Trends entrou como source adapter BigQuery-first e evidence `search_momentum`; não houve overlap real GT+HN, mas isso não bloqueia. Próximo passo: **Agent 10 / F4UX** para clareza operacional do Funil antes da F4C.

---

## Histórico (steps fechados)

- **Steps 1–9** — DONE (camada documental, git inicial, F3 entregue, Agent 5 review, F3 QA done + review). Detalhes nos handbacks.
- **Step 10 / 10b** — DONE (PRD KPI revertido para US$ 50/mês na época, commits da F3 push em `origin/main`).
- **Step 11C / 11C-review** — DONE (Agent 7 + Agent 5).
- **Step 11 (rodada anterior)** — Operador escolheu **Caminho A (iniciar F4)**. Sub-decisão tomada na rodada 7: **F4 antiga (feedback+brief) vira F4 nova (Opportunity Motor)**; F4UX foi inserida após F4B — ver D-11..D-19 e DP-23.

---

## Step 12 — Validação do redesign F4/F5 (fechado)

Documentos entregues nesta rodada:

| Arquivo | Tipo |
|---|---|
| [`docs/architecture/F4_OPPORTUNITY_MOTOR.md`](architecture/F4_OPPORTUNITY_MOTOR.md) | NOVO |
| [`docs/architecture/F5_SOURCE_EXPANSION.md`](architecture/F5_SOURCE_EXPANSION.md) | NOVO |
| [`docs/agents/AGENT_8_F4A_MOTOR.md`](agents/AGENT_8_F4A_MOTOR.md) | NOVO (com prompt copy-paste em §7) |
| [`docs/agents/AGENT_9_F4B_TRENDS.md`](agents/AGENT_9_F4B_TRENDS.md) | NOVO |
| [`docs/agents/AGENT_11_F4C_FEEDBACK.md`](agents/AGENT_11_F4C_FEEDBACK.md) | NOVO |
| [`docs/agents/AGENT_10_F4UX_FUNNEL_UI.md`](agents/AGENT_10_F4UX_FUNNEL_UI.md) | NOVO (inserido após F4B para clareza operacional antes da F4C) |
| [`docs/handback/AGENT_0_F4_REDESIGN.md`](handback/AGENT_0_F4_REDESIGN.md) | NOVO (handback desta rodada) |
| [`docs/PRD.md`](PRD.md) | ATUALIZADO (rodada 7: §1, §3, §6, §8, §9, §10, §11, §14, §17, §18, §19, §20, §22, §24, §26, Apêndice E) |
| [`docs/IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md) | ATUALIZADO (F4 split em F4A/B/C, F5 source expansion, F6 hardening, mapa de fases atualizado) |
| [`docs/DECISIONS.md`](DECISIONS.md) | ATUALIZADO (D-08 substituída por D-16; D-11..D-19; O-01 encerrada; DP-15..DP-23) |
| [`docs/PROJECT_STATE.md`](PROJECT_STATE.md) | ATUALIZADO (current phase = F4UX; F4B closed; F4C pausada) |
| [`docs/AGENTS.md`](AGENTS.md) | ATUALIZADO (Agent 8/9/10/11 adicionados; Agent 0 ganha permissão escrita em PRD/architecture sob autorização explícita) |
| [`.cursor/rules/gomvp-product-rules.mdc`](../.cursor/rules/gomvp-product-rules.mdc) | ATUALIZADO (princípios opportunity-first; nova ordem F5; D-16 cap configurável + alvo típico US$ 5 na validação F4/F5; manual/watch não elevam source confidence) |

### Status

1. ~~Ler/aprovar documentos novos e alterados.~~ Feito.
2. ~~Commit + push da rodada 7 em `main`.~~ Feito.
3. ~~Ativar Agent 8 / F4A.~~ Feito; F4A fechada como `approved_with_minors` após Agent 8.5.

---

## Step 13 — F4A (fechado)

Owner: Agent 8 + Agent 8.5.
Status: DONE (`approved_with_minors`).

Entregas:

1. Motor F4A (`evidences`, `need_clusters`, `opportunity_cards`) com HN-only e `source_confidence <= 0.40`.
2. UI Funil mínima (`/funil/*`).
3. Adapter `signals → evidences` sem backfill.
4. Blacklist persistida validada no motor (`test:opportunity-blacklist`).
5. Handbacks/reviews: [`F4A_DONE.md`](handback/F4A_DONE.md), [`F4A_FIX_DONE.md`](handback/F4A_FIX_DONE.md), [`F4A_FIX_REVIEW.md`](handback/F4A_FIX_REVIEW.md).

---

## Step 14 — F4B com Agent 9 (fechado)

Owner: Agent 9. Tempo: 4–6 dias. Brief: [`AGENT_9_F4B_TRENDS.md`](agents/AGENT_9_F4B_TRENDS.md).

Status: DONE (`approved_with_minors`).

Entregas:

1. Adapter `gtrends` BigQuery-first, sem scraping/provider pago/biblioteca não oficial.
2. Evidence `gtrends:search_momentum` persistida e auditável.
3. Endpoint `/api/cron/collect-trends` protegido por `CRON_SECRET`, mas cron operacional desligado em `vercel.json`.
4. Trace genérico de evidences em `/funil/source-confidence`.
5. Handbacks/review: [`F4B_DONE.md`](handback/F4B_DONE.md), [`F4B_REVIEW.md`](handback/F4B_REVIEW.md).

Minors aceitos: sem overlap real GT+HN; `source_confidence >= 0.65` não demonstrado por falta de match; `.env.example` sem `GTRENDS_*`; audit vulnerabilities não tratadas; warning crônico Next/ESLint.

---

## Step 15 — F4UX com Agent 10 (atual)

Owner: Agent 10. Tempo: curto. Brief: [`AGENT_10_F4UX_FUNNEL_UI.md`](agents/AGENT_10_F4UX_FUNNEL_UI.md).

Sequência:

1. Abrir chat dedicado para Agent 10.
2. Usar o prompt do brief [`docs/agents/AGENT_10_F4UX_FUNNEL_UI.md`](agents/AGENT_10_F4UX_FUNNEL_UI.md).
3. Melhorar clareza operacional do Funil: Radar → Evidências → Tendências → Dores agrupadas → Oportunidades → Ideias → Briefs.
4. Não mexer em motor, scoring, schema, collectors, cron, feedback, geração de ideias/briefs ou F5.
5. Entregar handback F4UX.
6. Acionar Agent 5 para review F4UX.

---

## Step 16 — F4C com Agent 11 (após F4UX approved)

Owner: Agent 11. Tempo: 3–5 dias. Brief: [`AGENT_11_F4C_FEEDBACK.md`](agents/AGENT_11_F4C_FEEDBACK.md).

**F4 fecha após F4C `approved`.**

---

## Step 17 — F5 incremental

Após F4 fechada. Ordem: PH > Reddit > YouTube > Reviews. Detalhes em [`architecture/F5_SOURCE_EXPANSION.md`](architecture/F5_SOURCE_EXPANSION.md). Cada fonte um sprint dedicado, sob aprovação caso a caso.

---

## Step 18 — F6 Hardening

Após F5 ter cobertura mínima (≥3 fontes externas distintas em produção). Kill switch, retries, alertas, retenção LGPD + purge, RUNBOOK, backup.

---

## Decisões pendentes (operador)

- **Q-A** ~~Caminho A ou B pós-F3.~~ **Resolvido** (Caminho A → F4 redesign).
- **Q-B** ~~Migration `snoozed_until`.~~ **Endereçada** em F4A via `opportunity_cards.snoozed_until` (legado mantém atual).
- **Q-C** ESLint/Next plugin warning vai virar tarefa formal isolada? (Sugestão: sim, fora do ciclo de fases.)
- **Q-D** ~~Manter `AI_MONTHLY_BUDGET_USD=5` em dev.~~ **Resolvida** por D-16: modelo único de cap **configurável** (ENV/`cost_budgets`); alvo típico na validação F4/F5 é US$ 5/mês.
- **Q-E** ~~Status do Agent 7.~~ **Resolvida** (Agent 7 done).
- **Q-F (novo)** Operador autoriza commit + push da documentação/skills da rodada 7 **após** ajustes finais (2026-05-09)? **Aprovado** sujeito a esses ajustes; aguardando commit explícito.
- **Q-G (novo)** Autorização geral para Agent 8 aplicar migrations? **Não.** Só após SQL preview + **aprovação explícita e específica** de **cada** migration.
- **Q-H (novo)** Backfill retroativo `signals → evidences` em F4A? **Fechada:** **não** em F4A; só sinais novos; job futuro opcional com dry-run + aprovação separada.

---

## Critério de "feito" para esta rodada do Agent 0 (rodada 7)

- [x] Auditoria de docs e código (PRD, DECISIONS, schema, pipeline, collectors, ai, app, migrations).
- [x] Identificação dos pontos onde a F4 antiga aparece e precisa ser substituída.
- [x] Criação da nova arquitetura em `docs/architecture/F4_OPPORTUNITY_MOTOR.md`.
- [x] Criação do roadmap em `docs/architecture/F5_SOURCE_EXPANSION.md`.
- [x] Criação dos briefs Agent 8/9/10.
- [x] Atualização de PRD (rodada 7) cobrindo §1, §3, §6, §8, §9, §10, §11, §14, §17, §18, §19, §20, §22, §24, §26, Apêndice E.
- [x] Atualização de IMPLEMENTATION_PLAN com fases novas.
- [x] Atualização de DECISIONS com D-11..D-19 + DP-15..DP-23 + encerramento de O-01.
- [x] Atualização de PROJECT_STATE com fase corrente, blockers, risks, OQs.
- [x] Atualização de AGENTS com Agent 8/9/10 e permissões expandidas do Agent 0.
- [x] Atualização de NEXT_STEPS (este arquivo).
- [x] Atualização de `.cursor/rules/gomvp-product-rules.mdc`.
- [x] Criação de `docs/handback/AGENT_0_F4_REDESIGN.md`.
- [ ] **Operador valida e aprova commit + push.**
- [ ] **Operador ativa Agent 8 com prompt copy-paste.**
