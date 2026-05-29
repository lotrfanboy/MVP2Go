# Agent 0 — F4A Gate Reassessment

## Cabeçalho

- **Agente:** Agent 0 (Orchestrator / Project Lead).
- **Fase / Gate:** F4A — Opportunity Motor (HN-only).
- **Tipo de handback:** orchestration / product gate reassessment.
- **Status:** `needs_correction`.
- **Data:** 2026-05-28.
- **Contexto:** [`F4A_DONE.md`](F4A_DONE.md) entregue pelo Agent 8; [`F4A_REVIEW.md`](F4A_REVIEW.md) rejeitado pelo Agent 5.

---

## 1. Diagnóstico

O problema atual é uma combinação:

- **Regra documental errada:** F4A HN-only não deve exigir `qualified_opportunity`; F4A valida estrutura do motor, não mercado amplo.
- **Threshold inadequado:** `>=10 evidences` reais pós-cutoff não pode ser gate absoluto, porque Q-H proíbe backfill e o volume depende de sinais novos elegíveis.
- **Implementação errada:** uma opportunity com categoria bloqueada/alto risco passou como `opportunity_candidate`.
- **Blacklist incompleta no nível F4A:** tags existem em `evidences`, mas precisam afetar `opportunity_cards`, `launchability_score`, `gate_state` e `reason_codes`.
- **Bug técnico real:** `npm run test:opportunity-gate` imprime OK, mas não encerra sozinho.

Saúde/médico foi apenas o exemplo observado no smoke. A regra é geral: **blacklist/domain-risk/not_indielab_fit**.

---

## 2. Decisão oficial aplicada nos docs

Registrada como **D-18** em [`../DECISIONS.md`](../DECISIONS.md):

- F4A é **validação estrutural HN-only**.
- `qualified_opportunity` **não é obrigatório** em F4A.
- Volume real `>=10 evidences` **não é obrigatório** quando não há sinais novos suficientes; validar lote via fixture/dev seed controlado quando necessário.
- Opportunity com `blacklist_tags`, categoria bloqueada, alto risco ou `not_indielab_fit` deve virar `rejected`, não `opportunity_candidate`.
- F4B continua bloqueada até F4A corrigida e aprovada.

---

## 3. Tratamento oficial de blacklist/domain-risk

Qualquer opportunity com `blacklist_tags`, categoria bloqueada, risco alto ou fora do perfil IndieLab deve:

- receber `launchability_score = 0` ou quase zero;
- ficar em `gate_state='rejected'`;
- ter `reason_codes` do vocabulário atual, principalmente `not_indielab_fit`, `regulatory_risk`, `good_trend_bad_opportunity` ou `evidence_insufficient`, conforme o caso;
- preservar a categoria exata em `blacklist_tags`;
- nunca ser promovida automaticamente para `opportunity_candidate`.

---

## 4. Critério oficial F4A corrigido

F4A está validada quando:

- migration/seed F4A estão aplicados em dev com aprovação registrada;
- `npm run typecheck`, `npm run lint`, `npm run build` passam;
- `npm run test:opportunity-gate` passa **e encerra sozinho**;
- `build-evidence` adapta sinais novos elegíveis sem backfill;
- com evidência válida, o motor cria `need_cluster` e `opportunity_card`;
- se houver menos de 10 sinais novos, o handback registra dados insuficientes e valida lote por fixture/dev seed controlado;
- `source_confidence <= 0.40` em 100% das opportunities HN-only;
- UI comunica **Baixa confiança de fonte** em opportunities HN-only candidatas/qualificadas;
- opportunity bloqueada/alto risco é rejeitada;
- `/funil/*` funciona e F3 legado permanece intacto.

---

## 5. Prompt copy-paste para Agent 8.5

```text
Você é o Agent 8.5 — Correção F4A do GoMVP.

Objetivo: corrigir a F4A antes de qualquer F4B. Não implemente Google Trends nem nova fonte.

Leia obrigatoriamente:
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
- riscos.

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
   - `trend_only`;
   - `weak_signal`;
   - `pain_candidate`;
   - `opportunity_candidate`;
   - `qualified_opportunity` apenas como caso técnico;
   - `rejected` para categoria bloqueada/launchability zero.
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
- tocar `.env`/secrets;
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
- evidência de opportunity válida criada sem exigir `qualified_opportunity`;
- contagem de signals elegíveis e evidences adaptadas;
- confirmação de que F4B não foi iniciada.
```

---

## 6. Critério para Agent 5 revisar novamente

Agent 5 deve revisar F4A contra **D-18**, não contra o gate antigo.

### Blockers

- `test:opportunity-gate` não encerra sozinho.
- `source_confidence > 0.40` em HN-only.
- Opportunity com `blacklist_tags`, categoria bloqueada, alto risco ou `not_indielab_fit` vira `opportunity_candidate`.
- `blacklist_tags`/risco alto não afetam `launchability_score`, `gate_state` e `reason_codes`.
- F4B/Google Trends/nova fonte iniciada antes da aprovação F4A.
- F3 legado quebrado.

### Não blockers

- Ausência de `qualified_opportunity` em F4A HN-only.
- Menos de 10 evidences reais pós-cutoff, se o handback demonstrar adaptação correta dos sinais elegíveis e fixture/dev seed controlado para lote.

### Aprovação

F4A pode ser `approved` ou `approved_with_minors` quando validar:

- evidence válida → need_cluster → opportunity_card;
- opportunity bloqueada → rejected;
- HN-only low confidence;
- testes/build/lint/typecheck;
- rotas Funil e legado F3.

---

## 7. Próxima ação

Rodar o prompt acima em chat dedicado para o Agent 8.5. **Não iniciar F4B** até `F4A_FIX_DONE.md` + nova review do Agent 5.
