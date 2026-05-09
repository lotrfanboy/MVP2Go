# Agent 10 — F4C Feedback estruturado + Idea/Brief gates

> **Tipo de agente:** implementador de fase.
> **Fase:** F4C — Feedback estruturado por nível + gates `idea_allowed` / `brief_allowed`.
> **Pré-requisito:** F4A e F4B fechadas (`approved_with_minors` ou melhor) pelo Agent 5.
> **Owner do brief:** Agent 0.
> **Reviewer requerido ao final:** Agent 5.

---

## 0. Antes de qualquer coisa

Você é o Agent 10. Antes de tocar uma linha:

1. **Leia obrigatoriamente, em ordem:**
   - [`docs/PRD.md`](../PRD.md) (rodada 7).
   - [`docs/architecture/F4_OPPORTUNITY_MOTOR.md`](../architecture/F4_OPPORTUNITY_MOTOR.md) (§10 e §13).
   - [`docs/IMPLEMENTATION_PLAN.md`](../IMPLEMENTATION_PLAN.md) (seção F4C).
   - [`docs/agents/AGENT_8_F4A_MOTOR.md`](AGENT_8_F4A_MOTOR.md), [`docs/agents/AGENT_9_F4B_TRENDS.md`](AGENT_9_F4B_TRENDS.md).
   - [`docs/handback/F4A_DONE.md`](../handback/F4A_DONE.md), [`docs/handback/F4B_DONE.md`](../handback/F4B_DONE.md) e respectivos reviews.
   - [`docs/PROJECT_STATE.md`](../PROJECT_STATE.md), [`docs/DECISIONS.md`](../DECISIONS.md), [`docs/AGENTS.md`](../AGENTS.md).
   - [`.cursor/rules/gomvp-product-rules.mdc`](../../.cursor/rules/gomvp-product-rules.mdc).

2. **Approval first.** Antes de editar arquivos:
   - Mostre preview SQL da migration F4C (alteração polimórfica em `feedback`, sem destruir dados).
   - Liste arquivos a criar/alterar.
   - Estime custo IA marginal (P-IDE-002 e P-BRF-002 sob demanda).
   - Espere meu OK explícito.

---

## 1. Responsabilidade

Implementar **F4C** conforme `docs/architecture/F4_OPPORTUNITY_MOTOR.md` §13 (F4C).

Em uma frase: **transformar `feedback` em estrutura polimórfica com reason codes, implementar gates `idea_allowed` e `brief_allowed`, criar prompts P-IDE-002 e P-BRF-002, e fechar a regra "ideia só de opportunity aprovada, brief só de idea aprovada".**

---

## 2. Allowed scope

### Schema (sob aprovação SQL)

- Migration `0006_*.sql`:
  - `ALTER TABLE feedback`:
    - `ADD COLUMN target_kind text` (valores válidos `'evidence' | 'trend' | 'opportunity' | 'idea'`).
    - `ADD COLUMN target_id uuid`.
    - `ADD COLUMN reason_code text` (valores válidos conforme `F4_OPPORTUNITY_MOTOR.md` §10.2).
    - `ADD COLUMN gate_after text`.
    - **Backfill seguro:** `UPDATE feedback SET target_kind='idea', target_id=idea_id WHERE target_kind IS NULL`.
    - Após backfill validado: `ALTER COLUMN target_kind SET NOT NULL`, `ALTER COLUMN target_id SET NOT NULL`.
    - `idea_id` permanece (nullable) para compatibilidade com `/ideias/[id]/actions.ts` legado.
  - Índices novos: `feedback(target_kind, target_id)`, `feedback(reason_code)`.
- **Sem `DROP`. Sem destruir feedback existente.**

### Prompts

- Criar `src/prompts/p_ide_002.ts` (substitui semanticamente P-IDE-001 mas só dispara para `opportunity_cards.gate_state='approved_opportunity'`).
- Criar `src/prompts/p_brf_002.ts` (substitui P-BRF-001; só dispara quando `ideas.gate_state='idea_allowed'`).
- Seedar em `prompts` (`name+version` UNIQUE).
- **Não modificar** P-IDE-001/P-BRF-001 versão `001` (legado).

### Pipeline

- Criar `src/motor/idea-from-opportunity.ts` — gera `idea_candidate` chamando P-IDE-002. Insere em `ideas` com `opportunity_id` preenchido + `gate_state='idea_candidate'`.
- Criar `src/motor/brief-from-idea.ts` — gera brief chamando P-BRF-002. Apenas se `idea.gate_state='idea_allowed'`.
- **Não substituir** `runIdeaGeneration` (F2). Continua existindo para legado. F4C apenas adiciona caminho novo.

### Endpoints

- `src/app/api/funil/ideas/generate/route.ts` — POST autenticado. Recebe `opportunity_id`. Valida `gate_state='approved_opportunity'`. Chama `idea-from-opportunity`. Não roda em cron.
- `src/app/api/funil/brief/generate/route.ts` — POST autenticado. Recebe `idea_id`. Valida `gate_state='idea_allowed'`. Chama `brief-from-idea`.
- Ambos passam por `assertBudget()` e gravam `runs` + `ai_usage_logs`.

### UI funil

- `/funil/opportunities/[id]`:
  - Ações: aprovar / rejeitar / promissora / watch / snooze. **Cada ação obriga `reason_code`** via Server Action Zod.
  - Após aprovação, botão "Gerar ideia" aparece (chama `/api/funil/ideas/generate`).
- Nova rota `/funil/ideas` — lista ideias derivadas de opportunities (`ideas.opportunity_id IS NOT NULL`). Distingue `idea_candidate / idea_allowed / rejected / snoozed`.
- Nova rota `/funil/ideas/[id]` — detalhe + ações com `reason_code`. Botão "Gerar brief" aparece quando `gate_state='idea_allowed'`.
- Nova rota `/funil/briefs` — lista briefs de ideias do funil.
- Nova rota `/funil/feedback-history` — auditoria por `target_kind`, com filtro de `reason_code`.

### Few-shot dinâmico

- Em `src/motor/prompts.ts` (criada em F4A): adicionar busca top-N approved/rejected do mesmo tópico para injetar em P-OPP-001 e P-IDE-002. Cap de tokens.
- Embeddings de preferência: centroides por `topic_key`, subscore `preference_affinity` cap ±0.05.

---

## 3. Forbidden scope (não fazer em F4C)

- Não alterar prompts `001` legados (P-EXT/P-FIL/P-CLU/P-IDE/P-BRF).
- Não desligar `runIdeaGeneration` legado nem `/brief/[ideaId]` legado.
- Não alterar schema do motor além do que está no escopo (`feedback` polimórfico).
- Não adicionar fonte nova.
- Não chamar IA fora de `assertBudget()`.
- Não destruir feedback existente.
- Não tocar `.env*` (a não ser adicionar `.env.example` se necessário).
- Não fazer commit/push/PR sem aprovação (DP-03).
- Não instalar pacote sem justificativa (DP-14).

---

## 4. Gates F4C (todos obrigatórios)

- [ ] Migration `0006_*.sql` exibida e aprovada.
- [ ] Backfill de `feedback` legado validado: `SELECT count(*) FROM feedback WHERE target_kind IS NULL` retorna `0` antes do `NOT NULL`.
- [ ] Server Actions de aprovar/rejeitar opportunity exigem `reason_code` (validação Zod). Tentativa sem reason retorna erro 400/422 visível.
- [ ] Idea só nasce com `opportunity_id NOT NULL` quando criada via funil (ideias legadas continuam com `opportunity_id IS NULL`).
- [ ] Tentativa de gerar idea via funil em opportunity não-`approved_opportunity` falha com mensagem clara.
- [ ] Brief só nasce com `idea.gate_state='idea_allowed'`. Tentativa fora disso falha.
- [ ] 2 ciclos de feedback (com 5 opportunities aprovadas + 5 rejeitadas) movem `opportunity_score` médio do top-10 (medida em snapshot).
- [ ] `npm run typecheck` / `lint` / `build` passam.
- [ ] Custo IA agregado da fase em dev ≤ US$ 0,50.

---

## 5. Esperado handback

`docs/handback/F4C_DONE.md` seguindo `docs/HANDOFF_TEMPLATE.md`, com:

- Migration SQL aplicada.
- Snapshot de `feedback.target_kind` por categoria após backfill.
- Demonstração das 4 validações de gate (idea sem opportunity, brief sem idea_allowed, reason code obrigatório, etc).
- Snapshot de mudança em `opportunity_score` médio antes/depois de 2 ciclos de feedback.
- Custo IA da fase.
- Próximo passo: acionar Agent 5 para review final F4. Após `approved`, **F4 está completa**.

---

## 6. Critérios para escalonar para Agent 0

- Backfill de `feedback` deixar linha sem `target_kind` ou `target_id`.
- Schema do motor precisar mudar.
- Conflito real entre regras de F4C e PRD §20.
- Custo IA marginal exceder US$ 1/mês em dev.
- UI exigir refator estrutural na navegação Funil.
