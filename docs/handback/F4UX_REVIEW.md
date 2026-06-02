# F4UX Funnel UI Review

## Cabecalho

- **Agente:** Agent 5
- **Fase / Gate:** F4UX - Funnel UI / Operator Clarity
- **Tipo de handback:** review
- **Status final do gate:** approved_with_minors
- **Data:** 2026-06-02
- **Handback revisado:** `docs/handback/F4UX_DONE.md`
- **Reviewer:** Agent 5

## 1. Resumo

F4UX pode fechar como `approved_with_minors`. Na primeira tentativa o gate tecnico falhou porque `lucide-react` nao estava instalado/resolvido no workspace atual; apos o operador rodar `npm install`, a dependencia ficou presente e `typecheck`, `lint` e `build` passaram.

O escopo conceitual esta majoritariamente correto: a navegacao foi orientada pelo MOTOR, manual/watch aparecem como seeds, Google Trends aparece apenas em auditoria generica de evidences, e nao encontrei diff atual em motor/schema/collectors/cron/scoring.

## 2. Validacoes executadas

| Check | Resultado | Observacao |
|---|---:|---|
| Leitura `.cursor/rules/gomvp-product-rules.mdc` | ok | D-19/DP-23 aplicaveis a F4UX. |
| Leitura `.cursor/skills/quality/SKILL.md` | ok | Review feita como QA, sem alterar produto. |
| Leitura `docs/agents/AGENT_5_REVISAO.md` | ok | Checklist Agent 5 aplicado. |
| Leitura `docs/agents/AGENT_10_F4UX_FUNNEL_UI.md` | ok | Brief F4UX confirmado. |
| Leitura `docs/handback/F4UX_DONE.md` | ok | Handback completo, mas status reportado nao foi confirmado. |
| `git diff -- src/motor src/db src/sources src/app/api vercel.json ...` | ok | Sem diff atual nessas areas; nao vi alteracao de motor/schema/cron. |
| `npm ls lucide-react --depth=0` | ok | `lucide-react@1.17.0` instalado apos `npm install`. |
| `npm run typecheck` | ok | Passou apos reinstalacao das dependencias. |
| `npm run lint` | ok | Passou. |
| `npm run build` | ok | Passou; rotas `/funil/*` ficaram dinamicas. |
| `npm run test:opportunity-gate` | ok | Regressao F4A preservada. |
| `npm run test:opportunity-blacklist` | ok | Sem AI calls; cleanup ok. |
| `npm run test:gtrends-normalizer` | ok | F4B normalizer preservado. |
| `npm run test:gtrends-overlap` | ok | Sem overlap externo; manual/watch apenas diagnosticos. |
| Playwright MCP `/funil/radar` sem sessao | ok parcial | Redirecionou corretamente para `/login`; sem erros de console. |

## 3. Scope validation

- **Motor-first navigation:** ok. `nav-config.ts` prioriza Radar/Oportunidades/Funil e nao cria menu principal por Google Trends/Product Hunt/Reddit/YouTube/Reviews.
- **Legado secundario:** ok. Grupo Legado esta colapsado e rotulado como legado.
- **F4C nao implementada:** ok. Ideias/Briefs do funil aparecem como itens desabilitados com badge F4C.
- **Manual/watch como seeds:** ok. Copy de Manual, Watch Topics e Evidence Trace diz que nao validam mercado nem elevam confianca externa.
- **Evidence Trace:** ok por leitura. Mostra source, tipo, topic, metricas/metadados recolhidos, source ref e ids manual/watch quando existirem.
- **Baixa confianca / sem overlap:** ok por leitura. Radar, source-confidence e detalhe de oportunidade explicam HN-only/single-source e ausencia de overlap.
- **Sem motor/schema/cron/scoring:** ok por diff de escopo no working tree atual.
- **Build/typecheck/lint:** ok apos `npm install`.

## 4. Achados por severidade

### BLOCKER

Nenhum blocker restante.

### RESOLVED

1. `lucide-react` nao estava resolvido no workspace na primeira tentativa, quebrando `typecheck`.
   - Resolucao: operador rodou `npm install`.
   - Evidencia: `npm ls lucide-react --depth=0` agora mostra `lucide-react@1.17.0`.
   - Evidencia: `npm run typecheck`, `npm run lint` e `npm run build` passaram.

### MINOR

1. Foram adicionadas skills em `.agents/skills/*` e `skills-lock.json` durante uma fase de UX.
   - Impacto: nao parece afetar runtime, mas e ruido de repo fora do produto. O handback diz que foi por solicitacao do operador.
   - Correcao sugerida: Agent 0/operador deve confirmar se esses arquivos ficam versionados; se nao, remover em correcao separada.

2. `npm install` reportou vulnerabilidades transitivas no handback.
   - Impacto: conhecido, fora do escopo F4UX.
   - Correcao sugerida: tratar em hardening/dependabot/audit dedicado, sem misturar com este gate.

3. Smoke Playwright autenticado nao foi refeito nesta sessao porque o browser MCP nao tinha sessao ativa e `/funil/radar` redirecionou para `/login`.
   - Impacto: baixo, porque o handback Codex ja reportou smoke autenticado e `build` confirmou as rotas dinamicas.
   - Correcao sugerida: na proxima rodada autenticada, conferir visualmente `/funil/radar`, `/funil/opportunities`, `/funil/source-confidence`, `/funil/trends`, `/funil/need-clusters`, `/funil/manual` e `/funil/watch-topics`.

## 5. Gates F4UX

| Gate | Status |
|---|---:|
| Navegacao principal orientada pelo MOTOR, nao por source | ok |
| Operador entende Radar/Evidencias/Tendencias/Dores/Oportunidades | ok por leitura |
| Evidence Trace audita source/tipo/topico/metricas/metadados | ok por leitura |
| UI explica baixa confianca e ausencia de overlap sem falsear validacao | ok por leitura |
| Manual/watch aparecem como seeds, nao fonte externa | ok |
| Legado F3 segue visualmente secundario | ok por leitura |
| Nao ha menu principal especifico de Google Trends | ok |
| Nao altera motor/scoring/schema/cron | ok por diff atual |
| `npm run typecheck`, `npm run lint`, `npm run build` passam | ok |

## 6. Custo IA

- Nenhuma chamada IA foi feita nesta review.
- `test:opportunity-blacklist` reportou `aiUsageLogsBefore=0` e `aiUsageLogsAfter=0`.

## 7. Recomendacao

Pode iniciar F4C.

Recomendacao ao operador: Agent 0 pode atualizar `PROJECT_STATE`/`NEXT_STEPS` marcando F4UX como `approved_with_minors` e preparar Agent 11 / F4C. Manter como debito menor apenas o smoke autenticado visual se quiser uma checagem extra antes de codar F4C.

