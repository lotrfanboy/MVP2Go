# Agent 10 — F4UX Funil UX / Operator Clarity

> **Tipo de agente:** implementador frontend/UX.
> **Fase:** F4UX — Funil UX / Operator Clarity.
> **Pré-requisito:** F4B fechada como `approved_with_minors` ou melhor pelo Agent 5.
> **Owner do brief:** Agent 0.
> **Reviewer requerido ao final:** Agent 5.

---

## 0. Antes de qualquer coisa

Você é o Agent 10. Antes de tocar uma linha:

1. **Leia obrigatoriamente, em ordem:**
   - [`docs/PRD.md`](../PRD.md).
   - [`docs/architecture/F4_OPPORTUNITY_MOTOR.md`](../architecture/F4_OPPORTUNITY_MOTOR.md).
   - [`docs/IMPLEMENTATION_PLAN.md`](../IMPLEMENTATION_PLAN.md) (seção F4UX).
   - [`docs/DECISIONS.md`](../DECISIONS.md) (D-19, DP-23).
   - [`docs/PROJECT_STATE.md`](../PROJECT_STATE.md), [`docs/AGENTS.md`](../AGENTS.md), [`docs/NEXT_STEPS.md`](../NEXT_STEPS.md).
   - [`docs/handback/F4B_DONE.md`](../handback/F4B_DONE.md), [`docs/handback/F4B_REVIEW.md`](../handback/F4B_REVIEW.md).
   - [`.cursor/rules/gomvp-product-rules.mdc`](../../.cursor/rules/gomvp-product-rules.mdc).
   - [`.cursor/skills/frontend/SKILL.md`](../../.cursor/skills/frontend/SKILL.md).
   - [`.cursor/skills/development/SKILL.md`](../../.cursor/skills/development/SKILL.md).
   - [`.cursor/skills/quality/SKILL.md`](../../.cursor/skills/quality/SKILL.md).

2. **Approval first.** Antes de editar arquivos:
   - Liste telas/componentes que pretende alterar.
   - Explique como a navegação continuará orientada pelo MOTOR, não por source.
   - Liste comandos que vai rodar.
   - Liste riscos de regressão de F3 legado/F4A/F4B.
   - Espere OK explícito do operador.

---

## 1. Responsabilidade

F4UX é uma fase curta para clareza operacional do Funil antes da F4C.

Em uma frase: **fazer o operador entender rapidamente o que o MOTOR encontrou, quais evidências sustentam cada item, de onde veio cada evidence, se há overlap, por que há baixa confiança/rejeição/filtro, e qual é o próximo passo operacional.**

Esta fase **não** é redesign visual grande e **não** é deixar bonito. É clareza operacional.

---

## 2. Conceito obrigatório

O GoMVP não deve ser organizado por source.

Fluxo mental principal:

```text
Radar → Evidências → Tendências → Dores agrupadas → Oportunidades → Ideias → Briefs
```

Sources como HN, Google Trends, Product Hunt, Reddit, YouTube e Reviews são infraestrutura de evidência, não menus/produtos separados.

Regras:

- Não criar menu Google Trends.
- Não criar menu Product Hunt/Reddit/YouTube/Reviews.
- No máximo uma área genérica de Fontes/Saúde das Fontes/Source Confidence.
- Manual/watch são seeds internas, não validação externa.
- Ausência de overlap não é falha automática.
- Baixa confiança deve ser explicada, não escondida.

---

## 3. Allowed scope

- Reorganizar navegação/sidebar se necessário para priorizar o fluxo do MOTOR.
- Deixar Funil como grupo principal.
- Deixar Legado F3 visualmente secundário e claramente marcado.
- Separar claramente:
  - Produto novo/Funil;
  - Legado F3;
  - Configurações/Sistema;
  - Fontes/Source Confidence.
- Padronizar labels e microcopy em PT-BR.
- Melhorar auditabilidade genérica de `evidences`.
- Melhorar Evidence Trace:
  - `source_key`;
  - `evidence_type`;
  - `topic_key`;
  - `topic_label`;
  - `metrics_json`;
  - `metadata_json`;
  - `source_ref`;
  - `manual_input_id` / `watch_topic_id` quando existirem.
- Explicar estados:
  - sem evidências;
  - sem overlap;
  - baixa confiança;
  - rejeitado/filtrado;
  - trend sem dor;
  - dor sem validação externa.
- Melhorar empty/loading/error states nas telas em escopo.
- Criar componentes UI pequenos e reutilizáveis se reduzirem duplicação real.

---

## 4. Forbidden scope

- Não alterar motor.
- Não alterar scoring.
- Não alterar schema.
- Não criar migration.
- Não alterar collectors.
- Não ativar cron.
- Não mexer em Google Trends além de exibição genérica de evidences já existentes.
- Não implementar feedback estruturado.
- Não gerar ideias.
- Não gerar briefs.
- Não iniciar F5.
- Não adicionar provider pago.
- Não tocar `.env*`, secrets ou MCP.
- Não fazer commit/push/PR sem aprovação.

---

## 5. Gates F4UX

- [ ] Navegação principal orientada pelo fluxo do MOTOR, não por source.
- [ ] Operador entende em poucos segundos o que existe em Radar, Evidências, Tendências, Dores agrupadas e Oportunidades.
- [ ] Evidence Trace permite auditar source, tipo, tópico, métricas, metadados e limitações.
- [ ] UI explica baixa confiança e ausência de overlap sem falsear validação.
- [ ] Manual/watch aparecem como seeds, não como fonte externa.
- [ ] Legado F3 segue funcional e visualmente secundário.
- [ ] Não há menu/tela principal específica de Google Trends.
- [ ] Não há alteração de motor/scoring/schema/cron.
- [ ] `npm run typecheck`, `npm run lint` e `npm run build` passam.

---

## 6. Esperado handback

`docs/handback/F4UX_DONE.md` seguindo `docs/HANDOFF_TEMPLATE.md`, com:

- telas/componentes alterados;
- antes/depois conceitual da navegação;
- como o fluxo do MOTOR ficou claro;
- como evidences/trace/overlap/low confidence são explicados;
- confirmação de que não houve motor/scoring/schema/cron/F4C/F5;
- screenshots ou descrição de smoke manual das rotas em escopo;
- comandos executados;
- próximo passo: acionar Agent 5 para review F4UX.

---

## 7. Critérios para escalonar para Agent 0

- A clareza do funil exigir mudança de escopo de produto.
- A UI precisar de dados que exigem migration ou alteração de motor.
- A navegação atual impedir separar Funil/Legado/Sistema sem refator grande.
- Alguma rota crítica F3/F4 quebrar durante a reorganização.
