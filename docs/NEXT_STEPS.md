# GoMVP — NEXT STEPS

> Plano operacional curto. Escopo: o que fazer **agora** e **logo depois**.
> Mantido pelo **Agent 0**. Atualizado a cada gate.

---

## Estado atual em uma linha

**F3 fechada e aprovada (com QA estruturado).** Agent 0 entregou nesta rodada o **redesign F4/F5** (PRD rodada 7 + arquitetura `F4_OPPORTUNITY_MOTOR.md` + `F5_SOURCE_EXPANSION.md` + briefs Agent 8/9/10 + decisões D-11..D-17). Aguardando **validação do operador** e autorização para commit + ativação do Agent 8.

---

## Histórico (steps fechados)

- **Steps 1–9** — DONE (camada documental, git inicial, F3 entregue, Agent 5 review, F3 QA done + review). Detalhes nos handbacks.
- **Step 10 / 10b** — DONE (PRD KPI revertido para US$ 50/mês na época, commits da F3 push em `origin/main`).
- **Step 11C / 11C-review** — DONE (Agent 7 + Agent 5).
- **Step 11 (rodada anterior)** — Operador escolheu **Caminho A (iniciar F4)**. Sub-decisão tomada na rodada 7: **F4 antiga (feedback+brief) vira F4 nova (Opportunity Motor)** — ver D-11..D-17.

---

## Step 12 (atual) — Validação do redesign F4/F5 (rodada 7 do PRD)

Documentos entregues nesta rodada:

| Arquivo | Tipo |
|---|---|
| [`docs/architecture/F4_OPPORTUNITY_MOTOR.md`](architecture/F4_OPPORTUNITY_MOTOR.md) | NOVO |
| [`docs/architecture/F5_SOURCE_EXPANSION.md`](architecture/F5_SOURCE_EXPANSION.md) | NOVO |
| [`docs/agents/AGENT_8_F4A_MOTOR.md`](agents/AGENT_8_F4A_MOTOR.md) | NOVO (com prompt copy-paste em §7) |
| [`docs/agents/AGENT_9_F4B_TRENDS.md`](agents/AGENT_9_F4B_TRENDS.md) | NOVO |
| [`docs/agents/AGENT_10_F4C_FEEDBACK.md`](agents/AGENT_10_F4C_FEEDBACK.md) | NOVO |
| [`docs/handback/AGENT_0_F4_REDESIGN.md`](handback/AGENT_0_F4_REDESIGN.md) | NOVO (handback desta rodada) |
| [`docs/PRD.md`](PRD.md) | ATUALIZADO (rodada 7: §1, §3, §6, §8, §9, §10, §11, §14, §17, §18, §19, §20, §22, §24, §26, Apêndice E) |
| [`docs/IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md) | ATUALIZADO (F4 split em F4A/B/C, F5 source expansion, F6 hardening, mapa de fases atualizado) |
| [`docs/DECISIONS.md`](DECISIONS.md) | ATUALIZADO (D-08 substituída por D-16; D-11..D-17 novos; O-01 encerrada; DP-15..DP-20 novos) |
| [`docs/PROJECT_STATE.md`](PROJECT_STATE.md) | ATUALIZADO (current phase = redesign F4/F5; novos blockers/risks/OQs) |
| [`docs/AGENTS.md`](AGENTS.md) | ATUALIZADO (Agent 8/9/10 adicionados; Agent 0 ganha permissão escrita em PRD/architecture sob autorização explícita) |
| [`.cursor/rules/gomvp-product-rules.mdc`](../.cursor/rules/gomvp-product-rules.mdc) | ATUALIZADO (princípios opportunity-first; nova ordem F5; D-16 cap configurável + alvo típico US$ 5 na validação F4/F5; manual/watch não elevam source confidence) |

### Ação do operador

1. **Ler/aprovar** os documentos novos e alterados (recomendação: começar por `F4_OPPORTUNITY_MOTOR.md` — peça central; depois PRD §1/§9/§19/§24; depois `AGENT_8_F4A_MOTOR.md`).
2. **Aprovar commit + push** da rodada 7 em `main` (mensagem sugerida: `docs(f4-redesign): introduce opportunity motor (rodada 7 do PRD, D-11..D-17)`).
3. **Autorizar ativação do Agent 8** em chat dedicado, usando o prompt copy-paste de [`agents/AGENT_8_F4A_MOTOR.md`](agents/AGENT_8_F4A_MOTOR.md) §7.

---

## Step 13 — F4A com Agent 8 (depois da autorização)

Owner: Agent 8.
Tempo estimado: 5–7 dias.

Sequência interna (Agent 8 deve seguir):

1. Leitura obrigatória dos docs listados em [`AGENT_8_F4A_MOTOR.md`](agents/AGENT_8_F4A_MOTOR.md) §0.
2. Approval first com operador: lista de arquivos, **SQL preview completo** da migration F4A (`0004_*.sql` ou próximo prefixo), pacotes, custo estimado vs **cap vigente** (ENV/`cost_budgets`).
3. Aplicar migration **somente** após **aprovação explícita e específica** daquele SQL (**sem** autorização genérica de migration — Q-G).
4. Implementar `src/sources/`, `src/motor/`, prompts novos, endpoints novos, UI Funil mínima (8 rotas). Adapter `signals → evidences`: **só sinais novos** (Q-H). UI: `qualified_opportunity` HN-only exibe **Baixa confiança de fonte**.
5. Validar gates F4A (ver [`AGENT_8_F4A_MOTOR.md`](agents/AGENT_8_F4A_MOTOR.md) §4).
6. Entregar `docs/handback/F4A_DONE.md`.
7. Acionar Agent 5 para review.

---

## Step 14 — F4B com Agent 9 (após F4A approved)

Owner: Agent 9. Tempo: 4–6 dias. Brief: [`AGENT_9_F4B_TRENDS.md`](agents/AGENT_9_F4B_TRENDS.md).

---

## Step 15 — F4C com Agent 10 (após F4B approved)

Owner: Agent 10. Tempo: 3–5 dias. Brief: [`AGENT_10_F4C_FEEDBACK.md`](agents/AGENT_10_F4C_FEEDBACK.md).

**F4 fecha após F4C `approved`.**

---

## Step 16 — F5 incremental

Após F4 fechada. Ordem: PH > Reddit > YouTube > Reviews. Detalhes em [`architecture/F5_SOURCE_EXPANSION.md`](architecture/F5_SOURCE_EXPANSION.md). Cada fonte um sprint dedicado, sob aprovação caso a caso.

---

## Step 17 — F6 Hardening

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
- [x] Atualização de DECISIONS com D-11..D-17 + DP-15..DP-20 + encerramento de O-01.
- [x] Atualização de PROJECT_STATE com fase corrente, blockers, risks, OQs.
- [x] Atualização de AGENTS com Agent 8/9/10 e permissões expandidas do Agent 0.
- [x] Atualização de NEXT_STEPS (este arquivo).
- [x] Atualização de `.cursor/rules/gomvp-product-rules.mdc`.
- [x] Criação de `docs/handback/AGENT_0_F4_REDESIGN.md`.
- [ ] **Operador valida e aprova commit + push.**
- [ ] **Operador ativa Agent 8 com prompt copy-paste.**
