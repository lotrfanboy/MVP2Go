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
   - [`docs/architecture/F5_SOURCE_EXPANSION.md`](../architecture/F5_SOURCE_EXPANSION.md) — F4B segue o padrão de fontes; estude.
   - [`docs/IMPLEMENTATION_PLAN.md`](../IMPLEMENTATION_PLAN.md) (seção F4B).
   - [`docs/agents/AGENT_8_F4A_MOTOR.md`](AGENT_8_F4A_MOTOR.md).
   - [`docs/handback/F4A_DONE.md`](../handback/F4A_DONE.md), [`docs/handback/F4A_FIX_DONE.md`](../handback/F4A_FIX_DONE.md) e [`docs/handback/F4A_FIX_REVIEW.md`](../handback/F4A_FIX_REVIEW.md).
   - [`docs/PROJECT_STATE.md`](../PROJECT_STATE.md), [`docs/DECISIONS.md`](../DECISIONS.md), [`docs/AGENTS.md`](../AGENTS.md).
   - [`.cursor/rules/gomvp-product-rules.mdc`](../../.cursor/rules/gomvp-product-rules.mdc).

2. **Approval first.** Antes de editar arquivos:
   - Avalie **Google Trends via BigQuery public dataset** como caminho preferencial.
   - Explique limitações do BigQuery: Top 25 / Top Rising, filtros por país/região, partições por `refresh_date`, e diferença para o Google Trends Explore.
   - Liste alternativas e riscos: SerpAPI/API paga, `google-trends-api`, fetch direto em endpoint web.
   - **Não use fetch direto nem biblioteca não oficial por default.** Isso exige aprovação explícita separada.
   - Se propuser pacote, priorize `@google-cloud/bigquery` (oficial Google) e justifique por DP-14.
   - Liste env/config necessários sem tocar `.env*` (ex.: projeto GCP, credenciais server-only, billing/free tier, location). Se precisar, proponha mudança em `.env.example` apenas após aprovação.
   - Mostre estimativa de custo de BigQuery/API e custo IA marginal.
   - Liste arquivos que vai criar/alterar.
   - Espere OK explícito do operador.

---

## 1. Conceito obrigatório

F4B **não é uma ferramenta isolada de Trends** e **não é orientada apenas por watch topics**.

F4B adiciona Google Trends como **source adapter** do motor:

- `source_key='gtrends'`
- `evidence_type='search_momentum'`
- evidences gravadas na tabela `evidences`
- motor continua lendo `evidences`, não fonte específica

Regra de domínio:

```text
watch_topic = semente de investigação
fonte externa = evidência de mercado
```

- `watch_topics` são hipóteses/assuntos monitorados pelo motor.
- `manual_inputs` são entradas pontuais/on-demand.
- Ambos podem criar evidência interna fraca para rastreio (`manual_seed`; se quiser criar `watch_seed`, pare e peça aprovação porque o vocabulário atual não inclui esse tipo).
- **Manual/watch nunca contam como fonte externa e nunca elevam `source_confidence`.**
- A validação só ocorre quando uma fonte externa real (`hn`, `gtrends`, `ph`, `reddit`, `youtube`, `reviews`) gera evidence no mesmo `topic_key`.

F4B deve suportar dois fluxos:

1. **Descoberta automática:** Google Trends geral/top/rising gera `search_momentum` para tópicos detectados.
2. **Investigação direcionada:** `watch_topics` fornece uma lista monitorada de `topic_key`/termos; se Trends encontrar sinal externo para esse tópico, grava `search_momentum` ligado ao mesmo `topic_key` e, quando aplicável, ao `watch_topic_id`.

Além disso, a integração deve ser reutilizável por análise manual:

3. **Manual on-demand:** após `manual_inputs` gerar `manual_seed`, o mesmo adapter `gtrends` pode tentar enriquecer o `topic_key` com `search_momentum`. Se o manual input estiver ligado a `watch_topic_id`, use o `topic_key` do watch topic como chave canônica.

Regra técnica: **source adapter ≠ trigger**.

- Source adapter: Google Trends produz `search_momentum`.
- Triggers: cron geral, watch topic e manual on-demand podem acionar a mesma integração.
- Não criar framework genérico de sources agora; apenas implementar `gtrends` com funções reutilizáveis para não acoplar Trends ao cron.

Ausência no Trends **não prova ausência de demanda**. Deve ser registrada como limitação/sinal insuficiente, não como rejeição automática.

---

## 2. Responsabilidade

Implementar **F4B** conforme `docs/architecture/F4_OPPORTUNITY_MOTOR.md` §13 (F4B).

Em uma frase: **adicionar Google Trends como segunda fonte do motor, produzir evidences `search_momentum`, e provar que o motor reflete a presença de uma fonte externa distinta quando HN + Trends concordam no mesmo `topic_key`.**

---

## 3. Allowed scope

### Pasta `src/sources/gtrends/`

- `src/sources/gtrends/README.md` — ToS/compliance, BigQuery dataset usado, rate limit/cotas, custo estimado, filtros de partição, fallback e limitações. Obrigatório antes do collector.
- `src/sources/gtrends/collector.ts` — coleta via caminho aprovado:
  - preferencial: BigQuery public dataset de Google Trends;
  - fluxo geral/top/rising para descoberta;
  - fluxo de lista monitorada usando `watch_topics` como sementes de `topic_key`;
  - fluxo de lookup/enriquecimento para `manual_inputs`;
  - caps baixos, dry-run/bytes estimados quando possível, retry idempotente e fail-safe em custo/quota.
- `src/sources/gtrends/normalizer.ts` — converte resultado aprovado em `evidences` com `source_key='gtrends'`, `evidence_type='search_momentum'`, `metrics_json` com `score`, `rank`, `refresh_date`, `week`, `country_code`, `region_name` quando disponíveis, e `axes_json` calculado.

O Agent 9 deve evitar acoplamento ao cron expondo funções internas reutilizáveis, por exemplo:

```ts
collectGTrendsDiscovery(...)
lookupGTrendsTopic(...)
normalizeGTrendsEvidence(...)
```

`lookupGTrendsTopic` deve aceitar metadados de trigger (`cron`, `watch_topic`, `manual`) e gravar `manual_input_id` / `watch_topic_id` quando aplicável.

### Endpoint cron

- `src/app/api/cron/collect-trends/route.ts` — protegido por `CRON_SECRET`. Usar `withRun({kind:'collect_trends'})`.
- Atualizar `vercel.json` com cron novo após aprovação. Sugestão inicial: `15 11 * * 1,4` (entre `collect-hn` e `extract`), mas Agent 9 deve confirmar a sequência atual do cron antes de editar.

### Motor (ajuste mínimo)

- Atualizar `src/motor/opportunity-score.ts` apenas se necessário para incorporar `search_momentum` no `trend_score` quando presente.
- Ajustar o fluxo de scoring/evidence trace apenas o suficiente para que evidences `gtrends` no mesmo `topic_key` participem corretamente da source confidence e do trace.
- Atualizar `src/motor/evidence-store.ts` somente se dedupe específico de Trends for necessário.
- **Não alterar schema do motor.**
- **Não alterar a fórmula de `opportunity_score` nem pesos sem aprovação explícita.**

### Pesos (`weights`)

- Propor `f4_trend_gtrends_w` somente se o código atual exigir peso novo.
- Se isso exigir seed/migration/data SQL, mostrar preview e aguardar aprovação específica.

### UI

- Atualizar `/funil/trends` para mostrar `search_momentum`, origem `gtrends`, data/partição e trigger (`cron`, `watch_topic`, `manual`) quando disponível.
- Atualizar `/funil/source-confidence` para mostrar nova fonte distinta quando existir.
- Adicionar visual de cross-source em `/funil/opportunities/[id]` (ex.: chips `HN` + `GT`) e evidences no trace.
- Toda UI nova com loading/empty/error.

### `sources` seed

- Adicionar/propor linha em `sources` com `kind='gtrends'`, `name='Google Trends'`, `config_json` com região default (`BR` e/ou `global`) e modo (`bigquery_public_dataset`), sem schema novo.

---

## 4. Forbidden scope (não fazer em F4B)

- Não alterar schema do motor (`evidences`, `opportunity_cards`, etc). Se precisar, parar e escalar Agent 0.
- Não alterar tabelas legadas (`signals`, `clusters`, `ideas`, `briefs`).
- Não adicionar fontes além de Trends (PH/Reddit/YouTube/Reviews são F5).
- Não transformar F4B em ferramenta isolada de watch topics.
- Não contar `manual`/`watch` como fonte externa.
- Não alterar pipeline F2 nem ideaGen/score/legados.
- Não desligar HN nem `signal-to-evidence`.
- Não alterar prompt versão `001` legado.
- Não alterar `assertBudget()`, `cost_budgets`.
- Não tocar `.env*`, secrets ou MCP.
- Não usar scraping/headless/browser para Google Trends.
- Não usar fetch direto em endpoint web do Google Trends sem aprovação explícita.
- Não instalar `google-trends-api` ou biblioteca não oficial sem justificar risco, manutenção e alternativa oficial.
- Não fazer commit/push/PR sem aprovação.
- Não iniciar F4C/F5.

---

## 5. Gates F4B

### Obrigatórios

- [ ] Approval-first concluído: estratégia técnica, ToS/compliance, custo, env/config, pacote e arquivos aprovados pelo operador antes de editar.
- [ ] `src/sources/gtrends/README.md` aprovado pelo operador antes do collector.
- [ ] Pacote oficial (`@google-cloud/bigquery`) ou alternativa aprovada por DP-14, se houver pacote.
- [ ] Endpoint `/api/cron/collect-trends` retorna 401 sem `CRON_SECRET` e 200 com header válido.
- [ ] Pelo menos 1 evidence `search_momentum` de `gtrends` persistida em dev e visível no evidence trace.
- [ ] Fluxo de descoberta geral/top/rising demonstrado ou limitação do BigQuery documentada.
- [ ] Fluxo com `watch_topics` demonstrado como seed monitorada, sem elevar `source_confidence` por si só.
- [ ] Fluxo manual on-demand demonstrado ou documentado como bloqueado por falta de provider de lookup arbitrário aprovado.
- [ ] Se `manual_inputs.watch_topic_id` existir, o enrichment usa o `topic_key` do watch topic como chave canônica.
- [ ] Evidence externa `gtrends` no mesmo `topic_key` participa corretamente do cálculo/trace de source confidence.
- [ ] Caso "trend forte sem dor" → `gate_state='trend_only'` correto demonstrado.
- [ ] Caso "dor sem trend suficiente" → `gate_state='pain_candidate'` correto demonstrado.
- [ ] `assertBudget()` continua bloqueando.
- [ ] `npm run test:opportunity-gate`, `npm run test:opportunity-blacklist`, `npm run typecheck`, `npm run lint` e `npm run build` passam.
- [ ] Custo IA agregado da fase em dev ≤ US$ 0,30.

### Metas operacionais (não reprovar automaticamente)

- [ ] Meta preferencial: ≥ 30 evidences `search_momentum` em dev por 3 execuções.
- [ ] Meta preferencial: ≥ 1 `opportunity_card` com HN + GT e `source_confidence ≥ 0.65`.

Se as metas não forem atingidas, Agent 9 deve documentar se a causa é:

- limitação do dataset BigQuery para Top/Rising ou para lookup de tópico arbitrário;
- falta de match entre `topic_key` HN e termos Trends;
- volume real insuficiente;
- threshold/fórmula;
- configuração/custo/quota.

Não falsear volume e não reprovar F4B automaticamente por ausência de 30 evidences reais.

---

## 6. Esperado handback

`docs/handback/F4B_DONE.md` seguindo `docs/HANDOFF_TEMPLATE.md`, com:

- caminho técnico escolhido para Trends e aprovação recebida;
- ToS/compliance/rate limit/custo documentado;
- variáveis/env/config propostas ou usadas (sem secrets);
- pacotes instalados e justificativa DP-14, ou `Nenhum`;
- snapshot de evidences `search_momentum` por dia/fonte/trigger (`cron`, `watch_topic`, `manual`);
- snapshot de evidence trace com `gtrends`;
- snapshot de opportunities cross-source (HN + GT) ou explicação objetiva se não atingiu `0.65`;
- demonstração de `trend_only` e `pain_candidate`;
- custo IA e custo BigQuery/API da fase;
- limitações do dataset BigQuery;
- próximo passo: acionar Agent 5.

---

## 7. Critérios para escalonar para Agent 0

- BigQuery public dataset não servir para o objetivo mínimo de F4B.
- API/BigQuery exigir pagamento/configuração não aprovada.
- Schema do motor precisar mudar para acomodar Trends.
- Custo IA marginal exceder US$ 1/mês em dev.
- Custo BigQuery/API extrapolar o alvo operacional ou exigir billing que o operador não quer ativar.
- Compliance/ToS inviabilizar uso na frequência prevista.
- Cap mensal US$ 5 estourar em projeção mensal.
