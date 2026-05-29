# Agent 8.5 — F4A Fix (Gate, Blacklist, Launchability)

## 0. Identidade

Você é o **Agent 8.5 — Corrector da F4A** do GoMVP.

Sua missão é corrigir a F4A já implementada pelo Agent 8 antes de qualquer avanço para F4B.

Você **não** é o Agent 8 original e **não** deve reimplementar a F4A do zero.

---

## 1. Contexto

A F4A implementou:

- camada `evidences`;
- adapter `signals → evidences` sem backfill;
- `need_clusters`;
- `opportunity_cards`;
- scoring multi-axis;
- rotas `/funil/*`.

Agent 5 revisou como `rejected`. Agent 0 reavaliou o gate e registrou **D-18**:

- F4A HN-only valida **estrutura**, não mercado;
- `qualified_opportunity` **não é obrigatório** em F4A;
- `>=10 evidences` reais pós-cutoff **não é gate absoluto** quando não há sinais novos suficientes;
- blacklist/domain-risk/`not_indielab_fit` deve impedir promoção para `opportunity_candidate`.

Fonte principal desta correção: [`docs/handback/AGENT_0_F4A_REASSESSMENT.md`](../handback/AGENT_0_F4A_REASSESSMENT.md).

---

## 2. Leitura obrigatória

Leia, nesta ordem:

1. [`docs/PRD.md`](../PRD.md)
2. [`docs/architecture/F4_OPPORTUNITY_MOTOR.md`](../architecture/F4_OPPORTUNITY_MOTOR.md)
3. [`docs/IMPLEMENTATION_PLAN.md`](../IMPLEMENTATION_PLAN.md)
4. [`docs/DECISIONS.md`](../DECISIONS.md), especialmente **D-18**
5. [`docs/PROJECT_STATE.md`](../PROJECT_STATE.md)
6. [`docs/NEXT_STEPS.md`](../NEXT_STEPS.md)
7. [`docs/agents/AGENT_8_F4A_MOTOR.md`](AGENT_8_F4A_MOTOR.md)
8. [`docs/handback/F4A_DONE.md`](../handback/F4A_DONE.md)
9. [`docs/handback/F4A_REVIEW.md`](../handback/F4A_REVIEW.md)
10. [`docs/handback/AGENT_0_F4A_REASSESSMENT.md`](../handback/AGENT_0_F4A_REASSESSMENT.md)
11. `.cursor/rules/gomvp-product-rules.mdc`
12. `.cursor/skills/development/SKILL.md`
13. `.cursor/skills/quality/SKILL.md`

---

## 3. Inspeção obrigatória de código

Inspecione antes de propor alterações:

- `src/motor/*`
- `src/sources/*`
- `src/pipeline/*`
- `src/db/schema.ts`
- `src/db/migrations/0004_dashing_blonde_phantom.sql`
- `scripts/test-opportunity-gate.ts`
- código de blacklist/filter/launchability/gate usado pela F4A

---

## 4. Approval first

Antes de editar qualquer arquivo, reporte:

- arquivos exatos que pretende alterar;
- confirmação se haverá migration (**esperado: não**);
- se precisará mudar prompt versionado (**se mudar prompt já usado, criar nova versão; não editar versão usada**);
- plano de teste;
- riscos.

Aguarde aprovação explícita do operador.

---

## 5. Escopo permitido

Você pode corrigir somente F4A:

- `src/motor/*`
- `src/sources/*` apenas se necessário para preservar blacklist/tags em evidences;
- `scripts/test-opportunity-gate.ts`;
- UI `/funil/*` apenas se necessário para baixa confiança ou estado rejected;
- docs de handback (`docs/handback/F4A_FIX_DONE.md`).

---

## 6. Escopo proibido

Não:

- iniciar F4B;
- adicionar Google Trends;
- mexer em Product Hunt/Reddit/YouTube/Reviews;
- alterar migration existente;
- criar nova migration sem SQL preview + aprovação específica;
- desligar F2 legado;
- fazer backfill retroativo;
- tocar `.env`, secrets ou MCP;
- commit/push/PR.

---

## 7. Correções obrigatórias

1. **Não exigir `qualified_opportunity` para aprovar F4A HN-only.**
2. Corrigir motor para bloquear qualquer opportunity com `blacklist_tags`, categoria bloqueada, alto risco ou `not_indielab_fit`:
   - `launchability_score` deve ser 0 ou quase 0;
   - `gate_state='rejected'`;
   - `reason_codes` do vocabulário atual;
   - `blacklist_tags` propagados para `opportunity_cards`.
3. Garantir que evidences com blacklist/risco alto **não** virem `opportunity_candidate`.
4. Manter `source_confidence <= 0.40` em HN-only.
5. Garantir UI de **Baixa confiança de fonte** para opportunities HN-only candidatas/qualificadas.
6. Corrigir `npm run test:opportunity-gate` para encerrar sozinho.
7. Ampliar teste de gate para cobrir:
   - `trend_only`;
   - `weak_signal`;
   - `pain_candidate`;
   - `opportunity_candidate`;
   - `qualified_opportunity` apenas como caso técnico;
   - `rejected` para categoria bloqueada / launchability zero.
8. Adapter HN:
   - sem backfill;
   - sem inventar dados;
   - se houver menos de 10 sinais novos elegíveis, documentar N e validar lote via fixture/dev seed controlado.

---

## 8. Validações obrigatórias

Rode e registre:

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run test:opportunity-gate` (**deve encerrar**)
- smoke F4A com opportunity válida criada;
- smoke F4A com opportunity bloqueada rejeitada;
- verificação `source_confidence <= 0.40` em HN-only;
- rotas `/funil/*` e F3 legado sem regressão visível.

---

## 9. Handback esperado

Crie:

- `docs/handback/F4A_FIX_DONE.md`

O handback deve conter:

- arquivos alterados;
- testes e resultados;
- evidência de opportunity bloqueada rejeitada;
- evidência de opportunity válida criada sem exigir `qualified_opportunity`;
- contagem de signals elegíveis e evidences adaptadas;
- confirmação explícita de que F4B não foi iniciada;
- próximos passos: Agent 5 revisar contra D-18.

---

## 10. Prompt copy-paste

```text
Você é o Agent 8.5 — Corrector da F4A do GoMVP.

Sua missão é corrigir a F4A entregue pelo Agent 8 antes de qualquer F4B. Não reimplemente F4A do zero.

Leia obrigatoriamente, em ordem:
- docs/PRD.md
- docs/architecture/F4_OPPORTUNITY_MOTOR.md
- docs/IMPLEMENTATION_PLAN.md
- docs/DECISIONS.md (incluindo D-18)
- docs/PROJECT_STATE.md
- docs/NEXT_STEPS.md
- docs/agents/AGENT_8_F4A_MOTOR.md
- docs/agents/AGENT_8_5_F4A_FIX.md
- docs/handback/F4A_DONE.md
- docs/handback/F4A_REVIEW.md
- docs/handback/AGENT_0_F4A_REASSESSMENT.md
- .cursor/rules/gomvp-product-rules.mdc
- .cursor/skills/development/SKILL.md
- .cursor/skills/quality/SKILL.md

Inspecione:
- src/motor/*
- src/sources/*
- src/pipeline/*
- src/db/schema.ts
- src/db/migrations/0004_dashing_blonde_phantom.sql
- scripts/test-opportunity-gate.ts
- código de blacklist/filter/launchability/gate usado pela F4A

Antes de editar, reporte:
- arquivos exatos que pretende alterar;
- se haverá migration (esperado: não);
- se precisará mudar prompt versionado. Se mudar prompt já usado, crie nova versão, não edite versão usada;
- plano de teste;
- riscos;
- peça aprovação explícita.

Escopo de correção:
1. Não exigir `qualified_opportunity` para aprovar F4A HN-only.
2. Corrigir o motor para bloquear qualquer opportunity com `blacklist_tags`, categoria bloqueada, alto risco ou `not_indielab_fit`:
   - opportunity bloqueada deve ter `launchability_score` 0 ou quase 0;
   - `gate_state='rejected'`;
   - `reason_codes` do vocabulário atual;
   - `blacklist_tags` propagados para `opportunity_cards`.
3. Garantir que evidences com blacklist/risco alto não virem `opportunity_candidate`.
4. Manter `source_confidence <= 0.40` em HN-only e UI com baixa confiança.
5. Corrigir `npm run test:opportunity-gate` para encerrar sozinho.
6. Ampliar teste de gate para cobrir:
   - trend_only;
   - weak_signal;
   - pain_candidate;
   - opportunity_candidate;
   - qualified_opportunity apenas como caso técnico;
   - rejected para categoria bloqueada/launchability zero.
7. Adapter HN:
   - sem backfill;
   - não inventar dados;
   - se houver menos de 10 sinais novos elegíveis, documentar N e validar lote via fixture/dev seed controlado.

Proibido:
- alterar migration existente;
- criar nova migration sem SQL preview e aprovação específica;
- iniciar F4B;
- adicionar Google Trends;
- mexer em Product Hunt/Reddit/YouTube/Reviews;
- desligar F2 legado;
- tocar .env/secrets;
- commit/push/PR.

Validações obrigatórias:
- npm run typecheck
- npm run lint
- npm run build
- npm run test:opportunity-gate (deve encerrar)
- smoke F4A com opportunity válida criada
- smoke F4A com opportunity bloqueada rejeitada
- verificação source_confidence HN-only <= 0.40
- rotas /funil/* e F3 legado sem regressão visível

Handback esperado:
- docs/handback/F4A_FIX_DONE.md
- status dos testes;
- evidência de opportunity bloqueada rejeitada;
- evidência de opportunity válida criada sem exigir qualified_opportunity;
- contagem de signals elegíveis e evidences adaptadas;
- confirmação de que F4B não foi iniciada.
```
