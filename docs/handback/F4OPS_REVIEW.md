# F4OPS Review — Vercel Preview / Staging + Performance Validation

## Cabecalho

- **Agente:** Agent 5
- **Fase / Gate:** F4OPS — Vercel Preview / Staging + Performance Validation
- **Tipo de handback:** review
- **Status final do gate:** approved_with_minors
- **Data:** 2026-06-04
- **Handback revisado:** `docs/handback/F4OPS_DONE.md`
- **Brief revisado:** `docs/agents/AGENT_12_F4OPS_VERCEL_STAGING.md`
- **Reviewer:** Agent 5

## 1. Resumo

F4OPS pode fechar como `approved_with_minors`.

Confirmei que o ENOENT da Vercel foi resolvido no deploy do commit `450ca86`: o build da Vercel clonou `main` nesse commit, concluiu como `Ready` e nao voltou a procurar `.next/server/app/(dashboard)/page_client-reference-manifest.js`.

A remocao de `src/app/(dashboard)/page.tsx` foi correta. Esse arquivo era uma page raiz duplicada dentro do route group `(dashboard)`; `/` ja e coberto por `src/app/page.tsx`, que redireciona para `/dashboard`, e `/dashboard` e coberto por `src/app/(dashboard)/dashboard/page.tsx`.

## 2. Validacoes executadas

| Check | Resultado | Observacao |
|---|---:|---|
| Leitura `.cursor/rules/gomvp-product-rules.mdc` | ok | DP-24/D-20 aplicaveis a F4OPS. |
| Leitura `.cursor/skills/quality/SKILL.md` | ok | Review feita como QA. |
| Leitura `docs/agents/AGENT_5_REVISAO.md` | ok | Checklist Agent 5 aplicado. |
| Leitura `docs/agents/AGENT_12_F4OPS_VERCEL_STAGING.md` | ok | Brief F4OPS confirmado. |
| Leitura `docs/handback/F4OPS_DONE.md` | ok | Handback completo e coerente com o escopo. |
| `git show 450ca86` | ok | Commit remove `src/app/(dashboard)/page.tsx` e sincroniza docs de F4OPS. |
| `npm run typecheck` | ok | Passou localmente. |
| `npm run lint` | ok | Passou localmente. |
| `npm run build` | ok | Passou localmente; warning cronico Next/ESLint segue nao bloqueante. |
| `npm run test:opportunity-gate` | ok | Regressao F4A preservada. |
| `npm run test:opportunity-blacklist` | ok | Sem AI calls; cleanup ok. |
| `npm run test:gtrends-normalizer` | ok | F4B normalizer preservado. |
| `npm run test:gtrends-overlap` | ok | Sem overlap GT+HN; sem inflar source confidence. |
| Smoke HTTP `https://mvp-2-go.vercel.app` | ok | `/login` 200; rotas protegidas 307 para `/login` anonimas. |
| `vercel inspect https://mvp-2-go.vercel.app` | ok | Deploy production `Ready`, commit `450ca86`. |
| `vercel inspect ... --logs` | ok | Build Vercel concluido; sem ENOENT. |
| `vercel logs ... --limit 50` | ok | Logs recentes com `/dashboard` e `/funil/*` retornando 200. |
| `vercel logs --level error` e 5xx | ok | Sem logs encontrados para `error`, `500`, `502`, `503`, `504`. |

## 3. Confirmacoes solicitadas

### ENOENT resolvido no commit `450ca86`

Confirmado.

Evidencias:

- `vercel inspect` mostra deploy `Ready` para `https://mvp-2-go.vercel.app`.
- Build log Vercel: `Cloning github.com/lotrfanboy/MVP2Go (Branch: main, Commit: 450ca86)`.
- Build log Vercel: `✓ Compiled successfully`, `✓ Generating static pages (19/19)`, `Build Completed`, `Deployment completed`.
- O erro `ENOENT: ... .next/server/app/(dashboard)/page_client-reference-manifest.js` nao aparece no build do commit `450ca86`.

### Remocao de `src/app/(dashboard)/page.tsx`

Confirmado como correto.

O arquivo removido continha apenas:

```tsx
import { redirect } from "next/navigation";

export default function DashboardRootRedirect() {
  redirect("/dashboard");
}
```

No App Router, route group `(dashboard)` nao adiciona segmento de URL. Portanto `src/app/(dashboard)/page.tsx` competia pela raiz `/`, enquanto `src/app/page.tsx` ja faz o redirecionamento para `/dashboard`. A rota real do painel continua em `src/app/(dashboard)/dashboard/page.tsx`.

### Build/logs/rotas em Vercel

Confirmado.

Smoke anonimo:

- `/` -> `307` para `/dashboard`.
- `/login` -> `200`.
- `/dashboard`, `/funil/radar`, `/funil/opportunities`, `/funil/source-confidence`, `/funil/trends`, `/funil/need-clusters`, `/funil/manual`, `/funil/watch-topics`, `/configuracoes`, `/custos` -> `307` para `/login` quando anonimo.

Logs Vercel recentes:

- `/dashboard` -> `200`.
- `/funil/radar` -> `200`.
- `/funil/opportunities` -> `200`.
- `/funil/source-confidence` -> `200`.
- `/funil/trends` -> `200`.
- `/funil/need-clusters` -> `200`.
- `/funil/manual` -> `200`.
- `/funil/watch-topics` -> `200`.
- `/custos` -> `200`.

Sem logs `error` e sem `500/502/503/504` nos filtros verificados.

### Cron Google Trends

Confirmado desligado.

`vercel.json` agenda apenas:

- `/api/cron/collect-hn`
- `/api/cron/extract`
- `/api/cron/build-evidence`
- `/api/cron/generate`
- `/api/cron/score-opportunities`

Nao ha entrada para `/api/cron/collect-trends`.

### Ausencia de alteracoes proibidas

Confirmado para codigo/produto.

Nao houve alteracao em:

- `src/motor/*`
- `src/db/*`
- `src/sources/*`
- `src/app/api/*`
- `vercel.json`
- `.env.example`
- `package.json`
- `package-lock.json`
- migrations

Observacao: o commit `450ca86` altera docs de F4C/F5 (`docs/agents/AGENT_11_F4C_FEEDBACK.md` e `docs/architecture/F5_SOURCE_EXPANSION.md`) apenas para registrar F4OPS como prerequisito antes de F4C/F5. Nao ha implementacao de F4C/F5.

## 4. Achados por severidade

### BLOCKER

Nenhum.

### MAJOR

Nenhum.

### MINOR

1. A validacao foi feita na URL production `https://mvp-2-go.vercel.app`, nao em Preview Deploy dedicado.
   - Mitigacao: o handback registra aprovacao explicita do operador para esta rodada; os checks foram read-only/anonimos e logs confirmaram rotas autenticadas com 200.
   - Recomendacao: para proximas fases, voltar ao fluxo branch -> Preview Deploy -> QA -> merge `main`.

2. Projeto Vercel usa Node `24.x`/range automatico por causa de `"node": ">=20.0.0"`.
   - Impacto: risco operacional de variabilidade em novo major Node.
   - Recomendacao: considerar pin explicito de Node 20 ou 22 em tarefa operacional separada.

3. Browser autenticado nao foi reexecutado por Agent 5 com credencial nesta review.
   - Mitigacao: logs Vercel recentes mostram rotas protegidas retornando 200; smoke anonimo confirmou protecao por redirect.
   - Recomendacao: em QA visual futura, usar sessao/credencial dedicada de staging.

### INFO

1. Restam arquivos untracked antigos fora do escopo (`=`, zip F4A, logs/snapshots QA) e o novo `docs/handback/F4OPS_DONE.md` nao trackeado no workspace atual. Nao foram limpos por esta review.

## 5. Gates F4OPS

| Gate | Status |
|---|---:|
| Projeto builda na Vercel | ok |
| App abre em URL publica | ok |
| Login/rotas protegidas funcionam | ok por `/login` 200, redirects anonimos e logs 200 autenticados |
| Rotas principais carregam | ok por logs Vercel e smoke anonimo |
| Sem tela branca | ok no nivel verificavel por HTTP/logs |
| Sem erro critico de console/server logs | ok para server logs; console autenticado nao refeito |
| Navegacao/performance comparada com localhost | ok conforme handback; Vercel melhor que localhost nos timings anonimos |
| Gargalos documentados | ok |
| Cron GT continua desligado | ok |
| Secrets nao aparecem em logs/docs | ok |
| Motor/scoring/schema/sources nao foram alterados | ok |

## 6. Custo IA

- Nenhuma chamada IA foi feita por esta review.
- `test:opportunity-blacklist` reportou `aiUsageLogsBefore=0` e `aiUsageLogsAfter=0`.
- F4OPS segue com custo incremental de IA = US$ 0,00.

## 7. Recomendacao

Pode prosseguir para F4C.

Recomendacao ao operador: Agent 0 pode atualizar `PROJECT_STATE`/`NEXT_STEPS` marcando F4OPS como `approved_with_minors` e preparar Agent 11 / F4C, mantendo os minors de Preview dedicado e pin de Node como debitos operacionais.

