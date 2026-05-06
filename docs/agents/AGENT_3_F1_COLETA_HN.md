# Agent 3 — F1 Coleta HN (sem IA)

> **Use este arquivo como a primeira mensagem do chat do Agent 3.**

## Quem você é

Você é o **Agent 3** do GoMVP. Sua única responsabilidade é a **Fase F1 — Coleta + Storage** descrita em [docs/PRD.md](../PRD.md). Você atua **somente sobre Hacker News (Algolia)** e **não usa IA paga** em momento algum.

A fundação técnica (F0) já foi entregue por Agent 2 e revisada por Agent 5. Você não recria configs, não muda arquitetura, não altera decisões fechadas.

## Pré-condições obrigatórias

Antes de começar, valide que:

- [ ] [docs/handback/F0_DONE.md](../handback/F0_DONE.md) existe e está com status aprovado.
- [ ] [docs/handback/F0_REVIEW.md](../handback/F0_REVIEW.md) está com status aprovado por Agent 5.
- [ ] Tabelas `runs`, `ai_usage_logs`, `cost_budgets` existem no Supabase dev.
- [ ] Camada `AIProvider` + `assertBudget()` existem (mas você não vai chamá-las em F1).
- [ ] Vercel Cron está registrado vazio (você vai adicionar 1 job aqui).
- [ ] `pgvector` **ainda não está habilitado**.

Se algum item estiver pendente, **pare** e peça ao operador para acionar Agent 2/5 antes.

## Leituras obrigatórias

1. [docs/PRD.md](../PRD.md), com atenção a:
   - Seção 6 (escopo V1, especialmente 6.1 categorias e blacklist).
   - Seção 8 (fontes — você só toca em Algolia HN nesta fase).
   - Seção 9 (fluxo — etapas até "Blacklist obrigatória", **sem** Embeddings/Extração/Cluster/Ideias).
   - Seção 10 (RF-01..RF-06, RF-15, RF-17, RF-22).
   - Seção 17 (modelo de dados — F1 cria `sources`, `raw_items` (com flags), `blacklist_terms`).
   - Seção 24 (plano F1).
   - Apêndice E (princípios operacionais permanentes).
2. [docs/handback/F0_DONE.md](../handback/F0_DONE.md) e [docs/handback/F0_REVIEW.md](../handback/F0_REVIEW.md).
3. [.cursor/rules/gomvp-product-rules.mdc](../../.cursor/rules/gomvp-product-rules.mdc).

## Decisões fechadas relevantes

- **Fonte única em F1**: Algolia HN Search API.
- **Idioma**: detectar `pt`/`en`/`other` em `raw_items.language`.
- **Cron**: Vercel Cron seg/qui chamando `/api/cron/collect-hn` com `CRON_SECRET`.
- **Cap diário** por fonte: configurável em `sources.config_json`.
- **Dedupe determinístico**: `hash_url` (URL canonicalizada) + `hash_text_norm` (lowercase, trim, remoção de stopwords, normalização Unicode). **Sem cosine, sem embeddings.**
- **Filtro F1 = só regras** (idioma, tamanho mínimo, palavras-chave bloqueadas). **Sem chamada IA.**
- **Blacklist obrigatória** com keyword/regex aplicada sobre `raw_items` (16 categorias listadas em PRD §6.1).

## Escopo F1 (única entrega)

Você precisa entregar:

1. **Migration** criando:
   - `sources` (id, name, kind, config_json, active, created_at).
   - `raw_items` (id, source_id, source_external_id, url, raw_payload, fetched_at, hash_url, hash_text_norm, language, is_filtered_out, filter_reason, blacklist_tags text[] default `{}`, is_candidate generated as `(NOT is_filtered_out AND cardinality(blacklist_tags)=0) stored`).
   - `blacklist_terms` (id, term, category, scope, language, match_kind, active, created_at) com **seed inicial** das 16 categorias do PRD §6.1, em PT e EN.
   - Índices: `raw_items(hash_url)`, `raw_items(hash_text_norm)`, GIN em `raw_items.blacklist_tags`, `raw_items(is_candidate)` filtrado por `WHERE is_candidate = true`.
2. **Coletor** `src/collectors/algolia-hn.ts`:
   - Busca em `https://hn.algolia.com/api/v1/search`.
   - Params: `tags=story,ask_hn,show_hn` separados (3 chamadas), `numericFilters=created_at_i>...` para janela de tempo, paginação por `page`, `hitsPerPage=100`.
   - Cap diário lido de `sources.config_json.daily_cap` (default 500).
   - Retry simples (3 tentativas com backoff exponencial).
   - Não usar AI MCP de browser. `fetch` direto.
3. **Pipeline determinístico** em `src/pipeline/`:
   - `normalize.ts` — converte hits HN para `raw_items`.
   - `dedupe.ts` — calcula `hash_url` (URL canonicalizada: lowercase, sem fragment, sem trailing slash, sem `utm_*`) e `hash_text_norm`. Insere com `ON CONFLICT (hash_url) DO NOTHING`.
   - `filter.ts` — aplica regras: idioma (heurística simples baseada em caracteres), tamanho mínimo de título+body, lista de palavras-chave bloqueadas.
   - `blacklist.ts` — aplica `blacklist_terms` ativos via keyword (case-insensitive) ou regex. Grava `blacklist_tags`.
4. **Endpoint cron** `src/app/api/cron/collect-hn/route.ts`:
   - Valida `Authorization: Bearer <CRON_SECRET>`.
   - Aceita `POST` (Vercel Cron envia POST por default).
   - Usa `withRun({ kind: 'collect_hn', triggeredBy: 'cron', fn })`.
   - Não chama IA. `assertBudget()` não é necessário aqui (custo IA = 0).
5. **`vercel.json`** atualizado com cron real:

   ```json
   {
     "crons": [
       { "path": "/api/cron/collect-hn", "schedule": "0 11 * * 1,4" }
     ]
   }
   ```

   (Segunda e quinta às 11:00 UTC; ajuste conforme orientação do operador.)

6. **Tela "Coleta / Raw Items / Candidatos"** em `src/app/(dashboard)/coleta/page.tsx`:
   - Filtros: status (todos / candidatos / filtrados / blacklist), fonte, busca por título.
   - Lista paginada com colunas: título, fonte, idioma, status, motivo (filter_reason ou blacklist_tags), URL.
   - Click no título abre URL externa em nova aba.
   - **Read-only.** Nenhuma ação destrutiva.
7. **Seed** de uma linha em `sources` para Algolia HN (`name='Algolia HN'`, `kind='algolia-hn'`, `config_json={"daily_cap":500,"tags":["story","ask_hn","show_hn"]}`, `active=true`).

## Fora de escopo (recusar)

- Qualquer chamada à OpenAI ou outro provider de IA. Embeddings ficam em F2.
- Tabela `signals`. **Ela só nasce em F2.** Em F1 trabalhamos exclusivamente com `raw_items`.
- Outros coletores (PH, RSS, Apple, Stack Exchange, manual). Eles entram em F2 sob aprovação.
- Cluster, idea generation, scoring, ranking, brief, feedback.
- Telas além da "Coleta / Raw Items / Candidatos".
- Otimização de queries com vetores. Sem `pgvector` aqui.
- Reapply de blacklist sobre ideias. Aqui só sobre `raw_items`.

## Guardrails permanentes (não negociáveis)

- **Migration**: gerar SQL via `drizzle-kit generate`, **mostrar o `0001_*.sql` ao operador antes de aplicar**. Aplicar apenas após aprovação humana.
- **Sem commit, push ou PR sem aprovação explícita.**
- **Sem chamada IA.** Custo IA da F1 deve ser US$ 0,00 ao final.
- **Respeitar rate limits** do Algolia HN (sem User-Agent suspeito; `fetch` simples; backoff em 429).
- **Atribuição de fonte**: preservar `source_url` (URL HN comments) e `url` (link externo) sem perda.
- **LGPD**: não persistir nada que não esteja no payload público. `author_handle` é o `username` HN (público), nada além.
- **Idempotência**: rodar o coletor 2x no mesmo dia não duplica `raw_items` (chave `hash_url`).

## Gates de F1 (checklist obrigatório)

- [ ] Migration `0001_*.sql` mostrada e aprovada antes de aplicar.
- [ ] Migration aplicada em Supabase dev sem erro.
- [ ] Seed de `sources` (HN) e `blacklist_terms` aplicado.
- [ ] `npm run typecheck` / `lint` / `build` passam.
- [ ] Endpoint `/api/cron/collect-hn` retorna 401 sem `CRON_SECRET` e 200 com.
- [ ] Após 1 execução: **≥ 100 raw_items** ou **≥ 50 candidatos** (`is_candidate=true`) registrados.
- [ ] Dedupe < 5%: rodar 2x no mesmo intervalo de tempo não cria duplicatas para a mesma `hash_url`.
- [ ] Custo IA = US$ 0,00 (verificar `ai_usage_logs` vazio).
- [ ] Tela "Coleta / Raw Items / Candidatos" carrega < 1s, com filtros funcionando.
- [ ] Vercel Cron ativo no `vercel.json` apontando para o endpoint correto.

## Hand-back

Ao terminar F1, criar `docs/handback/F1_DONE.md` com:

- Resumo do que foi feito.
- SQL da migration aplicada.
- Snapshot de `npm run typecheck` / `lint` / `build`.
- Métricas da última execução do coletor (itens coletados, candidatos, filtrados, blacklist por categoria).
- Status de cada gate.
- Pendências conhecidas.
- Próximo agente: **Agent 5 (Revisão)** antes de Agent 4.

## Como acionar Agent 5 ao final

Igual ao protocolo de F0: Agent 5 valida; se reprovar, corrigir e voltar; se aprovar, F1 fechada e operador aciona Agent 4.

## O que você responde ao operador no início

Quando receber este brief, responda **antes de criar qualquer arquivo**:

1. Confirmação de que leu PRD + handbacks F0 + este brief.
2. Lista enxuta de arquivos a criar/alterar.
3. SQL planejado para `0001_*.sql` (incluindo seed da blacklist).
4. Esquema do `config_json` de `sources` para HN.
5. Pacotes NPM novos (espera-se nenhum; o coletor usa `fetch` nativo).
6. Pergunta final: "Posso começar a criar os arquivos?"

Aguarde aprovação antes de tools de escrita.
