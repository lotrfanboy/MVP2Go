# F4B Google Trends Overlap + Generic Trace

## Cabeçalho

- **Agente:** Agent 9
- **Fase / Gate:** F4B — Google Trends / Cross-source Evidence
- **Tipo de handback:** checkpoint parcial
- **Status final do gate:** partial
- **Data:** 2026-06-01
- **Branch / Worktree:** main
- **Reviewer solicitado:** ainda não

> Este arquivo registra a fatia de diagnóstico de overlap e auditabilidade genérica. Ele **não substitui** `docs/handback/F4B_DONE.md`.

---

## 1. Scope completed

- [x] Atualizado `src/sources/gtrends/README.md` com status real da implementação e validação.
- [x] Criado `scripts/test-gtrends-overlap.ts` como diagnóstico read-only.
- [x] Adicionado script `npm run test:gtrends-overlap`.
- [x] Melhorada `/funil/source-confidence` com uma tabela genérica de evidências recentes.
- [x] Mantida a UI source-agnostic, sem tela ou lógica específica de Google Trends.
- [x] Mantido `lookupGTrendsTopic(...)` como `unsupported_by_bigquery_public_dataset`.

Fora do escopo:

- Não alterei schema.
- Não alterei motor.
- Não alterei `vercel.json`.
- Não ativei cron operacional.
- Não implementei lookup arbitrário real.
- Não adicionei provider pago, scraping, fetch direto ou biblioteca não oficial.
- Não iniciei F5.

## 2. Script de overlap

Novo comando:

```bash
npm run test:gtrends-overlap
```

Características:

- Apenas leitura.
- Lê `evidences`, `need_clusters`, `watch_topics` e `opportunity_cards`.
- Não chama IA.
- Não chama BigQuery.
- Não insere/atualiza/remove dados.
- Reporta se há `topic_key` compartilhado entre `gtrends` e outras fontes externas.
- Reporta watch/manual apenas como diagnóstico; eles não elevam Source Confidence.

Resultado atual:

```json
{
  "status": "ok",
  "counts": {
    "evidencesWithTopicKey": 9,
    "bySourceType": {
      "gtrends:search_momentum": 6,
      "hn:discussion_signal": 1,
      "hn:repeated_pain": 1,
      "manual:manual_seed": 1
    },
    "gtrendsTopics": 6,
    "hnTopics": 1,
    "needClusterTopics": 1,
    "watchTopics": 0,
    "opportunitiesChecked": 1
  },
  "overlapFound": false,
  "sourceConfidenceCandidateFound": false
}
```

Conclusão:

- Não existe overlap atual entre `gtrends.topic_key` e HN/`need_clusters`/opportunities.
- A ausência de aumento em `source_confidence` continua sendo limitação de dados/match, não falha automática do adapter.

## 3. UI genérica de trace

Arquivo alterado:

- `src/app/(dashboard)/funil/source-confidence/page.tsx`

Mudança:

- A tela continua mostrando oportunidades por `source_confidence`.
- Foi adicionada uma seção "Evidências recentes" baseada diretamente em `evidences`.
- A tabela exibe `source_key`, `evidence_type`, tópico, data, força/confiança, dor, audiência, `metrics_json` e `metadata_json`.
- A tabela é genérica para todas as fontes; `gtrends` aparece apenas como dado, não como regra especial.

Motivo:

- `gtrends` pode existir como evidence externa sem ainda estar ligado a uma oportunidade.
- A auditoria precisa acontecer na camada `evidences`, antes de interpretar `source_confidence`.

## 4. Commands executed

| Comando | Resultado |
|---|---|
| `npm run test:gtrends-normalizer` | ok |
| `npm run test:gtrends-overlap` | ok |
| `npm run typecheck` | ok |
| `npm run lint` | ok |
| `npm run build` | ok, com warning crônico do plugin ESLint do Next |

Observação:

- A primeira tentativa da cadeia de checks travou porque a conexão Postgres do script read-only permanecia aberta após imprimir JSON. O script foi ajustado para encerrar após o diagnóstico.

## 5. Pendências

- Decidir se F4B aceita discovery Top/Rising genérico como gate parcial suficiente.
- Decidir se vale implementar matching controlado contra `watch_topics` usando apenas Top/Rising, sem lookup arbitrário.
- Só após nova aprovação: considerar cron em `vercel.json`.
- Só após nova aprovação: criar `docs/handback/F4B_DONE.md`.

## 6. Recommendation

Recomendação atual:

1. Manter cron operacional desligado.
2. Usar `/funil/source-confidence` para auditar evidências recentes.
3. Validar um caminho controlado de overlap antes de declarar F4B done:
   - ou aguardar dados Top/Rising que naturalmente cruzem com HN;
   - ou usar watch topics como filtro/match read-only sobre Top/Rising, sem contar watch como fonte externa;
   - ou aprovar um provider oficial/pago para lookup arbitrário real em etapa futura.
