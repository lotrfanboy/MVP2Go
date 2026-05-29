# F4A Fix Done — Agent 8.5

## Cabeçalho

- **Agente:** Agent 8.5
- **Fase / Gate:** F4A — Fix de gate, blacklist e launchability
- **Tipo de handback:** correction done
- **Status final:** pending_review
- **Data:** 2026-05-28
- **Reviewer solicitado:** Agent 5, revisar contra D-18

---

## 1. Escopo concluído

- [x] F4A continua sendo gate estrutural HN-only; não foi exigido `qualified_opportunity`.
- [x] `blacklist_tags`, risco alto e `launchability_score` zero/quase zero agora forçam `gate_state='rejected'`.
- [x] Em F4A, qualquer `blacklist_tags.length > 0` em evidência é bloqueante para a opportunity.
- [x] `blacklist_tags` das `evidences` são propagados para `opportunity_cards`.
- [x] `reason_codes` automáticos usam o vocabulário atual (`not_indielab_fit`, `regulatory_risk`, `good_trend_bad_opportunity`, etc.).
- [x] `source_confidence <= 0.40` permanece validado para HN-only.
- [x] UI `/funil/opportunities` passou a exibir badge "Baixa confiança de fonte" em candidatas/qualificadas HN-only.
- [x] `npm run test:opportunity-gate` foi ampliado e encerra sozinho.
- [x] F4B não foi iniciada.

## 2. Arquivos alterados

- `src/motor/opportunity-gate.ts`
- `src/motor/opportunity-score.ts`
- `src/motor/run-score-opportunities.ts`
- `scripts/test-opportunity-gate.ts`
- `scripts/test-opportunity-blacklist.ts`
- `package.json`
- `src/app/(dashboard)/funil/opportunities/page.tsx`
- `docs/handback/F4A_FIX_DONE.md`

## 3. Migration / prompts / pacotes

- **Migration:** nenhuma.
- **Prompt versionado:** nenhum prompt alterado.
- **Pacotes instalados:** nenhum.
- **Secrets / `.env` / MCP:** não tocados.

## 4. Evidências

### Opportunity válida criada sem exigir `qualified_opportunity`

Snapshot read-only em dev:

```json
{
  "evidences": 3,
  "needClusters": 1,
  "opportunityCards": 1,
  "sourceConfidenceAbove040": 0,
  "gates": [{ "gateState": "opportunity_candidate", "count": 1 }],
  "top": [
    {
      "id": "8350026b-524d-47b0-84c8-afa64dcf34f5",
      "gateState": "opportunity_candidate",
      "sourceConfidence": "0.400",
      "blacklistTags": [],
      "reasonCodes": []
    }
  ]
}
```

Interpretação D-18: `opportunity_candidate` HN-only é suficiente para validar estrutura F4A quando há evidence -> need_cluster -> opportunity_card e `source_confidence <= 0.40`.

### Opportunity bloqueada rejeitada

`npm run test:opportunity-gate` cobre:

- `rejected-blacklist => rejected not_indielab_fit,regulatory_risk,good_trend_bad_opportunity OK`
- `rejected-launchability-zero => rejected not_indielab_fit,good_trend_bad_opportunity OK`

Isso valida a regra determinística antes da persistência: qualquer evidence/opportunity com `blacklist_tags`, risco alto ou launchability zero não pode cair em `opportunity_candidate`.

### Opportunity bloqueada rejeitada via fluxo persistido

Novo script `npm run test:opportunity-blacklist` cria uma fixture dev-only com `topic_key` único, uma `evidence` com `blacklist_tags=["regulated_health"]`, um `need_cluster` ativo e vínculo em `evidence_clusters`. A execução chama `runScoreOpportunitiesPipeline` com `needClusterIds` da fixture e `resetExisting=false`, então processa somente essa fixture e não apaga `opportunity_cards` reais.

Resultado observado:

```json
{
  "topicKey": "f4a-blacklist-fixture-1780057779785-2f3f702b",
  "evidenceBlacklistTags": ["regulated_health"],
  "processedNeedClusterIds": ["e5bc40a3-ab02-4178-aac2-6152d1e35c00"],
  "resetExisting": false,
  "realOpportunityCardsBefore": 1,
  "realOpportunityCardsAfter": 1,
  "result": { "created": 1, "costUsd": 0 },
  "aiUsageLogsBefore": 0,
  "aiUsageLogsAfter": 0,
  "observed": {
    "gateState": "rejected",
    "launchabilityScore": "0.000",
    "blacklistTags": ["regulated_health"],
    "reasonCodes": [
      "not_indielab_fit",
      "regulatory_risk",
      "good_trend_bad_opportunity"
    ]
  },
  "status": "ok",
  "failures": []
}
```

Cleanup em `finally`:

```json
{
  "cleanup": "ok",
  "remainingFixtureRows": {
    "opportunityCards": 0,
    "needClusters": 0,
    "evidences": 0
  }
}
```

Provas cobertas pelo teste:

- A fixture persistida tinha `blacklist_tags=["regulated_health"]`.
- `runScoreOpportunitiesPipeline` processou apenas `processedNeedClusterIds`.
- `resetExisting=false` preservou dados reais: `realOpportunityCardsBefore` e `realOpportunityCardsAfter` permaneceram iguais.
- `gate_state='rejected'`, `launchability_score <= 0.05`, `blacklist_tags` propagado e `reason_codes` preenchido.
- `costUsd=0` e `ai_usage_logs` sem incremento para o `runId`, confirmando ausência de chamada LLM no caso bloqueado.
- Nenhum `opportunity_candidate` foi gerado para a fixture.

### Signals elegíveis e evidences adaptadas

Snapshot read-only em dev:

```json
{
  "adapterCutoff": "2026-05-29T00:16:34.692Z",
  "eligibleSignalsPostCutoff": 1,
  "evidencesBySourceType": [
    { "sourceKey": "manual", "evidenceType": "manual_seed", "count": 1 },
    { "sourceKey": "hn", "evidenceType": "discussion_signal", "count": 1 },
    { "sourceKey": "hn", "evidenceType": "repeated_pain", "count": 1 }
  ]
}
```

Há menos de 10 sinais novos elegíveis pós-cutoff. Conforme D-18, isso é **dados insuficientes**, não falha do motor. Não houve backfill retroativo.

## 5. Testes executados

| Comando | Resultado |
|---|---|
| `npm run test:opportunity-blacklist` | ok; fixture persistida, costUsd=0, sem incremento de `ai_usage_logs`, cleanup ok |
| `npm run test:opportunity-gate` | ok; encerra sozinho |
| `npm run typecheck` | ok |
| `npm run lint` | ok |
| `npm run build` | ok; warning crônico do plugin Next permanece |
| `ReadLints` nos arquivos alterados | sem erros |

Observação: duas consultas ad hoc de snapshot falharam inicialmente por sintaxe do `tsx -e`/PowerShell e foram reexecutadas com sucesso. Não alteraram dados.

## 6. Confirmações de escopo

- F4B não foi iniciada.
- Nenhuma fonte nova foi adicionada.
- Google Trends não foi tocado.
- Pipeline F2 legado não foi desligado.
- Migration `0004_dashing_blonde_phantom.sql` não foi alterada.
- Não houve backfill `signals -> evidences`.

## 7. Próximo passo

Acionar Agent 5 para revisar F4A contra D-18, com foco em:

- `test:opportunity-gate` encerrando;
- bloqueados virando `rejected`;
- `source_confidence <= 0.40`;
- baixa confiança visível no funil;
- F3 legado sem regressão.
