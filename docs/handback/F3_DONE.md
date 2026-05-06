# F3 DONE — Painel + Ações (Agent 6)

- **Agente:** Agent 6
- **Fase / Gate:** F3 — Painel + Ações
- **Tipo de handback:** partial
- **Status final do gate:** partial
- **Data:** 2026-05-06
- **Branch / Worktree:** `main`
- **Reviewer solicitado:** Agent 5

---

## 1. Scope completed

- [x] Shell de aplicação em `(dashboard)` com sidebar agrupada, topbar, breadcrumb e budget pill.
- [x] Rotas F3 criadas para: `dashboard`, `ranking`, `ideias/[id]`, `filtradas`, `sinais`, `clusters`, `runs`, `custos`, `fontes`, `pesos`, `blacklist`, `prompts`, `brief/[ideaId]`, `configuracoes`.
- [x] Auth gate mantido no layout autenticado.
- [x] CRUD básico via Server Actions + Zod em `fontes`, `blacklist` e `pesos`.
- [x] Recalcular scores integrado via `runScoreIdeas()` (determinístico, sem alterar lógica de `score.ts`).
- [x] Ações de ideia (aprovar/rejeitar/promissora/snooze/nota) com registro em `feedback`.
- [x] Reversão de filtrada implementada como `feedback.action='unfilter_override'` + nota obrigatória.
- [x] Ranking ajustado para respeitar override de filtrada sem alterar `blacklist_tags`.
- [x] `/coleta` preservado e funcional como rota legada.
- [x] Estados globais de loading/error adicionados para o grupo `(dashboard)`.

## 2. Files created

- `docs/handback/F3_DONE.md`
- `src/components/dashboard/app-shell.tsx`
- `src/components/dashboard/app-sidebar.tsx`
- `src/components/dashboard/app-topbar.tsx`
- `src/components/dashboard/budget-pill.tsx`
- `src/components/dashboard/nav-config.ts`
- `src/components/dashboard/nav-group.tsx`
- `src/components/dashboard/nav-item.tsx`
- `src/app/(dashboard)/loading.tsx`
- `src/app/(dashboard)/error.tsx`
- `src/app/(dashboard)/dashboard/page.tsx`
- `src/app/(dashboard)/ranking/page.tsx`
- `src/app/(dashboard)/ideias/[id]/page.tsx`
- `src/app/(dashboard)/ideias/[id]/actions.ts`
- `src/app/(dashboard)/filtradas/page.tsx`
- `src/app/(dashboard)/filtradas/actions.ts`
- `src/app/(dashboard)/sinais/page.tsx`
- `src/app/(dashboard)/clusters/page.tsx`
- `src/app/(dashboard)/runs/page.tsx`
- `src/app/(dashboard)/custos/page.tsx`
- `src/app/(dashboard)/fontes/page.tsx`
- `src/app/(dashboard)/fontes/actions.ts`
- `src/app/(dashboard)/pesos/page.tsx`
- `src/app/(dashboard)/pesos/actions.ts`
- `src/app/(dashboard)/blacklist/page.tsx`
- `src/app/(dashboard)/blacklist/actions.ts`
- `src/app/(dashboard)/prompts/page.tsx`
- `src/app/(dashboard)/brief/[ideaId]/page.tsx`
- `src/app/(dashboard)/configuracoes/page.tsx`

## 3. Files changed

- `src/app/(dashboard)/layout.tsx` — shell completa + fallback resiliente para budget.
- `src/app/(dashboard)/page.tsx` — redirect para `/dashboard`.
- `src/db/index.ts` — singleton global para reduzir churn de conexões.
- `src/app/(dashboard)/ideias/[id]/page.tsx` — `force-dynamic` para rota crítica.
- `src/app/(dashboard)/brief/[ideaId]/page.tsx` — `force-dynamic` para rota crítica.
- `src/app/icon.tsx` — ícone dinâmico para eliminar `favicon` 404.
- `package.json` — porta fixa `3000` em `dev`/`start`.
- `package.json` — `predev` limpando `.next` para reduzir inconsistência de chunks em dev.
- `README.md` — documentação de porta fixa local.
- `src/app/dashboard/page.tsx` — removido para eliminar conflito de rota duplicada.

## 4. Commands executed

| Comando | Resultado | Observação |
|---|---|---|
| `npm run typecheck` | ok | múltiplas rodadas durante F3 |
| `npm run lint` | ok | múltiplas rodadas durante F3 |
| `npm run build` | ok | build final validada |
| `npm run dev` | parcial | servidor iniciou, houve encerramentos/restarts durante debug |

## 5. Packages installed

Nenhum.

## 6. Migrations proposed / applied

Nenhuma.

## 7. Env vars introduced or changed

Nenhuma.

`.env.example` atualizado? `não`.

## 8. Tests / checks run

- `typecheck`, `lint`, `build` executados com sucesso no estado final.
- Smoke manual parcial de rotas em dev.
- Não houve execução formal completa de Playwright MCP para checklist integral da seção 6 do brief.

## 9. AI cost in this phase

- Fase de UI/Server Actions sem chamadas de IA novas.
- `score` recálculado de forma determinística (sem LLM).
- Incremento esperado em `ai_usage_logs`: 0 (confirmar na review Agent 5).

## 10. Known issues

- Instabilidade de runtime em dev observada durante a fase:
  - erro de conexões Postgres (`EMAXCONNSESSION`) em momentos de alta rotatividade de dev server;
  - erro ocasional de cache/runtime do Next (`Cannot find module './611.js'`) após ciclos de restart.
- Mitigação aplicada: limpeza automática de `.next` no `predev` + `force-dynamic` em rotas dinâmicas críticas (`/ideias/[id]`, `/brief/[ideaId]`), mas exige nova rodada de validação E2E para fechar blocker.
- Alguns estados `loading/error/empty` ainda precisam refinamento fino por tela (hoje há cobertura parcial + global).
- Checklist Playwright F3 completo ainda não executado.
- `Brief MVP` permanece leitura/empty state honesto (geração on-demand fica para F4).

## 11. Deviations from plan

- **O que mudou:** implementação baseada em Figma Make + brief textual, sem arquivo `figma.com/design` completo com pages/frames/tokens validados via MCP.
- **Por que mudou:** operador não disponibilizou arquivo design completo, apenas link Make.
- **Risco aceito:** possíveis divergências visuais finas em relação ao design final.
- **Aprovação:** sim (operador pediu continuidade com as informações disponíveis).

## 12. Open questions

- Agent 5 deve normalizar estratégia definitiva para erro de conexão em dev (pool/session) sem impactar produção?
- Manter política de porta fixa `3000` com falha explícita quando ocupada (sem fallback) como regra permanente para todos agentes?
- `coleta` deve permanecer como rota legada fora da navegação principal em F3 final ou ser incorporada visualmente em `Sinais`?

## 13. Next recommended step

> Acionar `Agent 5` para revisão completa da F3, correções de estabilidade/runtime e fechamento dos gates pendentes.

## 14. Reviewer requested

- Reviewer: `Agent 5`.
- Foco recomendado da review:
  - estabilidade de runtime em dev (EMAXCONNSESSION / cache Next),
  - checklist F3 completo (incluindo Playwright),
  - consistência visual/UX final vs PRD + FIGMA_DESIGN_BRIEF,
  - confirmação de zero regressão em auth/nav/rotas.
