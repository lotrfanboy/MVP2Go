# Agent 0 — F4OPS Close + Branching Plan

## Cabeçalho

- **Agente:** Agent 0
- **Fase / Gate:** F4OPS close + branching/deploy workflow
- **Tipo de handback:** orchestration
- **Status final do gate:** F4OPS `approved_with_minors`; branch workflow documented
- **Data:** 2026-06-04
- **Branch / Worktree:** `main`
- **Reviewer solicitado:** n/a

---

## 1. Estado validado

F4OPS foi entregue em [`F4OPS_DONE.md`](F4OPS_DONE.md) e revisada pelo Agent 5 em [`F4OPS_REVIEW.md`](F4OPS_REVIEW.md) como `approved_with_minors`.

Resultado operacional:

- Production URL: `https://mvp-2-go.vercel.app`.
- Deploy Vercel: `Ready`.
- Commit validado: `450ca86`.
- Erro ENOENT ficou no deploy anterior `343241c`.
- Build Vercel atual completou sem erro.
- Smoke anônimo e logs recentes não mostraram 5xx críticos.
- Vercel hospedado está muito mais rápido que localhost.
- Conclusão: lentidão parece majoritariamente localhost/dev server.
- GT cron continua desligado.
- Motor, scoring, schema, sources, migrations, envs e crons não foram alterados por F4OPS.

## 2. Fix pós-review

Agent 12 também entregou [`F4OPS_HOME_REDIRECT_FIX.md`](F4OPS_HOME_REDIRECT_FIX.md), revisado pelo Agent 5 em [`F4OPS_HOME_REDIRECT_FIX_REVIEW.md`](F4OPS_HOME_REDIRECT_FIX_REVIEW.md) como `approved_with_minors`.

Fix aprovado:

- `/funil/radar` passa a ser a home operacional principal.
- `/` anônimo redireciona para `/login`.
- Login bem-sucedido redireciona para `/funil/radar`.
- `/dashboard` permanece protegido e acessível como legado/F3.

Minor preservado: o fix precisa de novo deploy/smoke público para confirmar a URL Vercel com o comportamento novo.

## 3. Decisão do operador

O operador decidiu:

> Colocar tudo que foi feito até agora em `main`; o branching diferente será feito a partir das novas features.

Implicação:

- O fechamento F4OPS e o fix de home/redirect entram em `main`.
- O novo workflow `main`/`staging`/`feature/*` passa a valer a partir das próximas features.
- Não iniciar F4M, F4C ou F5 neste fechamento.

## 4. Documentação atualizada/criada

- `docs/PROJECT_STATE.md`
- `docs/NEXT_STEPS.md`
- `docs/IMPLEMENTATION_PLAN.md`
- `docs/DECISIONS.md`
- `docs/AGENTS.md`
- `docs/PRD.md`
- `README.md`
- `.cursor/rules/gomvp-product-rules.mdc`
- `docs/architecture/F4_OPPORTUNITY_MOTOR.md`
- `docs/operations/BRANCHING_AND_DEPLOYMENT.md`
- `docs/handback/AGENT_0_F4OPS_BRANCHING_PLAN.md`

## 5. Branch workflow registrado

- `main` = produção / Vercel Production.
- `staging` = homologação / Preview fixo do operador.
- `feature/*` = trabalho dos agentes.
- Features entram em `staging`; operador testa; `staging` só entra em `main` com aprovação.
- `staging` pode usar Supabase dev atual temporariamente.
- Secrets reais nunca entram em docs.
- GT cron permanece desligado.

## 6. Próximo passo recomendado

Após este commit em `main`:

1. Criar/pushar `staging` a partir de `main`.
2. Validar Preview recorrente da branch `staging` na Vercel.
3. Só então aprovar a próxima fase funcional.

F4M, F4C e F5 permanecem pausadas até aprovação explícita do operador.
