# F4B Review — Agent 5

## 1. Status

**approved_with_minors**

## 2. Resumo executivo

F4B foi entregue dentro do escopo aprovado: Google Trends entrou como adapter `gtrends` via BigQuery public dataset, gerando `evidence_type='search_momentum'` sem inventar dor ou audiência. A implementação usa SDK oficial `@google-cloud/bigquery`, não usa scraping/provider pago/headless/fetch web não documentado, e mantém o cron operacional desligado em `vercel.json`.

Não houve overlap real entre tópicos `gtrends` e HN/need clusters atuais, então `source_confidence >= 0.65` não foi demonstrado. Isso está corretamente diagnosticado como limitação de dados/match e **não bloqueia F4B**.

## 3. Scope validation

- [x] Google Trends implementado como source adapter, não produto isolado.
- [x] `source_key='gtrends'` e `evidence_type='search_momentum'`.
- [x] Motor continua lendo `evidences`; não houve schema/migration.
- [x] BigQuery public dataset é o caminho usado.
- [x] `lookupGTrendsTopic(...)` permanece `unsupported_by_bigquery_public_dataset`.
- [x] Manual/watch seguem como seeds internas e não elevam Source Confidence.
- [x] Nenhuma fonte além de Google Trends foi adicionada.
- [x] F4C/F5 não foram iniciadas.
- [x] `vercel.json` não ativa `/api/cron/collect-trends`.

## 4. Gates F4B

| Gate | Resultado |
|---|---|
| README de compliance/rate/custo em `src/sources/gtrends/` | Passou |
| SDK oficial ou alternativa aprovada | Passou: `@google-cloud/bigquery@8.3.1` |
| Sem scraping/headless/provider pago/fetch web não documentado | Passou |
| Endpoint `/api/cron/collect-trends` protegido por `CRON_SECRET` | Passou por inspeção de código e handback de smoke 401/200 disabled |
| Pelo menos 1 `gtrends:search_momentum` persistida | Passou: 6 evidences no diagnóstico |
| `search_momentum` sem `pain_text`/`audience_hint` inventado | Passou via normalizer/test |
| Dedupe/idempotência | Passou: normalizer tem `source_item_id` estável; handback mostra repetição 0 inserted/20 skipped |
| Watch/manual como seeds, sem elevar Source Confidence | Passou por design/documentação; lookup arbitrário segue unsupported |
| `gtrends` no mesmo `topic_key` participaria do Source Confidence | Passou por código (`gtrends` em fontes externas); sem overlap real para demonstrar |
| Caso trend forte sem dor | Parcial: `search_momentum` não cria dor; sem opportunity recomputada por ausência de overlap |
| Caso dor sem trend | Parcial: F4A/F4B overlap script mostra opportunity HN ainda em `source_confidence=0.400`; sem recomputar scoring |
| F4A regressions | Passou: `test:opportunity-gate` e `test:opportunity-blacklist` ok |
| Typecheck/lint/build | Passou |
| Custo IA F4B | Passou: coleta GT não chama IA; `score-opportunities` não foi rodado sem overlap |

## 5. Issues por severidade

### Critical

Nenhum.

### High

Nenhum.

### Medium

Nenhum bloqueante.

### Low

1. `source_confidence >= 0.65` não foi demonstrado por ausência de overlap real GT + HN/need cluster.
2. Cron operacional está desligado em `vercel.json`, por prudência de custo/ruído.
3. `.env.example` não documenta `GTRENDS_*`/GCP; aceitável por decisão consciente de não ativar operação ainda.
4. `npm install` adicionou dependências e o handback reporta audit vulnerabilities; não rodei `npm audit fix` por estar fora do escopo.
5. O warning crônico do plugin Next no ESLint config permanece no build.
6. Existem artefatos/untracked fora do escopo do review (`GoMVP-f4a-4ee212b.zip`, `=` e arquivos QA antigos). Limpar antes de commit, se o operador quiser commit depois.

## 6. Evidência revisada

### Arquivos

- `src/sources/gtrends/README.md`
- `src/sources/gtrends/types.ts`
- `src/sources/gtrends/collector.ts`
- `src/sources/gtrends/normalizer.ts`
- `src/app/api/cron/collect-trends/route.ts`
- `scripts/test-gtrends-normalizer.ts`
- `scripts/test-gtrends-overlap.ts`
- `src/app/(dashboard)/funil/source-confidence/page.tsx`
- `src/motor/trend-engine.ts`
- `src/motor/opportunity-score.ts`
- `src/motor/run-score-opportunities.ts`
- `package.json`
- `package-lock.json`
- `vercel.json`
- `docs/handback/F4B_DONE.md`
- `docs/handback/F4B_GTRENDS_IMPLEMENTATION.md`
- `docs/handback/F4B_GTRENDS_VALIDATION.md`
- `docs/handback/F4B_GTRENDS_OVERLAP_TRACE.md`

### Comandos rodados

- `npm run test:gtrends-normalizer`: ok.
- `npm run test:gtrends-overlap`: ok; `gtrends:search_momentum=6`, `overlapFound=false`, `sourceConfidenceCandidateFound=false`.
- `npm run test:opportunity-gate`: ok.
- `npm run test:opportunity-blacklist`: ok; fixture `rejected`, cleanup ok, sem incremento de IA.
- `npm run typecheck`: ok.
- `npm run lint`: ok.
- `npm run build`: ok, com warning crônico do plugin Next.
- `git status --short` / `git diff --stat` / diff de áreas F4B: read-only.

## 7. Decisão sobre ausência de overlap

A ausência de overlap é aceitável como limitação de dados/match nesta fase. O dataset BigQuery público cobre Top/Rising e não lookup arbitrário tipo Google Trends Explore; os termos BR coletados foram ruidosos e não coincidiram com o único tópico HN/need cluster atual.

Isso **não bloqueia F4B**, porque o código não falseia overlap, não infla `source_confidence`, não conta manual/watch como fonte externa e documenta a limitação. O caminho técnico para `source_confidence >= 0.65` está preparado (`gtrends` está no conjunto de fontes externas), mas depende de dados com `topic_key` compartilhado.

## 8. Required fixes

Nenhum antes de F4C.

## 9. Optional improvements

- Documentar `GTRENDS_*` e GCP em `.env.example` quando o operador decidir ativar cron operacional.
- Criar um teste fixture explícito para `computeSourceConfidence(['hn', 'gtrends']) === 0.65`.
- Melhorar matching controlado contra `watch_topics` usando apenas Top/Rising, sem simular lookup arbitrário.
- Definir com Agent 0 quando ativar `/api/cron/collect-trends` em `vercel.json` e com qual cap BigQuery.
- Limpar artefatos/untracked fora do escopo antes de um commit futuro.

## 10. Recommendation

**Agent 0 pode atualizar PROJECT_STATE/NEXT_STEPS e preparar Agent 10 / F4C.**

F4B está aprovada com minors. F4C deve manter o cron GT desligado até decisão operacional explícita e não deve tratar ausência de `source_confidence >= 0.65` como falha do motor.

