# F4B Google Trends / Cross-source Evidence — Done

## Cabeçalho

- **Agente:** Agent 9
- **Fase / Gate:** F4B — Cross-source Google Trends
- **Tipo de handback:** done
- **Status final do gate:** approved_with_minors recomendado para review
- **Data:** 2026-06-01
- **Branch / Worktree:** main
- **Reviewer solicitado:** Agent 5

---

## 1. Scope completed

- [x] Estratégia BigQuery-first documentada e aprovada antes do collector.
- [x] Google Trends implementado como source adapter em `src/sources/gtrends/`.
- [x] Usado SDK oficial `@google-cloud/bigquery`; sem scraping, sem provider pago, sem `google-trends-api`, sem fetch direto em endpoint web não documentado.
- [x] Implementado discovery geral Top/Rising via BigQuery public dataset.
- [x] Mantido lookup arbitrário real como unsupported: `lookupGTrendsTopic(...)` retorna `unsupported_by_bigquery_public_dataset`.
- [x] Criado endpoint server-only `/api/cron/collect-trends`, protegido por `CRON_SECRET`.
- [x] Persistidas evidences reais `source_key='gtrends'`, `evidence_type='search_momentum'` em dev.
- [x] Validado que `search_momentum` mantém `pain_text=null` e `audience_hint=null`; Trends não inventa dor.
- [x] Validada idempotência/dedupe: repetição da mesma coleta não duplica evidences.
- [x] Validado que `runTrendEngine()` reconhece GT e gera `trend_candidates`.
- [x] Criado diagnóstico read-only de overlap em `npm run test:gtrends-overlap`.
- [x] Melhorada `/funil/source-confidence` com trace genérico da camada `evidences`.
- [x] Confirmado que `manual`/`watch` seguem sem elevar Source Confidence externa.
- [x] Confirmado que `vercel.json` não ativa cron operacional de Trends.

Fora do escopo, por decisão prudente:

- Não criei migration.
- Não alterei schema.
- Não alterei `src/motor/*`.
- Não alterei `vercel.json`.
- Não rodei `score-opportunities` sem overlap real, para evitar chamada LLM sem benefício de source confidence.
- Não chamei OpenAI/LLM na coleta Trends.
- Não adicionei provider pago.
- Não usei scraping, browser/headless, fetch direto ou biblioteca não oficial.
- Não iniciei F4C/F5.

## 2. Files created

- `src/sources/gtrends/README.md`
- `src/sources/gtrends/types.ts`
- `src/sources/gtrends/collector.ts`
- `src/sources/gtrends/normalizer.ts`
- `src/app/api/cron/collect-trends/route.ts`
- `scripts/test-gtrends-normalizer.ts`
- `scripts/test-gtrends-overlap.ts`
- `docs/handback/F4B_GTRENDS_IMPLEMENTATION.md`
- `docs/handback/F4B_GTRENDS_VALIDATION.md`
- `docs/handback/F4B_GTRENDS_OVERLAP_TRACE.md`
- `docs/handback/F4B_DONE.md`

## 3. Files changed

- `package.json` — adiciona `@google-cloud/bigquery` e scripts `test:gtrends-normalizer` / `test:gtrends-overlap`.
- `package-lock.json` — lockfile atualizado pelo install do SDK oficial.
- `src/sources/gtrends/README.md` — atualizado com status real de implementação, validação, limitações e próximos passos.
- `src/app/(dashboard)/funil/source-confidence/page.tsx` — adiciona trace genérico de evidências recentes, sem lógica específica de GT.

## 4. Commands executed

| Comando | Resultado | Observação |
|---|---|---|
| `npm install @google-cloud/bigquery` | ok | Instalou SDK oficial Google; audit reportou vulnerabilidades existentes. |
| BigQuery metadata via `tsx -e` | ok | Confirmou schema e particionamento por `refresh_date`. |
| Dry-run inicial BigQuery | ok/skipped | Estimativa ~445 MB excedia cap inicial de 100 MB. |
| Dry-run otimizado Top/Rising | ok | `DISTINCT term, rank, score`; ~258 MB por tabela. |
| Coleta real pequena Top/Rising | ok | 20 fetched, 5 inserted, 15 skipped; antes havia 1 insert parcial, total final 6 GT evidences. |
| Repetição da coleta real pequena | ok | 20 fetched, 0 inserted, 20 skipped. |
| `runTrendEngine()` | ok | 25 trend rows totais; 18 rows para tópicos GT. |
| `npm run test:gtrends-normalizer` | ok | Normalizer e stub lookup validados. |
| `npm run test:gtrends-overlap` | ok | Sem overlap GT + HN/need clusters nos dados atuais. |
| `npm run test:opportunity-gate` | ok | Gates determinísticos F4A continuam válidos. |
| `npm run test:opportunity-blacklist` | ok | Fixture criou 1 rejected, cleanup OK, `ai_usage_logs` não incrementou. |
| `npm run typecheck` | ok | Sem erros TypeScript. |
| `npm run lint` | ok | Sem erros ESLint. |
| `npm run build` | ok | Build passou; warning crônico do plugin ESLint do Next permanece. |
| Endpoint smoke via `npm exec tsx -- -e` | failed/killed | Quoting/parsing do npm interpretou `-e` incorretamente; rota não foi validada por esse comando. |
| Endpoint smoke via `node_modules/.bin/tsx.cmd -e` | ok | 401 sem header; 200 disabled com header válido, sem BigQuery/evidence/IA. |
| `rg collect-trends vercel.json` | ok | Sem matches; cron operacional não ativado. |

## 5. Packages installed

- `@google-cloud/bigquery@8.3.1` — SDK oficial Google para BigQuery. Justificativa DP-14: usar integração oficial, evitando scraping, fetch direto em endpoints web não documentados e bibliotecas não oficiais.

## 6. Migrations proposed / applied

Nenhuma.

## 7. Env vars introduced or changed

Nenhuma variável foi adicionada ou alterada em `.env` / `.env.example`.

Config necessária/documentada para uso controlado do adapter:

- `CRON_SECRET` — server-only; protege `/api/cron/collect-trends`.
- `GTRENDS_ENABLED` — precisa estar ativo para coleta real.
- `GOOGLE_CLOUD_PROJECT` ou `GCLOUD_PROJECT` ou `GOOGLE_CLOUD_QUOTA_PROJECT` — projeto de quota/billing BigQuery.
- `GTRENDS_DEFAULT_COUNTRY_CODE` — default operacional; fallback do código é `BR`.
- `GTRENDS_DEFAULT_REGION_NAME` — filtro regional opcional.
- `GTRENDS_REFRESH_DATE` — override opcional para dev/teste.
- `GTRENDS_MAX_ROWS` — cap opcional; fallback 25.
- `GTRENDS_MAX_BYTES_BILLED` — safety cap opcional; fallback conservador.

`.env.example` atualizado? não.

Nenhum secret foi impresso no handback. O endpoint smoke usou `CRON_SECRET` efêmero apenas no processo local.

## 8. Tests / checks run

- Tests automatizados / scripts:
  - `npm run test:gtrends-normalizer`: ok.
  - `npm run test:gtrends-overlap`: ok.
  - `npm run test:opportunity-gate`: ok.
  - `npm run test:opportunity-blacklist`: ok.
- Checks:
  - `npm run typecheck`: ok.
  - `npm run lint`: ok.
  - `npm run build`: ok.
- Endpoint smoke:
  - Sem `Authorization`: HTTP 401, body `{ "ok": false }`.
  - Com `Authorization` válido e `enabled=false&dryRun=true&maxRows=1`: HTTP 200, `stats.status='disabled'`, `fetched=0`, `normalized=0`, `inserted=0`, `skipped=0`, `costUsd=0`, erro esperado `gtrends_disabled`.
  - Run auditável criada no smoke: `runs.id='92ac542e-3853-4c5f-92ed-cf78ed1c4444'`.
- Smoke manual / dados:
  - `gtrends:search_momentum` persistido: 6 evidences em dev.
  - `runTrendEngine()` reconheceu GT e gerou trend candidates.
  - `/funil/source-confidence` agora permite auditar evidences recentes de forma genérica.

## 9. AI cost in this phase

Sem chamada IA na coleta Google Trends.

- Coleta Trends: não chama OpenAI/LLM.
- Normalizer/overlap/endpoint disabled: não chamam IA.
- `runTrendEngine()` é determinístico.
- `test:opportunity-blacklist`: `ai_usage_logsBefore=0`, `aiUsageLogsAfter=0` para o `runId` da fixture.
- `score-opportunities` não foi rodado nesta etapa final porque não havia overlap real GT + HN/need clusters e poderia chamar P-OPP-001 sem demonstrar source confidence.

BigQuery estimado na validação controlada:

- Dry-run inicial: sem cobrança de query real.
- Coleta real `international_top_rising_terms`: ~258 MB, ~US$ 0.00147 antes de free tier.
- Coleta real `international_top_terms`: ~258 MB, ~US$ 0.00147 antes de free tier.
- Total estimado da coleta Top/Rising: ~517 MB, ~US$ 0.00294 antes de free tier.
- Repetição para dedupe executou leitura equivalente estimada.

## 10. Known issues

- BigQuery public dataset cobre discovery Top 25 / Top Rising; não cobre lookup arbitrário completo equivalente ao Google Trends Explore.
- `lookupGTrendsTopic(...)` segue intencionalmente stubbed como `unsupported_by_bigquery_public_dataset`.
- Manual/watch enrichment real permanece bloqueado até aprovação de provider oficial/pago ou outro caminho que suporte lookup/matching de forma compatível.
- Não houve overlap atual entre `gtrends.topic_key` e HN/`need_clusters`/opportunities.
- Portanto `source_confidence >= 0.65` não foi demonstrado nos dados reais atuais.
- Isso é limitação de dados/match, não falha automática do adapter: `>=0.65` é meta operacional, não blocker absoluto, conforme brief.
- Dados Top/Rising BR coletados foram ruidosos para microprodutos, com exemplos de esportes/celebridades.
- Cron operacional segue desligado; `/api/cron/collect-trends` existe, mas não está em `vercel.json`.
- Warning crônico do build permanece: "The Next.js plugin was not detected in your ESLint configuration."
- `npm install` reportou vulnerabilidades no audit; não rodei `npm audit fix` por estar fora do escopo aprovado.

## 11. Deviations from plan

- **O que mudou:** Cron operacional não foi ativado em `vercel.json`.
- **Por que mudou:** Decisão prudente do operador após validação: há custo BigQuery real por query, Top/Rising é ruidoso e ainda não há overlap GT + HN.
- **Risco aceito:** O endpoint precisa ser acionado manualmente/controladamente até nova aprovação; F4B fica revisável, mas não operacional em cron.
- **Aprovação:** sim, operador instruiu explicitamente não atualizar cron operacional.

- **O que mudou:** `source_confidence >= 0.65` não foi demonstrado.
- **Por que mudou:** Não houve `topic_key` compartilhado entre GT e HN/need clusters nos dados reais atuais.
- **Risco aceito:** Cross-source está tecnicamente preparado, mas a meta operacional depende de dados/match ou provider de lookup futuro.
- **Aprovação:** documentado como meta não-blocker no brief F4B.

- **O que mudou:** Não rodei `score-opportunities` na validação final.
- **Por que mudou:** Sem overlap real, o comando poderia chamar LLM sem demonstrar ganho de source confidence.
- **Risco aceito:** F4B fecha com evidência GT + trend engine + trace, mas sem recomputar opportunity scoring inútil.
- **Aprovação:** alinhado ao escopo proibido pelo operador.

## 12. Open questions

- O operador quer aceitar discovery Top/Rising genérico como suficiente para F4B em modo `approved_with_minors`, ou exigir fluxo futuro de matching controlado antes de ativar cron?
- O próximo passo de GT deve ser matching controlado contra `watch_topics` usando apenas Top/Rising, sem lookup arbitrário?
- Vale aprovar futuramente um provider oficial/pago para lookup arbitrário, ou manter GT apenas como discovery?
- Quando for seguro ativar `/api/cron/collect-trends` em `vercel.json`, qual cadência e cap BigQuery serão usados?

## 13. Next recommended step

> Acionar `Agent 5` para revisar F4B, com foco em compliance BigQuery, cost guard, endpoint cron protegido, idempotência, ausência de IA/scraping/provider pago, ausência de schema/motor changes, e limitação objetiva de overlap/source confidence.

## 14. Reviewer requested

- Reviewer: `Agent 5`.
- Foco recomendado da review:
  - BigQuery-first com SDK oficial.
  - Ausência de scraping, provider pago, `google-trends-api` e fetch direto.
  - Nenhuma migration/schema change.
  - Nenhuma alteração em `src/motor/*`.
  - `manual`/`watch` não elevam Source Confidence.
  - Endpoint `/api/cron/collect-trends`: 401 sem header e 200 disabled com header válido.
  - `gtrends:search_momentum` persistido e idempotente.
  - `runTrendEngine()` reconhecendo GT.
  - Trace genérico em `/funil/source-confidence`.
  - Sem overlap atual e sem demonstração real de `source_confidence >= 0.65`.
