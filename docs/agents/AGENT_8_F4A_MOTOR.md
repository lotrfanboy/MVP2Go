# Agent 8 — F4A Opportunity Motor (Evidence Layer + Scoring + Gates)

> **Tipo de agente:** implementador de fase.
> **Fase:** F4A — Motor Base do GoMVP (HN-only, source-agnostic).
> **Pré-requisito:** F3 fechada (`approved_with_minors`), QA estruturado fechado, decisões D-11..D-16 aprovadas pelo operador.
> **Owner do brief:** Agent 0.
> **Reviewer requerido ao final:** Agent 5.

---

## 0. Antes de qualquer coisa

Você é o Agent 8. Antes de tocar uma linha:

1. **Leia obrigatoriamente, em ordem:**
   - [`docs/PRD.md`](../PRD.md) (rodada 7) — fonte canônica de produto.
   - [`docs/architecture/F4_OPPORTUNITY_MOTOR.md`](../architecture/F4_OPPORTUNITY_MOTOR.md) — arquitetura completa do motor.
   - [`docs/architecture/F5_SOURCE_EXPANSION.md`](../architecture/F5_SOURCE_EXPANSION.md) — para entender o que **NÃO** fazer aqui.
   - [`docs/IMPLEMENTATION_PLAN.md`](../IMPLEMENTATION_PLAN.md) (seção F4A).
   - [`docs/PROJECT_STATE.md`](../PROJECT_STATE.md).
   - [`docs/DECISIONS.md`](../DECISIONS.md) — D-01..D-16 + O-01..O-10.
   - [`docs/AGENTS.md`](../AGENTS.md).
   - [`docs/HANDOFF_TEMPLATE.md`](../HANDOFF_TEMPLATE.md).
   - [`docs/handback/F2_DONE.md`](../handback/F2_DONE.md), [`docs/handback/F2_REVIEW.md`](../handback/F2_REVIEW.md), [`docs/handback/F3_DONE.md`](../handback/F3_DONE.md), [`docs/handback/F3_REVIEW.md`](../handback/F3_REVIEW.md), [`docs/handback/F3_QA_DONE.md`](../handback/F3_QA_DONE.md), [`docs/handback/F3_QA_REVIEW_BY_AGENT5.md`](../handback/F3_QA_REVIEW_BY_AGENT5.md).
   - [`.cursor/rules/gomvp-product-rules.mdc`](../../.cursor/rules/gomvp-product-rules.mdc).
   - [`.cursor/skills/development/SKILL.md`](../../.cursor/skills/development/SKILL.md).

2. **Antes de editar qualquer arquivo, abra um "approval first" comigo (operador):**
   - Liste arquivos que vai criar/alterar.
   - Mostre **SQL preview completo** da migration F4A (ou saída `drizzle-kit generate`).
   - **Não há autorização geral para aplicar migration:** só rode `db:migrate` (ou equivalente) após eu (**operador**) aprovar **explicitamente essa migration específica**.
   - Liste pacotes que vai instalar (DP-14).
   - Estime custo IA marginal mensal no **cap vigente** (ENV/`cost_budgets`).
   - Espere meu OK explícito **no escopo de código** (migration é aprovação separada, passo a passo).

3. **Confirme que F3 está intacta antes de começar.** Sem regressão. Telas legadas continuam funcionando.

---

## 1. Responsabilidade

Implementar **F4A — Motor Base / Evidence Layer**, conforme `docs/architecture/F4_OPPORTUNITY_MOTOR.md` §13 (F4A).

Em uma frase: **transformar `signals` HN em `evidences`, criar o motor que produz `opportunity_cards` com scoring multi-axis e gates explícitos, e subir a navegação "Funil" mínima na UI — tudo sem quebrar F3 e sem adicionar fonte nova.**

---

## 2. Allowed scope

### Schema (política de migration)

- Migration `0004_*.sql` (numeração conforme repo):
  - **Cria** tabelas: `watch_topics`, `manual_inputs`, `evidences`, `evidence_clusters`, `trend_candidates`, `need_clusters`, `opportunity_cards`, `opportunity_evidences`. Schema conforme `F4_OPPORTUNITY_MOTOR.md` §5.2.
  - **Altera** tabela `ideas`: adiciona `opportunity_id uuid null fk opportunity_cards(id)` e `gate_state text default 'idea_candidate'`. **Sem `NOT NULL`. Sem `DROP`.**
  - **Altera** tabela `blacklist_terms`: amplia valores válidos de `scope` para incluir `'evidence'`. **Sem alterar dados existentes.**
  - Índices: `evidences(topic_key)`, `evidences(evidence_type)`, `evidences(observed_at desc)`, GIN em `evidences.blacklist_tags`, ivfflat em `evidences.embedding` (com `WHERE embedding IS NOT NULL`), `opportunity_cards(opportunity_score desc)`, `opportunity_cards(gate_state)`, `trend_candidates(topic_key, window_kind)`.
  - Migration **idempotente** quando possível; **sempre** exibir SQL preview ao operador antes de qualquer apply (DP-02).
  - **Sem autorização genérica:** `db:migrate` ou apply só após **aprovação explícita e específica** do operador **para essa migration**.

### Pasta `src/sources/`

- Criar `src/sources/hn/signal-to-evidence.ts` — adapter que, para cada **`signal` elegível ainda não adaptado** (somente **novos** após go-live — **sem backfill retroativo** do histórico), cria evidence com `evidence_type='discussion_signal'` (e, quando aplicável, também `repeated_pain`). Ver decisão operador: backfill futuro = job manual opcional com dry-run + aprovação separada.
- Criar `src/sources/manual/normalizer.ts` — `manual_inputs → evidences (manual_seed)`.
- Criar `src/sources/watch/normalizer.ts` — registra evidence leve quando watch_topic é criado/atualizado (apenas para audit trail; não eleva source confidence).
- **Não mover** `src/collectors/algolia-hn.ts` ainda. Em F4B+ pode ser movido para `src/sources/hn/collector.ts`. F4A apenas adiciona o adapter.

### Pasta `src/motor/`

- Criar `src/motor/evidence-store.ts` — upsert + dedupe de evidences (chave única `source_key + source_item_id + evidence_type`).
- Criar `src/motor/trend-engine.ts` — calcula `trend_candidates` em janelas 24h/7d/14d/30d. Pode ser SQL puro com agregações.
- Criar `src/motor/need-cluster.ts` — agrupa evidences com `pain_text` ou desire similar via cosine sobre `evidences.embedding` (threshold reaproveitado de `weights.cosine_threshold`).
- Criar `src/motor/opportunity-score.ts` — calcula axes scores (Trend/Pain/Audience/SourceConf/Launchability/Opportunity) conforme `F4_OPPORTUNITY_MOTOR.md` §7.
- Criar `src/motor/opportunity-gate.ts` — implementa state machine §8 (`opportunity_candidate` ↔ `trend_only/weak_signal/pain_candidate/qualified_opportunity/approved_opportunity/rejected/snoozed/watch`). Toda transição registra em `feedback` (mesmo automática, com `target_kind='opportunity'`, `reason_code` automático ou nulo).
- Criar `src/motor/prompts.ts` — orchestra chamadas a `P-EVI-001`, `P-TRD-001`, `P-OPP-001`. Toda chamada IA passa por `assertBudget()` e grava `ai_usage_logs.prompt_version`.

### Prompts

- Criar `src/prompts/p_evi_001.ts`, `src/prompts/p_trd_001.ts`, `src/prompts/p_opp_001.ts` versão `001`. Conteúdo conforme `F4_OPPORTUNITY_MOTOR.md` §15. Adicionar entrada em `src/prompts/index.ts` e seedar em `prompts` via `db:seed`.

### Endpoints

- Criar `src/app/api/cron/build-evidence/route.ts` — protegido por `CRON_SECRET`. Executa após `extract` (em sequência). Atualiza `vercel.json` para chamar este endpoint às `11:45` seg/qui (entre `extract` 11:30 e `generate` 12:00).
- Criar `src/app/api/cron/score-opportunities/route.ts` — protegido por `CRON_SECRET`. Executa após `generate`. Atualiza `vercel.json` para chamar às `12:15` seg/qui.
- Criar `src/app/api/manual/analyze/route.ts` — **fora do cron**. Autenticado via Supabase Auth (operador). Aceita `{ input_kind, payload, source_url, language, watch_topic_id }`. Persiste `manual_inputs` e dispara processamento on-demand.
- Cada endpoint usa `withRun({ kind, triggeredBy })`.

### Pesos (`weights`)

- Seedar pesos novos com prefixo `f4_`:
  - `f4_trend_recency_w`, `f4_trend_frequency_w`, `f4_trend_acceleration_w`, `f4_trend_persistence_w`, `f4_trend_diversity_w`.
  - `f4_pain_explicit_w`, `f4_pain_alternative_w`, `f4_pain_workaround_w`, `f4_pain_cost_time_w`, `f4_pain_urgency_w`, `f4_pain_repetition_w`.
  - `f4_audience_clarity_w`, `f4_audience_niche_w`, `f4_audience_acquirability_w`, `f4_audience_market_w`, `f4_audience_buyer_w`.
  - `f4_launch_solo_w`, `f4_launch_mvp_window_w`, `f4_launch_low_support_w`, `f4_launch_web_first_w`, `f4_launch_low_custom_w`, `f4_launch_low_risk_w`, `f4_launch_simple_money_w`, `f4_launch_channel_w`, `f4_launch_no_heavy_int_w`, `f4_launch_no_jur_risk_w`.
  - `f4_opp_trend_w=0.10`, `f4_opp_pain_w=0.30`, `f4_opp_audience_w=0.15`, `f4_opp_source_w=0.20`, `f4_opp_launch_w=0.20`, `f4_opp_risk_penalty_w=0.20`.
  - `f4_gate_qualified_min_score=0.55`, `f4_gate_qualified_min_source_conf=0.40`, `f4_gate_pain_min=0.40`, `f4_gate_trend_min=0.50`.
- **Não alterar** pesos legados (F2). Eles continuam servindo `score.ts` para o ranking de `ideas` legacy.

### UI nova — grupo "Funil"

Criar grupo de rotas em `src/app/(dashboard)/funil/`:

| Rota | Conteúdo |
|---|---|
| `/funil/radar` | Overview com counts por gate, top opportunity_cards, alertas. |
| `/funil/watch-topics` | CRUD de `watch_topics` via Server Actions Zod. |
| `/funil/manual` | Form para input manual + lista dos últimos 20 manual_inputs com status. |
| `/funil/trends` | Lista `trend_candidates` com filtros (window_kind, market). |
| `/funil/need-clusters` | Lista `need_clusters` com `pain_summary`, `evidence_count`. |
| `/funil/opportunities` | Ranking de `opportunity_cards` com filtros por `gate_state`, axes mínimos. |
| `/funil/opportunities/[id]` | Detalhe + axes + evidence trace + ações de gate. **Obrigatório:** em F4A (HN-only), toda opportunity candidata/qualificada deve exibir **Baixa confiança de fonte** (motor = validação estrutural, não mercado). |
| `/funil/source-confidence` | Auditoria fonte por opportunity. |

- Atualizar `src/components/dashboard/nav-config.ts` para incluir novo grupo "Funil" **acima** de "Operação". Renomear "Operação" para "Operação (legado)" e adicionar badge `LEGADO` nos itens existentes (Dashboard, Ranking, Filtradas, Brief MVP, Sinais, Clusters).
- Toda tela: PT-BR, loading.tsx, error.tsx, empty state honesto. Visual segue padrão F3 (shadcn/ui + tailwind).
- Rótulos obrigatórios na UI:
  - "Score IA não é validação real."
  - "Opportunity ≠ MVP. Brief ≠ validação."

### Gate de domínio (sem alterar legado)

- **Não desligar** `runIdeaGeneration` (F2). Continua rodando. Apenas marcar `ideas.opportunity_id IS NULL` na UI legada com badge `LEGADO`.
- Em F4A, **nenhuma rota nova** chama `runIdeaGeneration`. Geração de idea via opportunity é F4C (responsabilidade do Agent 10).
- Em F4A, brief continua só via `/brief/[ideaId]` (legado). Gate `idea_allowed`/`brief_allowed` é F4C.

---

## 3. Forbidden scope (não fazer em F4A)

- Não adicionar fonte nova (Trends, PH, Reddit, etc). Trends é F4B (Agent 9).
- Não alterar `signals`, `clusters`, `signal_cluster`, `ideas` (exceto `opportunity_id` + `gate_state`), `briefs`, `feedback`, `prompts`, `weights` legados.
- Não alterar `runIdeaGeneration` ou `runScoreIdeas` (F2).
- Não alterar pipeline F2 (`extract`, `embed`, `cluster`, `ideaGen`, `score`).
- Não migrar nem **fazer backfill** de `signals` históricos para `evidences` em F4A — apenas sinais **novos** após go-live do adapter.
- Não desligar telas F3 nem rotas legadas (`/ranking`, `/ideias/[id]`, `/sinais`, `/clusters`, `/runs`, `/brief/[ideaId]`, `/coleta`, `/configuracoes`, `/custos`, `/fontes`, `/pesos`, `/blacklist`, `/prompts`, `/filtradas`, `/dashboard`).
- Não alterar `assertBudget()`, `cost_budgets`, `ai_usage_logs` schema.
- Não tocar `.env*` (apenas adicionar `*_NEW_VAR` em `.env.example` se algum endpoint exigir, sob aprovação).
- Não chamar OpenAI fora dos pipelines com `assertBudget()`.
- Não alterar prompt versão `001` já em produção (P-EXT/P-FIL/P-CLU/P-IDE/P-BRF). Para mudar, criar versão `002` (responsabilidade de F4C, não F4A).
- Não fazer commit/push/PR sem aprovação explícita (DP-03).
- Não instalar pacote sem justificativa explícita (DP-14).

---

## 4. Gates F4A (todos obrigatórios)

- [ ] Migration `0004_*.sql` exibida em SQL; **aplicada em dev somente** após **aprovação explícita e específica** do operador (não há autorização genérica).
- [ ] Tabelas novas respondem em SQL select (`SELECT COUNT(*) FROM evidences;` etc).
- [ ] Adapter `signal-to-evidence` correto para **sinais novos** apenas: adapta todos os sinais novos elegíveis no período (sem backfill de histórico). Se houver < 10 sinais novos, registrar **dados insuficientes** e validar lote ≥ 10 com fixture/dev seed controlado.
- [ ] `trend-engine` produz ≥ 1 `trend_candidate` no window 7d.
- [ ] `need-cluster` produz ≥ 1 `need_cluster`.
- [ ] `opportunity-score` produz ≥ 1 `opportunity_card` a partir de `need_cluster` válido. **`qualified_opportunity` não é obrigatório em F4A HN-only** (D-18). **Source Confidence ≤ 0.40** (HN-only).
- [ ] **UI:** toda opportunity HN-only exibida como candidata/qualificada comunica **Baixa confiança de fonte**.
- [ ] Motor rejeita `blacklist_tags`, categoria bloqueada, alto risco ou `not_indielab_fit` (saúde/médico/regulatório/desinformação sensível é só exemplo): `launchability_score` zero/quase zero, `gate_state='rejected'`, `reason_codes` preenchidos.
- [ ] State machine valida transições (testes em `scripts/test-opportunity-gate.ts`).
- [ ] `assertBudget()` bloqueia em teste (≥ 0.90 cron, ≥ 1.00 hard) no cap vigente.
- [ ] `npm run typecheck` / `npm run lint` / `npm run build` passam.
- [ ] Todas as rotas `/funil/*` retornam 200 com loading/empty/error.
- [ ] Manual analysis end-to-end: operador insere texto → `manual_input` salvo → evidence (`manual_seed`) criada → oportunidade aparece em `/funil/opportunities` com indicação de baixa confiança de fonte quando aplicável.
- [ ] F3 legado intacto: 15 rotas antigas funcionam sem regressão (Playwright opcional).
- [ ] Cron novo registrado em `vercel.json` mas **não aplicado em produção** sem aprovação.
- [ ] Nenhum prompt versão `001` legado modificado.
- [ ] Custo IA agregado da rodada de teste compatível com **cap vigente** em dev (cenário típico: ≤ US$ 0,10 incremental).

---

## 5. Convenções de implementação (sumário)

- TypeScript estrito. Sem `any` injustificado.
- Server Actions com Zod. Manual analysis também via Zod.
- Empty/loading/error state em toda página `/funil/*`.
- Mensagens em PT-BR na UI; nomes em EN no código.
- Logs estruturados em `runs` por endpoint (`kind='build_evidence'`, `'score_opportunities'`, `'manual_analyze'`).
- Toda chamada IA registrada em `ai_usage_logs` com `prompt_version` e `operation`.

---

## 6. Esperado handback

`docs/handback/F4A_DONE.md` seguindo `docs/HANDOFF_TEMPLATE.md`, com:

- Migration SQL aplicada (preview + status).
- Lista de arquivos criados/alterados.
- Snapshot de contagens em dev: `evidences`, `trend_candidates`, `need_clusters`, `opportunity_cards` por `gate_state`.
- Custo IA da fase (de `ai_usage_logs`).
- Demonstração da regra source confidence cap em ≤ 0.40 (com query SQL).
- Demonstração de manual analysis end-to-end (passos manuais + `runs.id`).
- Eventuais desvios (§11 do template) — qualquer divergência da arquitetura registrada explicitamente.
- Próximo passo: acionar Agent 5 para revisão F4A.

---

## 7. Prompt copy-paste para iniciar Agent 8

> Use este prompt em chat dedicado quando o operador autorizar o início da F4A.

```
Você é o Agent 8 — Implementador da F4A do GoMVP (Motor Base + Evidence Layer + Scoring multi-axis + Gates + UI Funil mínima).

Antes de tocar QUALQUER arquivo:

1) Leia obrigatoriamente, em ordem:
- docs/PRD.md (rodada 7)
- docs/architecture/F4_OPPORTUNITY_MOTOR.md
- docs/architecture/F5_SOURCE_EXPANSION.md
- docs/IMPLEMENTATION_PLAN.md (seção F4A)
- docs/PROJECT_STATE.md
- docs/DECISIONS.md (D-01..D-18, O-01..O-10)
- docs/AGENTS.md
- docs/HANDOFF_TEMPLATE.md
- docs/handback/F2_DONE.md, F3_DONE.md, F3_REVIEW.md, F3_QA_DONE.md, F3_QA_REVIEW_BY_AGENT5.md
- docs/agents/AGENT_8_F4A_MOTOR.md  (ESTE BRIEF)
- .cursor/rules/gomvp-product-rules.mdc
- .cursor/skills/development/SKILL.md

2) Inspecione o repo:
- src/db/schema.ts
- src/db/migrations/* (entender numeração)
- src/pipeline/* (NÃO ALTERAR; apenas entender)
- src/collectors/algolia-hn.ts (NÃO ALTERAR)
- src/ai/* (provider, budget, log, client)
- src/app/(dashboard)/* (entender padrão F3)
- src/components/dashboard/nav-config.ts
- src/app/api/cron/* (extract, generate, collect-hn, health)
- vercel.json
- package.json

3) Reporte ANTES de editar:
- escopo confirmado e diff esperado de tabelas;
- preview SQL completo da migration F4A (idempotente, sem DROP, com FK e índices);
- **sem autorização genérica de migration:** cada `db:migrate` só após minha **aprovação explícita e específica** daquele SQL;
- lista exata de arquivos a criar/alterar;
- pacotes a instalar (justificativa por DP-14);
- estimativa de custo IA no **cap vigente** (ENV/`cost_budgets`; alvo típico validação F4/F5: US$ 5/mês — configurável, D-16);
- riscos identificados;
- pergunte aprovação explícita.

4) Após aprovação de escopo **e** aprovação **separada** da migration:
- aplique migration em dev somente depois que eu confirmar explicitamente aquele SQL;
- adapter signals → evidences: **apenas sinais novos**; **proibido backfill retroativo** em F4A (job futuro = opcional, dry-run + aprovação separada);
- implemente pasta src/sources/hn/signal-to-evidence.ts, src/sources/manual/, src/sources/watch/;
- implemente src/motor/* (evidence-store, trend-engine, need-cluster, opportunity-score, opportunity-gate, prompts);
- implemente src/prompts/p_evi_001.ts, p_trd_001.ts, p_opp_001.ts (versão 001) e seed em prompts;
- implemente endpoints /api/cron/build-evidence, /api/cron/score-opportunities, /api/manual/analyze;
- atualize vercel.json (mantenha cron antigo intacto; adicione 2 novos);
- crie 8 rotas /funil/* (radar, watch-topics, manual, trends, need-clusters, opportunities, opportunities/[id], source-confidence);
- **UI:** toda opportunity HN-only candidata/qualificada em F4A exibe **Baixa confiança de fonte**;
- atualize nav-config: novo grupo "Funil" acima de "Operação"; marque telas legadas com badge LEGADO;
- seedar pesos f4_* novos sem mexer em pesos legados;
- não hardcodear cap mensal de IA no código — ENV + cost_budgets.

5) Validações obrigatórias antes do handback:
- npm run typecheck / lint / build passam;
- migration aplicada em dev só após aprovação explícita;
- smoke: adapter adapta todos os sinais novos elegíveis; se houver <10, documentar **dados insuficientes** e validar lote ≥10 por fixture/dev seed controlado (sem backfill);
- ≥ 1 opportunity_card criada a partir de need_cluster válido; **não exigir qualified_opportunity em F4A HN-only**;
- UI: opportunity HN-only candidata/qualificada com **Baixa confiança de fonte**;
- source_confidence ≤ 0.40 em 100% das opportunities (HN-only);
- opportunity com `blacklist_tags`, categoria bloqueada, alto risco ou `not_indielab_fit` não vira opportunity_candidate; deve ser rejected com reason_codes;
- manual analysis end-to-end ok;
- F3 legado intacto, sem regressão visível;
- assertBudget testado no cap vigente;
- nada de prompt antigo modificado;
- nada de pipeline F2 alterado;
- custo IA da fase compatível com cap vigente em dev.

6) Proibido (mesmo se aparentemente útil):
- adicionar collector novo;
- mexer em src/pipeline/* ou src/collectors/algolia-hn.ts;
- alterar prompts 001 legados;
- desligar runIdeaGeneration;
- chamar OpenAI sem assertBudget;
- alterar .env, secrets, mcp.json;
- commit/push/PR;
- backfill retroativo signals → evidences.

7) Entrega final:
- docs/handback/F4A_DONE.md seguindo docs/HANDOFF_TEMPLATE.md;
- chame Agent 5 para review (não execute review você mesmo).

Em qualquer dúvida estratégica, pare e pergunte ao operador. Não improvise produto.
```

---

## 8. Critérios para escalonar para Agent 0 (não improvisar)

Pause F4A e reporte se:

- Schema `signals`/`clusters`/`ideas`/`briefs` precisar mudar além do brief.
- Pipeline F2 precisar ser alterado.
- Migration tiver `DROP` ou alteração destrutiva.
- Custo IA marginal exceder US$ 1/mês em dev.
- Fonte nova for necessária para fechar gate.
- Pacote novo precisar entrar (DP-14).
- Conflito real PRD vs F4_OPPORTUNITY_MOTOR.md.
