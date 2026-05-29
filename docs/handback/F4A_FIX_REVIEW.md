# F4A Fix Review — Agent 5

## Status final

**approved_with_minors**

Revisão feita contra **D-18** e `docs/handback/AGENT_0_F4A_REASSESSMENT.md`, não contra o gate antigo. F4A HN-only valida estrutura do motor; não exige `qualified_opportunity` nem volume real absoluto de 10 evidences quando há poucos sinais novos elegíveis.

## Validação do escopo

- F4B não foi iniciada.
- Nenhuma fonte nova foi adicionada.
- Google Trends não foi tocado.
- Nenhuma migration nova foi criada.
- Nenhum prompt versionado foi alterado.
- Pipeline F2 legado não foi desligado.
- `.env`/secrets/MCP não foram tocados.

## Evidências validadas

- `npm run test:opportunity-gate`: passou e encerrou sozinho.
- `npm run test:opportunity-blacklist`: passou, validando fixture persistida com `blacklist_tags=["regulated_health"]`, `gate_state='rejected'`, `launchability_score=0.000`, `reason_codes` preenchidos, `costUsd=0`, sem incremento em `ai_usage_logs` e cleanup ok.
- `npm run typecheck`: passou.
- `npm run lint`: passou.
- `npm run build`: passou, com warning crônico do plugin Next.
- Banco dev:
  - `evidences=3`
  - `need_clusters=1`
  - `opportunity_cards=1`
  - `opportunity_evidences=2`
  - `source_confidence > 0.40 = 0`
  - opportunity atual: `gate_state='opportunity_candidate'`, `source_confidence=0.400`, `blacklist_tags=[]`.
- Adapter:
  - `signals_to_evidence_cutoff_iso=2026-05-29T00:16:34.692Z`
  - `eligibleEmbeddedSignalsPostCutoff=1`
  - evidences HN vindas de signals: 2 (`discussion_signal` + `repeated_pain`).
- Playwright MCP:
  - `/funil/opportunities` mostra a opportunity HN-only com badge “Baixa confiança de fonte”.
  - `/funil/radar`, `/funil/watch-topics`, `/funil/manual`, `/funil/trends`, `/funil/need-clusters`, `/funil/source-confidence` carregaram em servidor limpo.
  - `/dashboard` carregou como smoke F3 legado.
  - Sem console error crítico observado.

## Achados por severidade

### Blockers

Nenhum.

### Minors

1. O build ainda mostra o warning crônico do plugin Next no ESLint config.
   - Impacto: não bloqueia F4A nem F4B.

2. O servidor dev antigo ainda pode ficar stale e retornar 500 em `/funil/*` até reiniciar limpo.
   - Mitigação validada: matar processo antigo + `npm run dev` limpa `.next` e rotas voltam a carregar.

## Checklist D-18

- [x] F4A tratada como gate estrutural HN-only.
- [x] `qualified_opportunity` não exigido para aprovação.
- [x] Menos de 10 evidences reais tratado como dado insuficiente, com cutoff documentado.
- [x] Evidence válida gera `need_cluster` e `opportunity_card`.
- [x] `source_confidence <= 0.40` em 100% das opportunities HN-only.
- [x] UI comunica baixa confiança em opportunity HN-only candidata.
- [x] Gate deterministicamente rejeita blacklist/launchability zero/risco alto.
- [x] Fixture persistida valida blacklist propagada para `opportunity_cards` e bloqueada como `rejected`.
- [x] `test:opportunity-gate` cobre estados principais e encerra sozinho.
- [x] Rotas Funil sobem sem erro crítico em servidor limpo.
- [x] F3 legado sem regressão visível no smoke.

## Recomendação

**Liberar Agent 9 / F4B.**

F4A está aprovada com minors. F4B deve continuar respeitando D-14/D-18: Google Trends entra para cross-source confidence, sem alterar schema do motor e sem iniciar F4C/F5.

