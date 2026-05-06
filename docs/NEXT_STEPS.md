# GoMVP — NEXT STEPS

> Plano operacional curto. Escopo: o que fazer **agora** e **logo depois**.
> Mantido pelo **Agent 0**. Atualizado a cada gate.

---

## Estado atual em uma linha

**F3 fechada** (`approved_with_minors`). Painel com 15 rotas funcionais. Mudanças da F3 ainda **não commitadas** em git. Próxima fronteira: aprovar commit + decidir caminho pós-F3 (QA, F4, ou novo coletor).

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

---

## Step 10 — Operador: corrigir alteração indevida no PRD **antes** do commit

**Owner:** operador.
**Bloqueador:** **B-06** em `PROJECT_STATE.md`.

`git diff docs/PRD.md` mostra:

```diff
-- Custo IA real ≤ US$ 50/mês (kill switch obrigatório).
++ Custo IA real ≤ US$ 5/mês (kill switch obrigatório).
```

Isso contradiz **D-01** (decisão de produto: hard cap **US$ 50/mês**). Override `AI_MONTHLY_BUDGET_USD=5` é dev-only (**O-01**) e não pertence ao PRD §3.

**Ação recomendada:** reverter manualmente:

```powershell
git checkout -- docs/PRD.md
```

Só depois disso seguir para o commit.

---

## Step 10b — Operador: aprovar commit + push da F3

**Owner:** operador.
**Bloqueador atual:** **B-05** em `PROJECT_STATE.md`.

`git status` mostra ~30 arquivos novos/modificados desde o `41c6212`:

- Shell e 14 rotas novas em `src/app/(dashboard)/...` + `src/components/dashboard/...`.
- `package.json` (porta fixa + `predev`).
- `src/db/index.ts` (singleton `globalThis`).
- `src/app/dashboard/page.tsx` deletado (rota duplicada).
- `src/app/icon.tsx` adicionado.
- README atualizado.
- `docs/handback/F3_DONE.md` e `F3_REVIEW.md`.
- `docs/agents/AGENT_6_F3_UI.md`.
- `docs/design/FIGMA_DESIGN_BRIEF.md`.
- `.cursor/skills/` (orchestration / development / frontend / quality).
- Atualizações nos docs de controle (PROJECT_STATE, DECISIONS, NEXT_STEPS, IMPLEMENTATION_PLAN, README).
- PRD permaneceu intocado.

**Recomendação do Agent 0** (sequência sugerida, sob aprovação do operador):

1. `git add .` em duas etapas para permitir commits temáticos:
   - **Commit A** — `feat(f3-ui): app shell + 14 dashboard routes + server actions`.
   - **Commit B** — `chore(dev): pin dev port 3000 + db singleton + handback/decisions docs`.
2. `git push origin main`.

> **Observação:** Agent 0 **não executa commit/push** sem aprovação explícita por mensagem do operador (DP-03).

---

## Step 11 — Operador: escolher direção pós-F3

Três caminhos possíveis. Recomendação default em negrito.

### Caminho A — Iniciar F4 (Feedback dinâmico + Brief on-demand)

- Habilita few-shot dinâmico em P-IDE-001 e P-FIL-001.
- Implementa embeddings de preferência (cap ±0.05).
- Cria endpoint de geração de Brief MVP on-demand (P-BRF-001) restrito a `ideas.status='approved'`.
- **Risco:** F4 depende de operador dando feedback real em volume; sem QA estruturado e sem KPI medido, é difícil avaliar impacto no ranking.

### Caminho B — Adicionar 1 coletor antes de F4

- Prioridade conforme PRD §8: Product Hunt > RSS > Apple RSS > Stack Exchange > manual.
- Atrasa F4. Ganha volume de sinais para calibrar feedback depois.
- **Risco:** F2/F3 ficam sob carga maior antes de QA estruturado.

### **Caminho C — QA estruturado + KPI cronometrado (recomendado)**

- Criar **Agent 7 — Frontend QA / Playwright** e rodar specs E2E reais cobrindo:
  - login, navegação, ranking, detalhe, filtradas, ações em ideias, custos, recálculo de scores, CRUD de fontes/blacklist/pesos.
- Rodar **KPI operacional** cronometrado: 30 ideias revisadas em ≤30 min (gate F3 ainda em aberto, R-09).
- Endereçar débitos:
  - **R-05** ESLint plugin Next warning (criar tarefa única).
  - **R-08** Estabilidade dev (validar singleton DB + `predev` em sessões longas).
- Saída: `docs/handback/F3_QA_DONE.md` + KPI confirmado.
- Só depois disso, entrar em F4.

---

## Step 12 — Decisões pendentes (operador)

- **Q-A** Caminho A, B ou C (recomendação: **C**).
- **Q-B** Migration `snoozed_until` em `ideas` precisa entrar em F4 (ou antes)? Sem ela, snooze não expira automaticamente.
- **Q-C** ESLint/Next plugin warning vai virar tarefa formal isolada? (Sugestão: sim, fora do ciclo de fases.)
- **Q-D** Manter `AI_MONTHLY_BUDGET_USD=5` em dev até F4 ou subir para US$ 50? (Sem urgência.)
- **Q-E** Status do Agent 7 (proposto) — promover a oficial? Brief operacional ainda não foi escrito.

---

## Step 13 — Pós-decisão

Conforme escolha em Q-A:

- **Se C:** Agent 0 produz `docs/agents/AGENT_7_QA.md` sob aprovação. Agent 7 roda. Agent 5 valida.
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
- [ ] Operador aprova commit + push (Step 10).
- [ ] Operador escolhe caminho pós-F3 (Step 11/12).

PRD **não foi alterado** nesta rodada — ver §"Sobre o PRD" no handback do Agent 0.
