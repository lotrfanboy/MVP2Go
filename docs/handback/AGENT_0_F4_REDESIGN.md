# Agent 0 — Handback: Redesign F4/F5 (rodada 7 do PRD)

## Cabeçalho

- **Agente:** Agent 0 (Orchestrator / Project Lead).
- **Fase / Gate:** redesign estratégico de F4 (Opportunity Motor) e F5 (Source Expansion).
- **Tipo de handback:** orchestration (não-implementação).
- **Status final do gate:** `done` (entrega documental). **Direção rodada 7 aprovada pelo operador (2026-05-09).** Aguardando **execução** de commit/push após ajustes finais (Q-F).
- **Data:** 2026-05-06 (entrega inicial); **atualizado 2026-05-09** (decisões Q-F..Q-H + D-16 operacional + gates F4A smoke/UI).
- **Branch / Worktree:** `main` (rodada 7 ainda não commitada).
- **Reviewer solicitado:** operador (não Agent 5; revisão técnica acontece quando Agent 8 entregar F4A).

---

## 1. Scope completed

- [x] Auditoria completa de docs e código atual (PRD, DECISIONS, IMPLEMENTATION_PLAN, PROJECT_STATE, AGENTS, schema, pipeline, collectors, AI, app, migrations, handbacks F0..F3 QA).
- [x] Identificação dos pontos onde a F4 antiga ("Feedback + Brief") aparece e precisa ser substituída pela F4 nova ("Opportunity Motor split em F4A/B/C").
- [x] Criação de pasta nova `docs/architecture/` com arquitetura e roadmap.
- [x] Criação de 3 briefs de implementação (Agent 8/9/10).
- [x] Atualização do PRD para rodada 7 (mudança de visão idea→opportunity, evidence layer, scoring multi-axis, gates, KPI custo IA US$ 5/mês, plano F4A/B/C, F5 source expansion).
- [x] Atualização de IMPLEMENTATION_PLAN com fases novas e hardening movido para F6.
- [x] Atualização de DECISIONS com **D-11..D-17** + **DP-15..DP-20** + **D-08 substituída por D-16** + **O-01 encerrada**.
- [x] Atualização de PROJECT_STATE com fase corrente, novos blockers (B-07), risks (R-12..R-17), open questions (OQ-10..OQ-13).
- [x] Atualização de AGENTS com Agent 8/9/10 e permissões expandidas do Agent 0 (escrita em PRD/architecture/rule sob autorização explícita).
- [x] Atualização de NEXT_STEPS com sequência de validação + ativação Agent 8.
- [x] Atualização de `.cursor/rules/gomvp-product-rules.mdc` com princípios novos.

## 2. Files created

- `docs/architecture/F4_OPPORTUNITY_MOTOR.md` — arquitetura central (evidence layer, axes, gates, schema, fases, prompts, custos, riscos).
- `docs/architecture/F5_SOURCE_EXPANSION.md` — roadmap de fontes (PH > Reddit > YouTube > Reviews + backup).
- `docs/agents/AGENT_8_F4A_MOTOR.md` — brief Agent 8 (F4A) com **prompt copy-paste** em §7.
- `docs/agents/AGENT_9_F4B_TRENDS.md` — brief Agent 9 (F4B).
- `docs/agents/AGENT_10_F4C_FEEDBACK.md` — brief Agent 10 (F4C).
- `docs/handback/AGENT_0_F4_REDESIGN.md` — este arquivo.

## 3. Files changed

- `docs/PRD.md` — rodada 7. Reescritas em §1 (visão), §3 (KPI US$ 5), §6 (escopo V2), §8 (fontes), §9 (fluxo), §10 (RFs novos RF-23..RF-35), §11 (NFRs cap US$ 5), §14 (custos), §17 (cita architecture), §18 (telas funil + legado), §19 (scoring multi-axis), §20 (feedback estruturado + reason codes), §22 (KPIs), §24 (plano F4A/B/C + F5 + F6), §26 (D-11..D-17), Apêndice E (princípios novos).
- `docs/IMPLEMENTATION_PLAN.md` — mapa de fases atualizado, F4 split em F4A/B/C, F5 source expansion, F6 hardening, ordem de execução, critérios de sucesso V2.
- `docs/DECISIONS.md` — D-08 marcada substituída por D-16; D-11..D-17 novos; O-01 encerrada; DP-11..DP-20 novos/atualizados.
- `docs/PROJECT_STATE.md` — current phase = F4 redesign in progress; B-07 novo; R-03 resolvido; R-12..R-17 novos; OQ-09 endereçado; OQ-10..OQ-13 novos.
- `docs/AGENTS.md` — Agent 0 ganha permissão de escrita em PRD/architecture/rule sob autorização explícita; Agent 8/9/10 adicionados; tabela "quem chama quem" atualizada.
- `docs/NEXT_STEPS.md` — reescrito (Step 12 = validação rodada 7; Step 13/14/15 = F4A/B/C; Step 16 = F5 incremental; Step 17 = F6).
- `.cursor/rules/gomvp-product-rules.mdc` — reescrito para refletir vision V2, evidence layer, manual/watch não elevam source confidence, **D-16 cap configurável** (alvo típico US$ 5 na validação F4/F5), F5 nova ordem, princípios opportunity-first.

## 4. Commands executed

| Comando | Resultado | Observação |
|---|---|---|
| nenhum comando shell foi executado nesta rodada | — | Rodada de orquestração/documentação. |

## 5. Packages installed

Nenhum.

## 6. Migrations proposed / applied

**Nenhuma** aplicada nesta rodada. Migrations futuras propostas (apenas documentadas, **não implementadas**; Agent 8/10 mostram SQL e aguardam **aprovação explícita por arquivo**):

- `0004_*.sql` (F4A) — proposta em [`F4_OPPORTUNITY_MOTOR.md`](../architecture/F4_OPPORTUNITY_MOTOR.md) §5.2 e [`AGENT_8_F4A_MOTOR.md`](../agents/AGENT_8_F4A_MOTOR.md) §2.
- `0006_*.sql` (F4C) — proposta em [`F4_OPPORTUNITY_MOTOR.md`](../architecture/F4_OPPORTUNITY_MOTOR.md) §5.3 e [`AGENT_10_F4C_FEEDBACK.md`](../agents/AGENT_10_F4C_FEEDBACK.md) §2.

## 7. Env vars introduced or changed

Nenhuma alteração de arquivo `.env` nesta rodada. Por **D-16**, o teto mensal efetivo de IA vem de **ENV** (ex.: `AI_MONTHLY_BUDGET_USD`) e da linha **`cost_budgets.monthly_budget_usd`** — **sem** hardcode no código como regra eterna. Na validação F4/F5 o **alvo operacional típico** documentado é **US$ 5/mês**; seeds podem refletir esse alvo quando o operador configurar.

Nenhum teste automatizado. Rodada de orquestração.

## 9. AI cost in this phase

Sem chamada IA. `ai_usage_logs` incremento = 0.

## 10. Known issues

- **B-07** (registrado em PROJECT_STATE): rodada 7 ainda não commitada em git. Risco de divergência se mais edits acontecerem antes do commit.
- **OQ-10** ~~backfill retroativo F4A~~ **Fechada (operador 2026-05-09):** F4A só **sinais novos**; backfill = job futuro opcional com dry-run + aprovação separada.
- **OQ-11**: cadência exata de `/api/cron/collect-trends` em F4B — fica para Agent 9 propor com base em rate limit Trends.
- **OQ-12**: deprecação eventual de `/coleta` legada — adiada para F5+.
- **OQ-13**: badge `LEGADO` exato em quais telas — sugestão registrada, confirmação em F4A.

## 11. Deviations from plan

Esta rodada **alterou o plano**. As deviações foram autorizadas explicitamente pelo operador na rodada 7:

- **O que mudou:** F4 não é mais "Feedback + Brief". F4 vira "Opportunity Motor" split em F4A/B/C. F5 não é mais "Hardening"; vira "Source Expansion". Hardening migra para F6.
- **Por que mudou:** mudança estratégica do operador para tornar GoMVP um motor de oportunidades antes de gerador de ideias.
- **Risco aceito:** reabrir PRD em rodada 7. Mitigado por documentar tudo em D-11..D-17, manter pipeline legado intacto, não destruir dados, evidence como camada nova ao lado de signals.
- **Aprovação:** operador, em chat, em 2026-05-06.

## 12. Open questions

Repetidas de PROJECT_STATE para conveniência do operador:

- **Q-F** Commit + push da documentação/skills pós-ajustes 2026-05-09 — **aprovado** pelo operador; aguardar execução explícita de commit/push.
- **Q-G** Autorização geral para aplicar migrations — **negada**; cada migration: SQL preview + OK **específico**.
- **Q-H** Backfill retroativo em F4A — **negado**; apenas sinais novos; backfill futuro = opcional, dry-run + aprovação separada.
- Revisar OQ-11..OQ-13 em PROJECT_STATE.

## 13. Next recommended step

> **Operador deve validar a rodada 7 (PRD + DECISIONS + IMPLEMENTATION_PLAN + PROJECT_STATE + AGENTS + NEXT_STEPS + 2 docs em `docs/architecture/` + 3 briefs em `docs/agents/` + handback Agent 0 + rule), aprovar commit/push, e em seguida ativar Agent 8 em chat dedicado usando o prompt copy-paste em [`docs/agents/AGENT_8_F4A_MOTOR.md`](../agents/AGENT_8_F4A_MOTOR.md) §7.**

## 14. Reviewer requested

- Revisor desta rodada documental: **operador** (mudança estratégica precisa validação humana, não revisão técnica do Agent 5).
- Revisor da próxima fase (F4A): **Agent 5** (após `F4A_DONE.md` do Agent 8).

---

## 15. Resumo da arquitetura F4 proposta

(Versão de bolso. Detalhes em [`F4_OPPORTUNITY_MOTOR.md`](../architecture/F4_OPPORTUNITY_MOTOR.md).)

- **Camada nova `evidences`** source-agnostic. **`signals` permanece intacto** e vira **uma das fontes** via adapter.
- **6 axes scores** em `opportunity_cards`: Trend / Pain / Audience / Source Confidence / Launchability / Opportunity. Pain pesa mais que trend.
- **Source Confidence cap automático**: 1 fonte externa ≤ 0.40, 2 ≤ 0.65, 3 ≤ 0.80, 4+ ≤ 0.90. Manual/watch **não** elevam.
- **State machine de gates**: 9 estados nomeados. Idea só de `approved_opportunity`. Brief só de `idea_allowed`.
- **F4A** = motor + adapter HN-only + UI Funil mínima.
- **F4B** = Google Trends como segunda fonte mínima.
- **F4C** = feedback polimórfico + reason codes + gates idea/brief.

## 16. Resumo da arquitetura F5 proposta

(Versão de bolso. Detalhes em [`F5_SOURCE_EXPANSION.md`](../architecture/F5_SOURCE_EXPANSION.md).)

- **Padrão**: cada fonte = `src/sources/<source>/{README, collector, normalizer}` + 1 endpoint cron + 1 linha em `sources` + 1 handback.
- **Motor é intocado** em F5. Se exigir, parar e escalar Agent 0.
- **Ordem**: PH > Reddit > YouTube > Reviews. Backup: RSS / Apple / Stack Exchange.
- **Compliance**: cada fonte tem README com ToS/rate limit antes do collector.

## 17. Impacto técnico previsto

- **Novas tabelas** (F4A): `watch_topics`, `manual_inputs`, `evidences`, `evidence_clusters`, `trend_candidates`, `need_clusters`, `opportunity_cards`, `opportunity_evidences`. **Sem destruir nada.**
- **Alteração nullable** em `ideas` (F4A): `+opportunity_id`, `+gate_state`. Legado intacto.
- **Alteração em `feedback`** (F4C): polimórfico (`+target_kind`, `+target_id`, `+reason_code`, `+gate_after`), com backfill seguro do legado.
- **Novos prompts** (todos versão `001`, sem tocar legados): P-EVI-001, P-TRD-001, P-OPP-001, P-IDE-002, P-BRF-002.
- **Novas pastas**: `src/sources/`, `src/motor/`.
- **Novas rotas** (F4A): 8 telas em `/funil/*`. (F4C): mais 4 telas.
- **Novos endpoints**: `/api/cron/build-evidence`, `/api/cron/score-opportunities`, `/api/manual/analyze` (autenticado, fora do cron), `/api/cron/collect-trends` (F4B), `/api/funil/ideas/generate`, `/api/funil/brief/generate` (F4C).
- **Cron** (Vercel): mantém entradas atuais; adiciona 2 (F4A) + 1 (F4B). Sob aprovação caso a caso.
- **Custo IA esperado total V2**: US$ 2,5–3/mês. Com **cap vigente** configurável (alvo típico validação F4/F5 US$ 5/mês — D-16), há folga ~2×.

## 18. Próximos Agents recomendados

1. **Agent 8** — F4A. Brief: [`AGENT_8_F4A_MOTOR.md`](../agents/AGENT_8_F4A_MOTOR.md). Prompt em §7 do brief.
2. **Agent 5** — review de F4A.
3. **Agent 9** — F4B (após F4A approved).
4. **Agent 5** — review de F4B.
5. **Agent 10** — F4C (após F4B approved).
6. **Agent 5** — review de F4C. **F4 fecha aqui.**
7. Cada fase F5x = brief novo + agent novo + Agent 5 review.
8. Agent 0 mantém-se ativo para orchestração entre fases.

## 19. Prompt inicial do Agent implementador F4 (Agent 8)

> Já está em [`AGENT_8_F4A_MOTOR.md`](../agents/AGENT_8_F4A_MOTOR.md) §7 como bloco copy-paste pronto. Operador deve abrir chat dedicado, colar e enviar.

---

## Notas operacionais permanentes

- Esta rodada cumpriu o que foi pedido pelo operador: análise + arquitetura + documentação + briefs + handback. **Nenhum código foi alterado, nenhum schema foi tocado, nenhuma migration foi criada, nenhuma chamada IA foi feita, nenhum commit/push/PR foi feito.**
- A próxima ação é do operador (validar rodada 7 e autorizar commit + ativação Agent 8).
