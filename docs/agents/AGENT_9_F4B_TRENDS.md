# Agent 9 — F4B Cross-source mínimo com Google Trends

> **Tipo de agente:** implementador de fase.
> **Fase:** F4B — Cross-source com Google Trends (segunda fonte mínima do MOTOR).
> **Pré-requisito:** F4A fechada (`approved_with_minors` ou melhor) pelo Agent 5.
> **Owner do brief:** Agent 0.
> **Reviewer requerido ao final:** Agent 5.

---

## 0. Antes de qualquer coisa

Você é o Agent 9. Antes de tocar uma linha:

1. **Leia obrigatoriamente, em ordem:**
   - [`docs/PRD.md`](../PRD.md) (rodada 7).
   - [`docs/architecture/F4_OPPORTUNITY_MOTOR.md`](../architecture/F4_OPPORTUNITY_MOTOR.md) — entenda o motor que F4A entregou.
   - [`docs/architecture/F5_SOURCE_EXPANSION.md`](../architecture/F5_SOURCE_EXPANSION.md) — F4B segue o padrão de fontes; estuda.
   - [`docs/IMPLEMENTATION_PLAN.md`](../IMPLEMENTATION_PLAN.md) (seção F4B).
   - [`docs/agents/AGENT_8_F4A_MOTOR.md`](AGENT_8_F4A_MOTOR.md).
   - [`docs/handback/F4A_DONE.md`](../handback/F4A_DONE.md) e respectivo review.
   - [`docs/PROJECT_STATE.md`](../PROJECT_STATE.md), [`docs/DECISIONS.md`](../DECISIONS.md), [`docs/AGENTS.md`](../AGENTS.md).
   - [`.cursor/rules/gomvp-product-rules.mdc`](../../.cursor/rules/gomvp-product-rules.mdc).

2. **Approval first.** Antes de editar arquivos:
   - Liste pacote(s) Trends que pretende usar (`google-trends-api`, `serpapi`, fetch direto). Justifique por DP-14.
   - Documente ToS e rate limit em rascunho (`src/sources/gtrends/README.md`).
   - Mostre estimativa de custo IA marginal e custo de API Trends.
   - Liste arquivos que vai criar/alterar.
   - Espere meu OK explícito.

---

## 1. Responsabilidade

Implementar **F4B** conforme `docs/architecture/F4_OPPORTUNITY_MOTOR.md` §13 (F4B).

Em uma frase: **adicionar Google Trends como segunda fonte do motor (sem mexer no motor), produzir evidences `search_momentum`, e provar que `source_confidence` sobe quando HN + Trends concordam.**

---

## 2. Allowed scope

### Pasta `src/sources/gtrends/`

- `src/sources/gtrends/README.md` — ToS, rate limit, política, custo. Obrigatório antes do collector.
- `src/sources/gtrends/collector.ts` — coleta interesse por `topic_key` derivado de `watch_topics` + opcional top trending; respeita rate limit; retry idempotente; cap diário de chamadas.
- `src/sources/gtrends/normalizer.ts` — converte resposta Trends em `evidences (evidence_type='search_momentum', source_key='gtrends')` com `metrics_json` contendo séries temporais e `axes_json` calculado.

### Endpoint cron

- `src/app/api/cron/collect-trends/route.ts` — protegido por `CRON_SECRET`. `withRun({kind:'collect_trends'})`. Padrão idêntico a `/api/cron/collect-hn`.
- Atualizar `vercel.json` com cron novo. Sugestão: `15 11 * * 1,4` (entre `collect-hn` 11:00 e `extract` 11:30) — sob aprovação.

### Motor (configuração mínima)

- Atualizar `src/motor/opportunity-score.ts`: incorporar `search_momentum` no `trend_score` (somando `metrics_json.gtrends_value` quando presente).
- Atualizar `src/motor/evidence-store.ts` se houver dedupe específico Trends necessário.
- **NÃO** alterar a fórmula de `opportunity_score` nem pesos (a não ser sob aprovação).

### Pesos (`weights`)

- Adicionar `f4_trend_gtrends_w` (default 0.30) sob aprovação.
- Documentar em handback.

### UI

- Atualizar `/funil/trends` para mostrar coluna `search_momentum` por `topic_key`.
- Atualizar `/funil/source-confidence` para mostrar nova fonte distinta.
- Adicionar visual de "cross-source" em `/funil/opportunities/[id]` (ex.: chips `HN` + `GT`).
- Toda UI nova com loading/empty/error.

### `sources` seed

- Adicionar uma linha em `sources` com `kind='gtrends'`, `name='Google Trends'`, `config_json` com região default (`'BR'` ou `'global'`).

---

## 3. Forbidden scope (não fazer em F4B)

- Não alterar schema do motor (`evidences`, `opportunity_cards`, etc). Se precisar, parar e escalar Agent 0.
- Não alterar tabelas legadas (`signals`, `clusters`, `ideas`, `briefs`).
- Não adicionar fontes além de Trends (PH/Reddit/YouTube/Reviews são F5).
- Não alterar pipeline F2 nem ideaGen/score/legados.
- Não desligar HN nem `signal-to-evidence`.
- Não alterar prompt versão `001` legado.
- Não alterar `assertBudget()`, `cost_budgets`.
- Não tocar `.env*` (Trends pode pedir API key — entra em `.env.example` apenas).
- Não fazer commit/push/PR sem aprovação.
- Não instalar pacote sem justificativa explícita (DP-14).

---

## 4. Gates F4B (todos obrigatórios)

- [ ] `src/sources/gtrends/README.md` aprovado pelo operador antes do collector.
- [ ] Pacote Trends (se houver) aprovado por DP-14.
- [ ] Collector retorna ≥ 30 evidences (`search_momentum`) em dev por 3 execuções consecutivas.
- [ ] Endpoint `/api/cron/collect-trends` retorna 401 sem `CRON_SECRET` e 200 com header válido.
- [ ] ≥ 1 `opportunity_card` com `source_confidence ≥ 0.65` (HN + GT distintos).
- [ ] Caso "trend forte sem dor" → `gate_state='trend_only'` correto demonstrado.
- [ ] Caso "dor sem trend" → `gate_state='pain_candidate'` correto demonstrado.
- [ ] `assertBudget()` continua bloqueando.
- [ ] `npm run typecheck` / `lint` / `build` passam.
- [ ] Custo IA agregado da fase em dev ≤ US$ 0,30.

---

## 5. Esperado handback

`docs/handback/F4B_DONE.md` seguindo `docs/HANDOFF_TEMPLATE.md`, com:

- ToS / rate limit Trends documentado.
- Snapshot de evidences `search_momentum` por dia em dev.
- Snapshot de opportunities cross-source (HN + GT).
- Custo IA da fase.
- Próximo passo: acionar Agent 5.

---

## 6. Critérios para escalonar para Agent 0

- API Trends quebrar ou exigir pagamento real.
- Schema do motor precisar mudar para acomodar Trends.
- Custo IA marginal exceder US$ 1/mês em dev.
- Compliance/ToS Trends inviabilizar uso na frequência prevista.
- Cap mensal US$ 5 estourar em projeção mensal.
