# F4A Review — Agent 5

> **Nota Agent 0 (2026-05-28):** esta review permanece como evidência histórica da primeira avaliação F4A. O critério de gate foi reavaliado depois em [`AGENT_0_F4A_REASSESSMENT.md`](AGENT_0_F4A_REASSESSMENT.md) e registrado como **D-18**: F4A HN-only não exige `qualified_opportunity` nem `>=10` evidences reais quando não há sinais novos suficientes. Os blockers ainda válidos são: opportunity com `blacklist_tags`/categoria bloqueada/alto risco como `opportunity_candidate`, `test:opportunity-gate` não encerrar, e cobertura fraca de categoria bloqueada.

## Status final

**rejected**

> Revalidação em 2026-05-28 22:04 BRT após correções do Agent 8: status mantido como **rejected**, com blockers reduzidos. Agora existe `need_cluster` e existe `opportunity_card`, mas ainda não há `qualified_opportunity` e o smoke do adapter HN não atingiu a amostra mínima de 10 evidences novas.

F4A entregou boa parte da infraestrutura técnica: migration aplicada em dev, tabelas novas disponíveis, prompts/pesos F4A seedados, endpoints protegidos por `CRON_SECRET`, UI `/funil/*` carregando em ambiente limpo e F3 legado sem regressão evidente nas rotas testadas.

Mesmo assim, o gate F4A não pode ser aprovado porque os critérios centrais de produto/motor ainda não foram demonstrados por completo: há 1 `need_cluster` e 1 `opportunity_card`, mas a opportunity está em `opportunity_candidate`, não `qualified_opportunity`, e o adapter HN gerou apenas 2 evidences a partir de signal novo.

## Achados por severidade

### Blockers

1. **Gate obrigatório de opportunity qualificada não foi cumprido.**
   - Evidência em banco dev:
     - `need_clusters`: 1
     - `opportunity_cards`: 1
     - `opportunity_evidences`: 2
     - `qualified_opportunity`: 0
     - única opportunity: `gate_state='opportunity_candidate'`, `opportunity_score=0.434`, `source_confidence=0.400`.
   - Impacto: scoring multi-axis e detalhe de opportunity já são parcialmente validáveis, mas o gate mínimo para liberar F4B ainda não foi atingido.
   - Referência do gate: `docs/IMPLEMENTATION_PLAN.md` F4A exige `>= 1 opportunity_card com gate_state='qualified_opportunity'`.

2. **Smoke mínimo do adapter `signals -> evidences` não foi cumprido.**
   - Evidência em banco dev:
     - `evidences`: 3
     - `hn/discussion_signal`: 1
     - `hn/repeated_pain`: 1
     - `manual/manual_seed`: 1
     - evidences HN vindas de `signals`: 2, abaixo da amostra mínima de 10.
   - Impacto: o ponto principal da F4A, converter sinais HN novos em camada source-agnostic, ainda não foi validado.
   - Observação: manter o cutoff anti-backfill está correto, mas o gate exige gerar sinais novos suficientes em dev para provar o fluxo real.

3. **Manual analysis end-to-end está incompleto para o gate F4A.**
   - O endpoint autenticado cria `manual_input` e `manual_seed`, e o build-evidence gera `trend_candidates`.
   - Porém não há `need_cluster` nem `opportunity_card` resultante.
   - Impacto: o fluxo exigido `input -> evidence -> opportunity stub` ainda não está demonstrado.

4. **UI de baixa confiança existe, mas não foi validada no estado exigido.**
   - A tela de detalhe da opportunity atual exibe “Baixa confiança de fonte — F4A está em HN-only”.
   - Porém a opportunity está em `opportunity_candidate`, não `qualified_opportunity`.
   - Impacto: o componente visual existe, mas o gate específico “toda qualified_opportunity exibe baixa confiança” ainda não está provado.

### Major

1. **Teste `npm run test:opportunity-gate` imprime OK, mas não encerrou sozinho.**
   - Resultado observado: os casos `trend_only` e `weak_signal` imprimiram OK, mas o processo ficou aberto e precisou ser interrompido manualmente após mais de 3 minutos.
   - Impacto: isso prejudica CI/QA automatizado. Provável causa: conexão de banco aberta via `deriveAutomaticGate()`/`loadF4Weights()` sem encerramento no script.

2. **State machine ainda tem cobertura fraca.**
   - O script cobre apenas `trend_only` e `weak_signal`.
   - Faltam casos mínimos para `pain_candidate`, `qualified_opportunity`, fallback `opportunity_candidate` e categoria bloqueada/launchability zero, que são relevantes para o gate F4A.

### Minor

1. **Warning conhecido do plugin Next no ESLint permanece.**
   - Não bloqueia o gate, mas continua aparecendo no build.

2. **P-TRD-001 foi seedado mas está desligado.**
   - Aceitável se foi decisão operacional explícita por custo, desde que documentado como comportamento intencional. Não é blocker para F4A porque o trend engine determinístico está gerando `trend_candidates`.

## Validação dos gates F4A

- [x] Migration `0004_dashing_blonde_phantom.sql` existe e cria as tabelas F4A.
- [x] Tabelas F4A respondem em SQL read-only.
- [x] Prompts F4A seedados: `P-EVI-001`, `P-TRD-001`, `P-OPP-001`.
- [x] Pesos `f4_*` seedados: 36.
- [x] Endpoints `/api/cron/build-evidence` e `/api/cron/score-opportunities` retornam `401` sem bearer e `200` com bearer.
- [x] UI `/funil/*` sobe em servidor limpo, sem console error crítico observado.
- [x] F3 legado carregou nas rotas principais testadas.
- [x] Custo atual segue dentro do budget dev: cerca de `US$ 0.061 / US$ 5.00`.
- [x] `need_cluster` produzido.
- [x] Pelo menos 1 `opportunity_card` produzido.
- [x] Source confidence HN-only permanece `<= 0.40`.
- [x] Detalhe de opportunity exibe “Baixa confiança de fonte”.
- [x] `assertBudget()` bloqueia nos thresholds esperados via `npm run test:budget`.
- [ ] Adapter `signals -> evidences` com smoke de pelo menos 10 evidences HN novas pós-cutoff.
- [ ] Pelo menos 1 `opportunity_card` com `gate_state='qualified_opportunity'`.
- [ ] Manual analysis end-to-end até opportunity/stub.
- [ ] `npm run test:opportunity-gate` encerrando corretamente.

## Comandos e evidências executadas

- `npm run typecheck`: passou.
- `npm run lint`: passou.
- `npm run build`: passou, com warning conhecido do plugin Next.
- `npm run test:opportunity-gate`: imprimiu os casos OK, mas não encerrou sem intervenção.
- SQL read-only em dev confirmou:
  - `manual_inputs=1`
  - `evidences=3`
  - `trend_candidates=7`
  - `need_clusters=1`
  - `opportunity_cards=1`
  - `opportunity_evidences=2`
  - `motor_runtime_state=1`
  - único gate atual: `opportunity_candidate`
  - `source_confidence > 0.40`: 0
- Playwright MCP em servidor limpo validou a listagem e o detalhe da opportunity, incluindo evidence trace e mensagem “Baixa confiança de fonte”.
- Playwright MCP em servidor limpo validou carregamento de:
  - `/funil/radar`
  - `/funil/watch-topics`
  - `/funil/manual`
  - `/funil/trends`
  - `/funil/need-clusters`
  - `/funil/opportunities`
  - `/funil/source-confidence`

## Recomendação final

**Não liberar F4B ainda.**

Agent 8.5 deve corrigir/fechar os blockers restantes da F4A antes de nova revisão. A infraestrutura base está bem encaminhada e já transforma evidências em uma opportunity, mas o gate oficial foi reavaliado em D-18: não exigir `qualified_opportunity`; corrigir blacklist/launchability/gate/teste.

## Próximos passos objetivos

1. Gerar/embeddar sinais HN novos suficientes para comprovar `>= 10` evidences HN pós-cutoff.
2. Rodar `build-evidence` + `score-opportunities` e comprovar pelo menos 1 `gate_state='qualified_opportunity'` com `source_confidence <= 0.40`.
3. Ajustar scoring/gates somente se necessário, sem falsear o princípio do PRD: motor estrutura oportunidade, não valida mercado.
4. Completar manual analysis até opportunity/stub ou formalizar desvio com Agent 0.
5. Corrigir `scripts/test-opportunity-gate.ts` para encerrar o processo e ampliar cobertura da state machine.

