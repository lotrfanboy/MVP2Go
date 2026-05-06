# GoMVP — NEXT STEPS

> Plano operacional curto. Escopo: o que fazer **agora** e **logo depois**.
> Mantido pelo **Agent 0**. Atualizado a cada gate.

---

## Estado atual em uma linha

F2 fechada (`approved_with_minors`). Camada de docs de controle estabelecida. **F3 ainda não iniciada.**

---

## Step 1 — Validar a camada documental criada agora (Agent 0)

**Owner:** operador (revisão).
**Saída esperada:** confirmação para o Agent 0 considerar a documentação de controle como base oficial.

Itens criados/atualizados nesta rodada:

- [`docs/PROJECT_STATE.md`](PROJECT_STATE.md) — estado atual do projeto.
- [`docs/DECISIONS.md`](DECISIONS.md) — D-01..D-10 + decisões operacionais O-01..O-04.
- [`docs/AGENTS.md`](AGENTS.md) — papéis, escopo e fluxo entre agentes.
- [`docs/HANDOFF_TEMPLATE.md`](HANDOFF_TEMPLATE.md) — template obrigatório de handback.
- [`docs/NEXT_STEPS.md`](NEXT_STEPS.md) — este arquivo.
- [`README.md`](../README.md) — atualização leve do status (F2 done, F3 pending).
- [`docs/IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md) — atualização leve do status e correção de caminhos `agents/` para `docs/agents/`.

Se aprovado, podemos seguir para Step 2.

---

## Step 2 — Resolver questões abertas antes da F3

Decisões pendentes do operador, agrupadas:

### Q1 — Git local
- Iniciar `git init` agora? Versionar local + remote (GitHub) antes de começar F3? (Decisão O-02 em [`DECISIONS.md`](DECISIONS.md).)

### Q2 — Brief de Agent 6 (F3 UI/UX)
- Aprovar criação do `docs/agents/AGENT_6_F3_UI.md` antes de qualquer código de painel.
- Definir se entrarão **todas as 14 telas** do PRD §18 em F3 ou subset priorizado para 1ª iteração.

### Q3 — Uso de Figma
- Confirmar se haverá design no Figma antes de codar. Se sim, qual é o endereço/escopo do arquivo.
- Sem Figma: Agent 6 segue com layouts derivados diretamente do PRD §18 + shadcn/ui defaults + tokens Tailwind.

### Q4 — Budget de dev
- Decidir se mantém `AI_MONTHLY_BUDGET_USD=5` em dev durante F3 (não há pipeline IA novo em F3) ou retorna para `50`. (Decisão O-01.)

### Q5 — Agent 7 (QA Playwright)
- Entra em paralelo durante F3, no fim de F3, ou só em F4/F5?

---

## Step 3 — Brief F3 (próxima entrega de Agent 0)

Ao receber sinal verde do operador:

- Agent 0 produz `docs/agents/AGENT_6_F3_UI.md` baseado em:
  - PRD §6 (escopo V1), §6.1 (blacklist + filtradas), §17 (modelo), §18 (telas), §19 (scoring), §24 (plano F3).
  - Implementation Plan F3.
  - Decisions e Cursor Rules.
- Brief contém: leituras obrigatórias, escopo F3, fora de escopo F3, gates, handback esperado.
- Brief não cria código; é só prompt copy-paste para Agent 6.

---

## Step 4 — Execução F3 (Agent 6)

Ordem sugerida (sob aprovação no brief):

1. Esqueleto de navegação do painel: shell + roteamento + auth gate.
2. Telas read-only:
   - Dashboard (métricas básicas a partir de `runs`, `ai_usage_logs`, `cost_budgets`).
   - Ranking principal (lê `ideas` com `is_filtered_out=false`, ordena por `total_score`, top 30, filtros básicos).
   - Filtradas (lê `ideas` com `is_filtered_out=true`, mostra `blacklist_tags` e motivo).
   - Detalhe da ideia (campos completos + evidência clicável a partir de `idea_signals` -> `signals`/`raw_items`).
   - Sinais (explorer com filtros).
   - Clusters (lista + sinais por cluster).
   - Runs (histórico + custo + erro).
   - Custos (gasto vs. budget + últimas 50 `ai_usage_logs`).
   - Prompts (read-only).
3. Telas com ações simples:
   - Ações no detalhe da ideia (aprovar / rejeitar / promissora / snooze 30d / nota). Persistir em campos existentes nas tabelas (sem mudar schema, salvo aprovação).
   - Reversão manual de item filtrado (com nota obrigatória).
4. Telas de configuração:
   - Sources (CRUD).
   - Weights (edição + recalcular scores on-demand).
   - Blacklist (CRUD).

Cada bloco fecha com smoke manual e verificação contra os gates F3.

Saída final: [`docs/handback/F3_DONE.md`](handback/F3_DONE.md) (usando o template).

---

## Step 5 — Review F3 (Agent 5)

Operador aciona Agent 5 com "Revisar F3". Saída: `docs/handback/F3_REVIEW.md` com `approved | approved_with_minors | rejected`.

---

## Step 6 — Pós-F3

Possibilidades, sob nova aprovação:

- Adicionar 1 coletor (PH > RSS > Apple > Stack Exchange).
- Iniciar F4 (Feedback + Brief).
- Acionar Agent 7 (Playwright QA).

Nada de F4/F5 antes de F3 fechar.

---

## Critério de "feito" para esta rodada do Agent 0

- [x] Inventário do repo executado.
- [x] `docs/PROJECT_STATE.md` criado.
- [x] `docs/DECISIONS.md` criado.
- [x] `docs/AGENTS.md` criado.
- [x] `docs/HANDOFF_TEMPLATE.md` criado.
- [x] `docs/NEXT_STEPS.md` criado.
- [x] Leitura confirmada do PRD, Implementation Plan, briefs e Cursor Rules.
- [ ] Operador aprova antes de iniciar Step 2 (questões abertas).
- [ ] Operador aprova antes de iniciar Step 3 (brief F3).

Não avançar para Step 3 sem confirmação explícita.
