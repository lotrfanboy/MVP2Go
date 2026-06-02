# Agent 0 — F4OPS Plan

## Cabeçalho

- **Agente:** Agent 0
- **Fase / Gate:** F4UX close + F4OPS planning
- **Tipo de handback:** orchestration
- **Status final do gate:** F4UX `approved_with_minors`; F4OPS `ready_to_start`
- **Data:** 2026-06-02
- **Branch / Worktree:** main
- **Reviewer solicitado:** n/a

---

## 1. Decisão operacional

F4UX foi revisada pelo Agent 5 em [`F4UX_REVIEW.md`](F4UX_REVIEW.md) e fechou como `approved_with_minors`.

Apesar da recomendação do review apontar F4C como próximo passo, o operador decidiu inserir uma fase operacional antes:

**F4OPS — Vercel Preview / Staging + Performance Validation**

Motivo: o localhost/Next dev está travando e atrapalhando o uso do produto. Antes de mexer em feedback, geração de ideias, motor ou novas fontes, o app precisa ser validado em ambiente hospedado para distinguir problema local de gargalo real.

## 2. Escopo F4OPS

F4OPS deve:

- priorizar Vercel para Preview/Staging;
- definir fluxo branch → Preview Deploy → merge `main` → Production;
- mapear env vars por ambiente, sem valores reais;
- validar build/login/rotas/performance em Preview;
- comparar Preview vs localhost;
- documentar gargalos e rollback.

## 3. Fora de escopo F4OPS

- Motor/scoring/schema/migrations.
- Collectors/sources/Product Hunt/Reddit/YouTube/Reviews.
- Feedback estruturado/F4C.
- Ativar cron Google Trends.
- Provider pago/desconhecido.
- Secrets em docs/logs.

## 4. Decisões registradas

- `D-20` — F4OPS antes de F4C/F5.
- `DP-24` — Preview/Staging antes de novas mudanças profundas.
- `O-11` — Vercel Preview/Staging como caminho operacional primário; Railway só como alternativa futura sob blocker real.

## 5. Documentos atualizados/criados

- `docs/PROJECT_STATE.md`
- `docs/NEXT_STEPS.md`
- `docs/IMPLEMENTATION_PLAN.md`
- `docs/DECISIONS.md`
- `docs/AGENTS.md`
- `README.md`
- `docs/PRD.md`
- `docs/architecture/F4_OPPORTUNITY_MOTOR.md`
- `docs/architecture/F5_SOURCE_EXPANSION.md`
- `docs/agents/AGENT_11_F4C_FEEDBACK.md`
- `.cursor/rules/gomvp-product-rules.mdc`
- `docs/agents/AGENT_12_F4OPS_VERCEL_STAGING.md`
- `docs/handback/AGENT_0_F4OPS_PLAN.md`

## 6. Próximo passo recomendado

> Operador ativa Agent 12 em chat dedicado com [`docs/agents/AGENT_12_F4OPS_VERCEL_STAGING.md`](../agents/AGENT_12_F4OPS_VERCEL_STAGING.md).

F4C e F5 permanecem pausadas até F4OPS ser aprovada ou pulada explicitamente pelo operador.

## 7. Atualização operacional — 2026-06-02

Agent 12 iniciou F4OPS e recomendou:

> Commitar só essa remoção em estado controlado e fazer novo Preview Deploy via Git. Se a Vercel ainda falhar, usar redeploy sem build cache.

A remoção em questão é `src/app/(dashboard)/page.tsx`, um redirect legado da raiz do route group. A próxima ação do Agent 0 é commitar e pushar essa remoção junto das docs F4OPS para permitir novo Preview Deploy.
