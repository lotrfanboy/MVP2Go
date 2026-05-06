# GoMVP — NEXT STEPS

> Plano operacional curto. Escopo: o que fazer **agora** e **logo depois**.
> Mantido pelo **Agent 0**. Atualizado a cada gate.

---

## Estado atual em uma linha

**F3 fechada** (`approved_with_minors`) com QA estruturado adicional concluído e revisado pelo Agent 5. Próxima fronteira: decidir entrada da F4.

---

## Histórico (steps fechados)

- **Step 1 — DONE** Camada documental criada (PROJECT_STATE, DECISIONS, AGENTS, HANDOFF_TEMPLATE, NEXT_STEPS).
- **Step 2 — DONE** Git inicializado e push em `origin/main` (commit `41c6212`).
- **Step 3 — DONE** Figma Design Brief + brief do Agent 6.
- **Step 4 — DONE (com desvio aprovado)** Operador optou por seguir com Figma Make + brief textual; arquivo Figma com pages/frames/tokens completos via MCP **não** foi produzido. Registrado em F3_DONE §11.
- **Step 5 — N/A** Figma MCP não foi configurado e o operador autorizou seguir sem.
- **Step 6 — DONE** Decisões pendentes documentadas. `AI_MONTHLY_BUDGET_USD=5` mantido em dev (O-01). Agent 7 e novo coletor seguem em aberto.
- **Step 7 — DONE** Agent 6 ativado e executou F3.
- **Step 8 — DONE** Execução F3: shell + 15 rotas + Server Actions + dev hardening (O-07/O-08/O-09/O-10).
- **Step 9 — DONE** Review Agent 5 (`approved_with_minors`) em [`handback/F3_REVIEW.md`](handback/F3_REVIEW.md).
- **Step 11C — DONE** Agent 7 executou QA estruturado e gerou [`handback/F3_QA_DONE.md`](handback/F3_QA_DONE.md).
- **Step 11C-review — DONE** Agent 5 revisou QA estruturado em [`handback/F3_QA_REVIEW_BY_AGENT5.md`](handback/F3_QA_REVIEW_BY_AGENT5.md) e recomendou liberar F4.

---

## Step 10 — DONE (ajustes git + PRD)

- PRD voltou ao valor canônico de KPI (US$ 50/mês).
- Commits realizados e enviados ao remoto:
  - `713d773` — `feat(f3-ui): deliver dashboard shell and F3 routes`
  - `d2dc898` — `chore(f3): stabilize dev runtime and sync orchestration docs`

---

## Step 10b — DONE (push concluído)

- `main` remoto atualizado em `origin/main`.
- Árvore de trabalho local limpa após push.

---

## Step 11 — Operador: escolher direção pós-F3 (atualizado)

Dois caminhos possíveis agora. Recomendação default em negrito.

### Caminho A — Iniciar F4 (Feedback dinâmico + Brief on-demand)

- Habilita few-shot dinâmico em P-IDE-001 e P-FIL-001.
- Implementa embeddings de preferência (cap ±0.05).
- Cria endpoint de geração de Brief MVP on-demand (P-BRF-001) restrito a `ideas.status='approved'`.
- **Risco:** F4 depende de operador dando feedback real em volume; sem QA estruturado e sem KPI medido, é difícil avaliar impacto no ranking.

### Caminho B — Adicionar 1 coletor antes de F4

- Prioridade conforme PRD §8: Product Hunt > RSS > Apple RSS > Stack Exchange > manual.
- Atrasa F4. Ganha volume de sinais para calibrar feedback depois.
- **Risco:** F4 é postergada sem ganho direto no núcleo de feedback humano.

---

## Step 12 — Decisões pendentes (operador)

- **Q-A** Caminho A ou B (recomendação: **A**).
- **Q-B** Migration `snoozed_until` em `ideas` precisa entrar em F4 (ou antes)? Sem ela, snooze não expira automaticamente.
- **Q-C** ESLint/Next plugin warning vai virar tarefa formal isolada? (Sugestão: sim, fora do ciclo de fases.)
- **Q-D** Manter `AI_MONTHLY_BUDGET_USD=5` em dev até F4 ou subir para US$ 50? (Sem urgência.)
- **Q-E** ~~Status do Agent 7 (proposto)~~ **Resolvido** — Agent 7 executado e fechado com `approved_with_minors`.

---

## Step 13 — Pós-decisão

Conforme escolha em Q-A:

- **Se A:** Agent 0 produz `docs/agents/AGENT_8_F4.md` (ou similar) sob aprovação. Operador ativa em chat dedicado.
- **Se B:** Agent 0 produz brief de coletor único (PH primeiro). Operador ativa.

Em todos os casos: nenhuma fase futura é adiantada; cada uma fecha com handback e review.

---

## Critério de "feito" para esta rodada do Agent 0

- [x] Auditoria do entregável da F3 (handback + review + repo real).
- [x] PROJECT_STATE atualizado com F3 done, 15 rotas, custos, blockers e OQs.
- [x] DECISIONS atualizado com O-07/O-08/O-09/O-10.
- [x] AGENTS atualizado (Agent 6 = DONE).
- [x] IMPLEMENTATION_PLAN atualizado.
- [x] README atualizado.
- [x] NEXT_STEPS atualizado (este arquivo).
- [x] Operador aprova commit + push (Step 10).
- [ ] Operador escolhe caminho pós-F3 (Step 11/12).

PRD **não foi alterado** nesta rodada — ver §"Sobre o PRD" no handback do Agent 0.
