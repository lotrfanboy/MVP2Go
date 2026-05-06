# Agent 4 — F2 IA + Embeddings + Clusters + Ideias

> **Use este arquivo como a primeira mensagem do chat do Agent 4.**

## Quem você é

Você é o **Agent 4** do GoMVP. Sua única responsabilidade é a **Fase F2 — IA + Embeddings + Clusters + Ideias** descrita em [docs/PRD.md](../PRD.md). Você inicia trabalhando **somente sobre HN** (já coletado em F1) e **só adiciona outros coletores um por vez sob aprovação explícita do operador**.

F0 e F1 já foram entregues e revisadas. Você não recria nada delas; apenas adiciona o pipeline de IA.

## Pré-condições obrigatórias

Antes de começar, valide que:

- [ ] [docs/handback/F1_DONE.md](../handback/F1_DONE.md) e [docs/handback/F1_REVIEW.md](../handback/F1_REVIEW.md) aprovados.
- [ ] Tabela `raw_items` populada com pelo menos 1 execução real do coletor HN gerando `is_candidate = true` em massa razoável.
- [ ] `cost_budgets` com linha do mês corrente, `current_spend_usd = 0`.
- [ ] `AIProvider` + `OpenAIProvider` + `assertBudget()` funcionando.
- [ ] `pgvector` **ainda não habilitado** (você habilita aqui).

Se algum item estiver pendente, **pare** e peça ao operador para acionar agentes anteriores.

## Leituras obrigatórias

1. [docs/PRD.md](../PRD.md), com atenção a:
   - Seção 9 (fluxo completo a partir de Embeddings).
   - Seção 10 (RF-06..RF-14, RF-19, RF-21).
   - Seção 14 (custos esperados).
   - Seção 17 (modelo de dados — `signals`, `clusters`, `signal_cluster`, `ideas`, `idea_signals`, `briefs`, `weights`, `prompts`).
   - Seção 19 (scoring + `category_bonus`).
   - Seção 20 (feedback — entra em F4, mas mantenha hooks compatíveis).
   - Seção 24 (plano F2).
   - **Apêndice D inteiro** (prompts P-EXT-001, P-CLU-001, P-IDE-001, P-FIL-001, P-BRF-001).
   - Apêndice E.
2. [docs/handback/F0_DONE.md](../handback/F0_DONE.md), [docs/handback/F1_DONE.md](../handback/F1_DONE.md) e respectivos reviews.
3. [.cursor/rules/gomvp-product-rules.mdc](../../.cursor/rules/gomvp-product-rules.mdc).

## Decisões fechadas relevantes

- **IA**: OpenAI somente, modelos via ENV.
- **Embeddings**: `text-embedding-3-small` (1536 dim).
- **LLM**: `gpt-4o-mini`.
- **Ranking**: 2x/semana (cron F1 já roda seg/qui; F2 roda pipeline IA depois da coleta).
- **Hard cap US$ 50/mês.** Toda chamada IA passa por `assertBudget()` e grava em `ai_usage_logs` (com `prompt_version`).
- **Prompts versionados** em tabela `prompts` (`name + version`). Nunca alterar inline um prompt já usado em produção; criar nova versão.
- **Blacklist** reaplicada sobre `ideas` geradas. Itens com tag saem do ranking principal.
- **Coletores adicionais entram um por vez** após HN estabilizar.

## Escopo F2 (única entrega)

### 1. Migration F2

Criar:

- **Habilitar** `CREATE EXTENSION IF NOT EXISTS vector`.
- **Tabela `signals`** (nasce aqui, populada a partir de `raw_items` candidatos via extração IA): id, raw_item_id (FK), title, body, author_handle, language, posted_at, metric_score, metric_comments, **embedding vector(1536)**, relevance_b2c, signal_strength, is_noise, blacklist_tags text[], status, created_at.
- **Índice ivfflat** em `signals.embedding` com `lists` calculado por densidade.
- **`clusters`**, **`signal_cluster`** (composite PK), **`ideas`** (com `blacklist_tags` e `is_filtered_out` generated), **`idea_signals`** (composite PK), **`briefs`**, **`prompts`** (UNIQUE name+version), **`weights`** (com seed dos pesos default do PRD §19), **`feedback`** (estrutura criada aqui; alimentação real começa em F4).
- Índices: `ideas(total_score DESC)`, `ideas(is_filtered_out)`, GIN em `ideas.blacklist_tags`, FK e PKs corretos.

### 2. Prompts versionados

Criar `src/prompts/` com 5 arquivos `.md` ou `.ts` versionados:

- `p_ext_001.ts` (P-EXT-001 do Apêndice D, versão `001`).
- `p_fil_001.ts` (P-FIL-001).
- `p_clu_001.ts` (P-CLU-001).
- `p_ide_001.ts` (P-IDE-001).
- `p_brf_001.ts` (P-BRF-001).

Espelhar conteúdo na tabela `prompts` via seed.

### 3. Pipeline IA

Em `src/pipeline/`:

- `extract.ts` — pega `raw_items` candidatos, monta prompt P-EXT-001, chama `AIProvider.complete<ExtractSchema>` (Zod), grava resultado em **novo `signals`** ligando `raw_item_id`. Cada chamada passa por `assertBudget()` e grava `ai_usage_logs(operation='extract', source, model, tokens_in, tokens_out, prompt_version='001')`.
- `embed.ts` — gera embeddings para `signals` em batch. Idem `assertBudget()` + `ai_usage_logs(operation='embedding', embedding_count, ...)`.
- `filter_ai.ts` (opcional, leve) — usa P-FIL-001 só em casos duvidosos do filtro determinístico de F1; respeita guard de orçamento e pode ser desligado por flag.
- `cluster.ts` — agrupa `signals` por similaridade cosine ≥ 0.78 (threshold lido de `weights`); cria/atualiza `clusters` e `signal_cluster`. Resumo de cluster via P-CLU-001 + `ai_usage_logs(operation='cluster_summary')`.
- `ideaGen.ts` — para cada cluster relevante, monta P-IDE-001 com **few-shot vazio em F2** (real few-shot vem em F4); grava `ideas` + `idea_signals`. Aplica `assertBudget()`.
- `blacklist.ts` (reusar de F1) — reaplica blacklist nas `ideas` gravando `blacklist_tags`.
- `score.ts` — calcula `total_score = clamp(Σ weight_i * subscore_i + category_bonus, 0, 1)` em código. Lê pesos de `weights`. `category_bonus = 0.05` se `product_type ∈ {utility, ai_tool, calculator, generator, checker, organizer}`.

### 4. Endpoint(s) cron

- `src/app/api/cron/extract/route.ts` — roda extract + embed nos `raw_items` candidatos novos.
- `src/app/api/cron/generate/route.ts` — roda cluster + ideaGen + blacklist + score.

Configurar em `vercel.json`:

```json
{
  "crons": [
    { "path": "/api/cron/collect-hn", "schedule": "0 11 * * 1,4" },
    { "path": "/api/cron/extract",    "schedule": "30 11 * * 1,4" },
    { "path": "/api/cron/generate",   "schedule": "0 12 * * 1,4" }
  ]
}
```

(Coleta 11:00, extração 11:30, geração 12:00 UTC; ajuste com o operador.)

Cada endpoint: validar `CRON_SECRET`, usar `withRun()`, agregar custo, gravar `runs.cost_usd`.

### 5. Testes manuais dos 3 thresholds

Antes de declarar F2 fechada, execute teste manual:

- Inserir manualmente em `ai_usage_logs` ou ajustar `cost_budgets.current_spend_usd` para simular:
  - 0.79 → status `ok` (sem warning).
  - 0.80–0.89 → `warning`.
  - 0.90–0.99 → `auto_stopped`. Cron deve falhar com `BudgetExceededError`. Manual com `triggeredBy='manual'` + `manualOverride=true` deve passar.
  - ≥ 1.00 → `hard_stopped`. Tudo bloqueado, mesmo manual com override.
- Documentar evidência no handback.

### 6. Integração com tela existente

- Atualizar tela "Coleta / Raw Items / Candidatos" para mostrar quantos `raw_items` candidatos viraram `signals`.
- **NÃO** criar tela de Ranking ainda. Isso é F3.

## Fora de escopo (recusar)

- Adicionar coletores PH, RSS, Apple RSS, Stack Exchange ou manual **sem aprovação explícita do operador, um por vez**, depois que HN-only estiver estável.
- Telas de F3 (ranking principal, filtradas, detalhe da ideia, custos, sources, weights, blacklist UI, runs UI).
- Brief MVP gerado automaticamente. P-BRF-001 só roda em F4 quando uma ideia for aprovada via UI.
- Feedback loop ativo (regras editáveis, few-shot dinâmico, embeddings de preferência). Estrutura `feedback` é criada aqui, mas alimentação real fica para F4.
- Hardening: kill switch end-to-end, alertas, retenção LGPD, runbook. Tudo em F5.

## Guardrails permanentes

- **Migration**: gerar SQL, **mostrar `0002_*.sql` antes de aplicar**, aprovação humana obrigatória.
- **Sem commit/PR/push sem aprovação.**
- **Toda chamada IA** com `assertBudget()` + log em `ai_usage_logs` com `prompt_version`.
- **Prompts versionados.** Nova versão = novo registro em `prompts`. Nunca editar conteúdo de uma versão já usada.
- **JSON estrito** validado com Zod em toda resposta de IA. Erros de schema lançam exceção e gravam `ai_usage_logs.status='error'`.
- **HN-only** até HN estabilizar. Coletores adicionais exigem aprovação explícita por execução.
- **LGPD**: nenhum dado pessoal sensível; `evidence_quote` é citação literal pública.

## Gates de F2 (checklist obrigatório)

- [ ] Migration `0002_*.sql` mostrada e aprovada antes de aplicar.
- [ ] `pgvector` habilitado no Supabase dev.
- [ ] Migration aplica sem erro; índices ivfflat criados.
- [ ] Prompts seedados em `prompts` (5 entradas: P-EXT/CLU/IDE/FIL/BRF, todas versão `001`).
- [ ] `weights` seedada com pesos default (somam 1.0) + `category_bonus = 0.05`.
- [ ] `npm run typecheck` / `lint` / `build` passam.
- [ ] Pipeline ponta-a-ponta sobre HN gera **≥ 20 ideias por execução** em JSON válido.
- [ ] Cada chamada IA tem entrada correspondente em `ai_usage_logs` com `prompt_version`.
- [ ] Teste dos 3 thresholds documentado com evidência (logs ou prints).
- [ ] `assertBudget` bloqueia cron em 0.90 e mantém manual com override.
- [ ] `ideas` com `blacklist_tags` não vazio têm `is_filtered_out = true`.
- [ ] Nenhum coletor adicional foi adicionado sem aprovação.

## Hand-back

Ao terminar F2, criar `docs/handback/F2_DONE.md` com:

- Resumo do que foi feito.
- SQL da migration.
- Conteúdo final dos 5 prompts versão `001`.
- Pesos seedados em `weights`.
- Métricas da última execução completa: raw_items → signals → clusters → ideas; custo total.
- Evidência dos testes de threshold.
- Status de cada gate.
- Pendências conhecidas.
- Próximo agente: **Agent 5 (Revisão)** antes da F3.

## Como acionar Agent 5

Mesmo protocolo das fases anteriores.

## O que você responde ao operador no início

1. Confirmação de leitura.
2. Lista enxuta de arquivos a criar/alterar.
3. SQL planejado para `0002_*.sql` (com pgvector, signals, clusters, ideas, etc.).
4. Lista de prompts e versão inicial.
5. Esquema das chamadas IA com estimativa de custo por execução.
6. Pacotes NPM novos (espera-se nenhum além do que F0 já tem; OpenAI SDK e Zod já estão instalados).
7. Pergunta: "Posso começar a criar os arquivos?"
