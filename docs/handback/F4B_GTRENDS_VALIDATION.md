# F4B Google Trends BigQuery Validation

## Cabeçalho

- **Agente:** Agent 9
- **Fase / Gate:** F4B — validação controlada Google Trends BigQuery
- **Tipo de handback:** partial validation
- **Status final do gate:** partial
- **Data:** 2026-05-29
- **Branch / Worktree:** main
- **Reviewer solicitado:** ainda não; validação parcial

> Este arquivo registra a validação BigQuery controlada. Ele **não substitui** `docs/handback/F4B_DONE.md`.

---

## 1. Scope completed

- [x] Validado metadata da tabela BigQuery pública.
- [x] Rodado dry-run estreito antes de qualquer query real.
- [x] Otimizada query para colunas mínimas (`term`, `rank`, `score`) e `DISTINCT`.
- [x] Rodada coleta real pequena em dev com `countryCode=BR`, `maxRows=10`, cap temporário por query de 500 MB.
- [x] Persistidas evidences `source_key='gtrends'`, `evidence_type='search_momentum'`.
- [x] Repetida a coleta para validar dedupe/idempotência.
- [x] Validado que `pain_text` e `audience_hint` permanecem nulos.
- [x] Recomputado `trend_candidates` via `runTrendEngine()` sem chamada IA.
- [x] Confirmado que não houve match `topic_key` entre GT e `need_clusters` atuais.

Fora do escopo desta validação:

- Não alterei `vercel.json`.
- Não alterei UI.
- Não iniciei F5.
- Não implementei lookup arbitrário real.
- Não usei scraping, provider pago, SerpAPI/DataForSEO, `google-trends-api` ou fetch direto.
- Não rodei `score-opportunities`, porque não havia overlap GT/HN e isso poderia chamar LLM sem benefício para source confidence.

## 2. Env/config usados

Config fornecida/aplicada localmente para os comandos:

- `GOOGLE_CLOUD_PROJECT=project-5dcc8a8d-1451-4fae-b85`
- `GTRENDS_ENABLED=true`
- `GTRENDS_DEFAULT_COUNTRY_CODE=BR`
- `GTRENDS_MAX_ROWS=10`
- `GTRENDS_MAX_BYTES_BILLED=100000000` no dry-run inicial
- `GTRENDS_MAX_BYTES_BILLED=500000000` temporário para query real aprovada

Credenciais:

- ADC ou service account server-only disponível no ambiente local.
- Nenhum secret foi impresso.
- `.env`/`.env.example` não foram alterados.

## 3. BigQuery metadata

Tabela inspecionada:

- `bigquery-public-data.google_trends.international_top_rising_terms`

Resultado:

- Tipo: `TABLE`
- Particionamento: `DAY`, campo `refresh_date`
- Clustering: nenhum
- Campos confirmados:
  - `country_code`
  - `region_name`
  - `term`
  - `score`
  - `percent_gain`
  - `refresh_date`
  - `country_name`
  - `region_code`
  - `week`
  - `rank`

Observação: `_PARTITIONDATE` não é reconhecido nessa tabela; o filtro correto é `refresh_date`.

## 4. Dry-run

Dry-run inicial:

- Tabela: `international_top_rising_terms`
- Filtros: `refresh_date=2026-05-28`, `country_code=BR`
- Colunas anteriores: `term`, `rank`, `score`, `refresh_date`, `week`, `country_code`, `region_name`
- Cap: 100 MB
- Estimativa: `444876280` bytes (~445 MB)
- Status: skipped por exceder cap

Dry-run otimizado:

- Query passou a selecionar somente `DISTINCT term, rank, score`.
- Filtros mantidos: `refresh_date=2026-05-28`, `country_code=BR`
- `international_top_rising_terms`: `258254466` bytes, custo estimado `0.0014680066783512302`
- `international_top_terms`: `258383400` bytes, custo estimado `0.0014687395832879702`
- Total top+rising: `516637866` bytes, custo estimado `0.0029367462616392004`

Conclusão: query real pequena é segura para dev com cap temporário de 500 MB por query, mas não deve ser ativada em cron operacional ainda.

## 5. Coleta real pequena

Primeira coleta real Top/Rising:

```json
{
  "status": "ok",
  "fetched": 20,
  "normalized": 20,
  "inserted": 5,
  "skipped": 15,
  "estimatedBytes": "516637866",
  "estimatedCostUsd": 0.0029367462616392004
}
```

Observação: antes da otimização `DISTINCT`, uma coleta de `international_top_rising_terms` já havia inserido 1 evidence. Total final em dev: 6 evidences `gtrends`.

## 6. Dedupe/idempotência

Repetição da mesma coleta Top/Rising:

```json
{
  "status": "ok",
  "fetched": 20,
  "normalized": 20,
  "inserted": 0,
  "skipped": 20,
  "estimatedBytes": "516637866",
  "estimatedCostUsd": 0.0029367462616392004
}
```

Resultado: idempotência validada. Rodar duas vezes não duplica evidences iguais.

## 7. Evidences inseridas

Snapshot por fonte/tipo:

- `manual:manual_seed`: 1
- `hn:discussion_signal`: 1
- `hn:repeated_pain`: 1
- `gtrends:search_momentum`: 6

Exemplo validado:

```json
{
  "sourceKey": "gtrends",
  "evidenceType": "search_momentum",
  "topicKey": "caracas-x-botafogo",
  "topicLabel": "caracas x botafogo",
  "painText": null,
  "audienceHint": null,
  "metricsJson": {
    "rank": 8,
    "score": 13,
    "table": "international_top_rising_terms",
    "match_mode": "discovery_rising",
    "country_code": "BR",
    "refresh_date": "2026-05-28"
  },
  "metadataJson": {
    "trigger": "cron",
    "provider": "bigquery_public_dataset",
    "table_id": "international_top_rising_terms",
    "table_ref": "bigquery-public-data.google_trends.international_top_rising_terms",
    "limitations": [
      "bigquery_public_dataset_top_25_top_rising_only",
      "not_google_trends_explore",
      "no_arbitrary_keyword_lookup"
    ]
  }
}
```

Regra validada: `search_momentum` não cria dor sozinho.

## 8. Impacto no motor

Rodado:

- `runTrendEngine()`

Resultado:

```json
{
  "rows": 25,
  "gtrendsTopicCount": 6,
  "trendRowsForGtrends": 18
}
```

Exemplo de trend candidate GT:

```json
{
  "topicKey": "caracas-x-botafogo",
  "windowKind": "7d",
  "trendScore": "0.434",
  "sourceDiversity": "0.200",
  "evidenceCount": 1
}
```

`gtrends` entrou no motor como evidence externa e gerou `trend_candidates`.

## 9. Source confidence

Overlap entre `gtrends.topic_key` e `need_clusters.topic_key` atuais:

```json
{
  "overlapsCount": 0,
  "overlaps": []
}
```

Conclusão:

- `source_confidence` não subiu nesta validação porque não houve match entre Top/Rising BR coletado e os tópicos HN/need clusters existentes.
- Isso é limitação objetiva dos dados/match, não falha automática da F4B.
- Não rodei `score-opportunities`, pois sem overlap ele não demonstraria cross-source e poderia acionar LLM via P-OPP-001.

## 10. Commands executed

| Comando | Resultado | Observação |
|---|---|---|
| Metadata BigQuery via `tsx -e` | ok | Confirmou schema/particionamento. |
| Dry-run inicial `international_top_rising_terms` | ok/skipped | Válido, mas excedia 100 MB. |
| Dry-run otimizado Top/Rising | ok | ~258 MB por tabela. |
| Coleta real pequena Top/Rising | ok | 20 fetched, 5 inserted, 15 skipped. |
| Repetição da coleta | ok | 20 fetched, 0 inserted, 20 skipped. |
| Snapshot DB `gtrends` | ok | 6 evidences `search_momentum`. |
| `runTrendEngine()` | ok | 25 trend rows totais, 18 para GT. |
| `npm run test:gtrends-normalizer` | ok | Stub lookup continua unsupported. |
| `npm run typecheck` | ok | Após ajuste da query `DISTINCT`. |
| `npm run lint` | ok | Sem erros. |
| `npm run build` | ok | Warning crônico do Next ESLint plugin permanece. |

## 11. Costs

BigQuery estimado:

- Dry-run inicial: sem cobrança de query real.
- Coleta real `international_top_rising_terms`: ~258 MB, ~US$ 0.00147 antes de free tier.
- Coleta real `international_top_terms`: ~258 MB, ~US$ 0.00147 antes de free tier.
- Total estimado da coleta Top/Rising: ~517 MB, ~US$ 0.00294 antes de free tier.
- A repetição para dedupe executou a mesma leitura estimada (~US$ 0.00294 antes de free tier).

IA:

- Sem chamada IA na coleta Trends.
- `runTrendEngine()` é determinístico.
- `ai_usage_logs` incremento esperado: 0 nesta validação.

## 12. Known issues / limitations

- Dataset BigQuery retorna Top/Rising de alta volatilidade e muito ruído para microprodutos; os exemplos BR coletados foram esportes/celebridades.
- Sem lookup arbitrário aprovado, não há como forçar validação de um tópico HN/manual específico.
- Não houve cross-source HN + GT no mesmo `topic_key`.
- Manual/watch enrichment real permanece `unsupported_by_bigquery_public_dataset`.
- Cron operacional e UI ainda não foram atualizados.
- `GTRENDS_MAX_BYTES_BILLED=500000000` foi usado apenas localmente para validação; não foi documentado em `.env.example` nem ativado em Vercel.

## 13. Recommendation

Próxima etapa recomendada:

1. Não ativar cron ainda.
2. Implementar uma fatia de UI/trace para visualizar `gtrends` já persistido em `/funil/trends` e `/funil/source-confidence`.
3. Decidir se F4B aceita discovery genérico Top/Rising como suficiente para gate parcial, ou se deve adicionar matching controlado contra `watch_topics` usando apenas Top/Rising (sem lookup arbitrário).
4. Só depois adicionar cron em `vercel.json` e preparar `docs/handback/F4B_DONE.md`.

## 14. Reviewer requested

- Reviewer: ainda não.
- Foco recomendado futuro:
  - BigQuery cost guard.
  - Idempotência.
  - Ausência de IA/scraping/provider pago.
  - Limitação de match HN + GT.
  - Decisão sobre cron/UI.
