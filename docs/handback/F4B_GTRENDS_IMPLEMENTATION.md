# F4B Google Trends Implementation Checkpoint

## Cabeçalho

- **Agente:** Agent 9
- **Fase / Gate:** F4B — Google Trends / Cross-source Evidence
- **Tipo de handback:** partial checkpoint
- **Status final do gate:** partial
- **Data:** 2026-05-29
- **Branch / Worktree:** main
- **Reviewer solicitado:** ainda não; checkpoint intermediário

> Este arquivo é um handback intermediário da primeira fatia segura de F4B. Ele **não substitui** o handback final esperado em `docs/handback/F4B_DONE.md`.

---

## 1. Scope completed

- [x] Implementado adapter Google Trends BigQuery-first para discovery geral Top/Rising.
- [x] Usado somente SDK oficial `@google-cloud/bigquery`.
- [x] Criado `collector.ts` com `collectGTrendsDiscovery(...)`.
- [x] Criado stub `lookupGTrendsTopic(...)` retornando `unsupported_by_bigquery_public_dataset`.
- [x] Criado `normalizer.ts` com `normalizeGTrendsEvidence(...)`.
- [x] `search_momentum` gera evidence com `pain_text=null` e `audience_hint=null`.
- [x] `source_item_id` estável para dedupe/idempotência.
- [x] Criado endpoint `/api/cron/collect-trends`, protegido por `CRON_SECRET`.
- [x] Endpoint retorna summary com `fetched`, `normalized`, `inserted`, `skipped`, `estimatedBytes`, `estimatedCostUsd`, `tables` e `errors`.
- [x] Comportamento sem config/credenciais: `disabled` por default (`GTRENDS_ENABLED` precisa estar ativo) ou `missing_config` se faltar projeto GCP.
- [x] Teste local de normalizer roda sem credenciais BigQuery e sem banco.
- [x] Nenhuma chamada IA na coleta Trends.

Fora do checkpoint atual:

- Watch/manual enrichment real não implementado.
- Lookup arbitrário real não implementado.
- `vercel.json` não alterado.
- UI não alterada.
- Schema/migration não alterados.
- `src/motor/*` não alterado.

## 2. Files created

- `src/sources/gtrends/types.ts`
- `src/sources/gtrends/collector.ts`
- `src/sources/gtrends/normalizer.ts`
- `src/app/api/cron/collect-trends/route.ts`
- `scripts/test-gtrends-normalizer.ts`
- `docs/handback/F4B_GTRENDS_IMPLEMENTATION.md`

## 3. Files changed

- `package.json` — adiciona `@google-cloud/bigquery` e script `test:gtrends-normalizer`.
- `package-lock.json` — lockfile atualizado pelo npm install.

## 4. Commands executed

| Comando | Resultado | Observação |
|---|---|---|
| `npm install @google-cloud/bigquery` | ok | Instalou SDK oficial Google; npm reportou 8 vulnerabilidades existentes/atuais no audit. |
| `npm run test:gtrends-normalizer` | ok | Testa normalização, `source_item_id` estável e stub `unsupported_by_bigquery_public_dataset`, sem credenciais. |
| `npm run typecheck` | failed / ok | Falha inicial por inferência estreita de tipo no endpoint; corrigido e passou. |
| `npm run lint` | ok | Sem erros. |
| `npm run build` | ok | Build passou; warning crônico do plugin Next/ESLint permanece. |

## 5. Packages installed

- `@google-cloud/bigquery@8.3.1` — SDK oficial Google para consultar BigQuery public dataset. Justificativa DP-14: evita scraping, fetch direto em endpoints web não documentados e bibliotecas não oficiais.

## 6. Migrations proposed / applied

Nenhuma.

## 7. Env vars introduced or changed

Nenhuma variável foi adicionada a `.env` ou `.env.example`.

Config esperada/documentada pelo código/README:

- `GTRENDS_ENABLED` — precisa ser `true`/`1` para coleta real.
- `GOOGLE_CLOUD_PROJECT` ou `GCLOUD_PROJECT` ou `GOOGLE_CLOUD_QUOTA_PROJECT` — projeto de billing/quota BigQuery.
- `GTRENDS_DEFAULT_COUNTRY_CODE` — default operacional, fallback `BR`.
- `GTRENDS_DEFAULT_REGION_NAME` — filtro regional opcional.
- `GTRENDS_REFRESH_DATE` — override opcional para dev/teste.
- `GTRENDS_MAX_ROWS` — cap opcional, fallback 25.
- `GTRENDS_MAX_BYTES_BILLED` — safety cap opcional, fallback 25 MB.

`.env.example` atualizado? não.

## 8. Tests / checks run

- `npm run test:gtrends-normalizer`: ok.
- `npm run typecheck`: ok após correção.
- `npm run lint`: ok.
- `npm run build`: ok.
- `ReadLints` nos arquivos alterados: sem erros antes dos checks.

Dry-run BigQuery real: não executado. Não havia aprovação específica para executar query/dry-run real neste checkpoint, e o endpoint fica disabled por default até config explícita.

## 9. AI cost in this phase

- Sem chamada IA.
- Coleta Trends não chama OpenAI/LLM.
- `ai_usage_logs` incremento esperado: 0.

## 10. Known issues

- BigQuery public dataset cobre discovery Top 25 / Top Rising; não cobre lookup arbitrário completo.
- `lookupGTrendsTopic(...)` é intencionalmente stub e retorna `unsupported_by_bigquery_public_dataset`.
- Manual/watch enrichment real segue bloqueado até provider aprovado que suporte lookup arbitrário ou matching parcial explicitamente aprovado.
- Endpoint não está registrado em `vercel.json` neste checkpoint.
- UI `/funil/trends`, `/funil/source-confidence` e detalhe de opportunity ainda não foram atualizados para exibir chips/metadata de GT.
- Nenhuma evidence real `gtrends` foi persistida neste checkpoint porque não rodamos BigQuery real.
- `npm install` reportou 8 vulnerabilidades via audit; não rodei `npm audit fix` porque isso foge do escopo aprovado.

## 11. Deviations from plan

Nenhum desvio do escopo aprovado para esta fatia.

## 12. Open questions

- Operador quer aprovar uma execução BigQuery dry-run estreita em dev?
- Operador quer aprovar atualização de `.env.example` com as variáveis `GTRENDS_*`?
- Próxima fatia deve registrar cron em `vercel.json` ou primeiro validar dry-run/credenciais?
- Como tratar matching parcial de watch/manual contra Top/Rising sem fingir lookup arbitrário?

## 13. Next recommended step

> Operador deve aprovar ou bloquear a próxima fatia: configurar credenciais dev e rodar dry-run BigQuery estreito, ou seguir direto para integração controlada com `vercel.json`/UI após validar endpoint local.

## 14. Reviewer requested

- Reviewer: ainda não.
- Foco recomendado quando for revisar esta fatia:
  - Ausência de schema/migration/UI/motor changes.
  - `lookupGTrendsTopic(...)` não faz lookup real.
  - Idempotência via `source_item_id`.
  - Endpoint com `CRON_SECRET` e sem exposição de secrets.
  - Coleta Trends sem IA.
