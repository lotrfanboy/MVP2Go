# F4UX Funnel UI Done

## Cabecalho

- **Agente:** Codex
- **Fase / Gate:** F4UX - Funnel UI
- **Tipo de handback:** done
- **Status final do gate:** approved_with_minors
- **Data:** 2026-06-02
- **Branch / Worktree:** `feature/f4ux-funnel-ui`
- **Reviewer solicitado:** Agent 5

## 1. Scope completed

- [x] Reorganizada a navegacao em torno do funil atual do MOTOR: Radar, Oportunidades, Evidencias, Tendencias, Dores agrupadas, Analise manual e Topicos monitorados.
- [x] Preservado o modelo de dominio: `raw_items -> signals -> evidences -> need_clusters -> opportunity_cards`.
- [x] Mantido `signals` como legado/F2 e `evidences` como fonte atual de verdade do MOTOR nas telas F4UX.
- [x] Melhoradas as telas `/funil/radar`, `/funil/opportunities`, `/funil/opportunities/[id]`, `/funil/source-confidence`, `/funil/trends`, `/funil/need-clusters`, `/funil/manual` e `/funil/watch-topics`.
- [x] Adicionados componentes reutilizaveis para cards, badges, source badges, score bars, empty states, JSON preview e trace de evidencias.
- [x] Manual inputs e watch topics foram descritos como seeds/diagnostico, nunca como validacao externa.
- [x] Ideias e briefs ficaram explicitamente marcados como F4C, sem geracao nesta fase.
- [x] Rodada de polimento premium aplicada: tipografia mais SaaS, sidebar menos carregada, Sistema/Admin e Legado colapsados, JSON/metadados de evidencias escondidos por padrao.

## 2. Files created

- `.agents/skills/agent-browser/SKILL.md` - skill instalada por solicitacao do operador.
- `.agents/skills/frontend-design/SKILL.md` - skill instalada por solicitacao do operador.
- `.agents/skills/web-design-guidelines/SKILL.md` - skill instalada por solicitacao do operador.
- `.agents/skills/writing-plans/SKILL.md` - skill instalada por solicitacao do operador.
- `skills-lock.json` - lock das skills instaladas.
- `docs/superpowers/plans/2026-06-01-f4ux-funnel-ui.md` - plano de implementacao.
- `src/components/funil/funil-ui.tsx` - primitives compartilhados do funil.
- `docs/handback/F4UX_DONE.md` - este handback.

## 3. Files changed

- `.gitignore` - ignora cache npm local.
- `package.json`, `package-lock.json` - adiciona `lucide-react`.
- `src/components/dashboard/*` - sidebar, topbar, nav, shell e disclaimer reorientados para F4UX.
- `src/app/globals.css` - tema dark-first graphite, tipografia, tokens, contraste e fallback light.
- `src/app/(dashboard)/funil/layout.tsx` - remove padding duplicado.
- `src/app/(dashboard)/funil/radar/page.tsx` - overview evidence-first do MOTOR.
- `src/app/(dashboard)/funil/opportunities/page.tsx` - lista com filtros, gates, scores, fontes e baixa confianca.
- `src/app/(dashboard)/funil/opportunities/[id]/page.tsx` - detalhe com axes, reasons, blacklist, trace de evidencias e aviso F4C.
- `src/app/(dashboard)/funil/opportunities/[id]/gate-form.tsx` - copy mais clara para transicao de gate sem feedback F4C.
- `src/app/(dashboard)/funil/source-confidence/page.tsx` - auditoria de evidencias/fontes/overlap.
- `src/app/(dashboard)/funil/trends/page.tsx` - tendencia sem tratar trend como dor.
- `src/app/(dashboard)/funil/need-clusters/page.tsx` - need clusters vindos de evidences.
- `src/app/(dashboard)/funil/manual/*` - manual como seed investigativo.
- `src/app/(dashboard)/funil/watch-topics/*` - watch topics como seed de monitoramento.

## 4. Commands executed

| Comando | Resultado | Observacao |
|---|---|---|
| `git pull --ff-only origin main` | ok | Base atualizada antes da branch F4UX. |
| `git checkout -b feature/f4ux-funnel-ui` | ok | Branch de trabalho. |
| `npx skills add ... writing-plans` | ok | Instalado em `.agents/skills`. |
| `npx skills add ... frontend-design` | ok | Instalado em `.agents/skills`. |
| `npx skills add ... agent-browser` | ok | Instalado em `.agents/skills`. |
| `npx skills add ... web-design-guidelines` | ok | Instalado em `.agents/skills`. |
| `npm install lucide-react --cache .\.npm-cache` | ok | Necessario para icones de navegacao/acoes. |
| `npm run typecheck` | ok | Passou apos build final. |
| `npm run lint` | ok | Sem erros. |
| `npm run build` | ok | Passou com `.env.local`; rotas `/funil/*` marcadas como dinamicas. |
| `npm run test:opportunity-gate` | ok | Gate/scoring preservado. |
| `npm run test:opportunity-blacklist` | ok | Sem AI calls; cleanup ok. |
| `npm run test:gtrends-normalizer` | ok | Status ok. |
| `npm run test:gtrends-overlap` | ok | Confirmou manual/watch apenas diagnosticos e sem overlap externo. |
| `npx agent-browser doctor --offline --quick` | ok | Browser disponivel no ambiente do usuario. |
| `agent-browser` smoke autenticado | ok | Login dev e rotas principais F4UX carregaram sem tela branca. |

## 5. Packages installed

- `lucide-react@1.17.0` - icones consistentes para navegacao, acoes e estados.

## 6. Migrations proposed / applied

Nenhuma.

## 7. Env vars introduced or changed

Nenhuma variavel nova.

`.env.example` atualizado? nao.

Observacao operacional: `.env.local` foi criado localmente a partir dos valores fornecidos pelo operador e esta ignorado pelo git. Nenhum segredo foi colocado neste handback.

## 8. Tests / checks run

- `npm run typecheck`: ok.
- `npm run lint`: ok.
- `npm run build`: ok.
- `npm run test:opportunity-gate`: ok.
- `npm run test:opportunity-blacklist`: ok, `aiUsageLogsBefore=0`, `aiUsageLogsAfter=0`.
- `npm run test:gtrends-normalizer`: ok.
- `npm run test:gtrends-overlap`: ok, `overlapFound=false`, `sourceConfidenceCandidateFound=false`, manual/watch apenas diagnosticos.
- Smoke browser autenticado: ok com credencial dev fornecida pelo operador. Validadas login, Radar, Oportunidades, detalhe de oportunidade, Evidencias, Tendencias, Dores agrupadas, Manual, Watch Topics e Fontes.
- Evidence cards: confirmado via browser que ha `details=13` e `open=0` em Evidencias; metadados/JSON ficam fechados por padrao.
- Light mode: checagem rapida com `.light` aplicada no DOM e screenshot salvo em `outputs/f4ux-light-check.png`; sem tela branca.

## 9. AI cost in this phase

- Periodo: 2026-06-01..2026-06-02.
- Sem chamada IA feita por esta fase.
- Evidencia: `test:opportunity-blacklist` reportou `aiUsageLogsBefore=0` e `aiUsageLogsAfter=0`.

## 10. Known issues

- `npm install` reportou audit com vulnerabilidades transitivas; nao foi corrigido por estar fora do escopo F4UX.
- As labels novas usam portugues sem acentos em alguns pontos para evitar problemas de encoding observados no ambiente Windows.
- Pode haver oportunidade health/medical ainda candidata em dados dev; tratar como possivel stale/backend reprocessing issue, nao como bug de UI desta rodada.

## 11. Deviations from plan

- **O que mudou:** As paginas F4UX receberam `export const dynamic = "force-dynamic"`.
- **Por que mudou:** Sao paineis de dados vivos do MOTOR e o build Next tentava prerenderizar rotas que dependem de Supabase/Auth/DB.
- **Risco aceito:** Rotas do funil ficam server-rendered on demand, que combina com dados operacionais atuais.
- **Aprovacao:** implicita pelo escopo de UI sem snapshot estatico.

- **O que mudou:** Sistema/Admin e Legado ficaram colapsados por padrao na sidebar.
- **Por que mudou:** Feedback do operador indicou sidebar carregada e foco principal no fluxo de produto.
- **Risco aceito:** Itens continuam acessiveis, mas menos proeminentes.
- **Aprovacao:** solicitacao direta do operador nesta correcao F4UX.

## 12. Open questions

- Agent 5 deve revisar se o nivel de colapso de Sistema/Admin e Legado esta adequado para operacao diaria.
- Agent 5 deve revisar visualmente dados dev potencialmente stale sem pedir correcao de motor nesta fase.

## 13. Next recommended step

> Acionar Agent 5 para revisar F4UX com foco em linguagem evidence-first, preservacao `signals` legado vs `evidences`, usabilidade das telas `/funil/*` e ausencia de alteracao de motor/schema/pipeline.

## 14. Reviewer requested

- Reviewer: Agent 5.
- Foco recomendado da review: dominio F4A/F4B, copy evidence-first, acessibilidade basica, estados de baixa confianca/sem overlap/rejeicao, e garantia de que manual/watch nao contam como validacao externa.
