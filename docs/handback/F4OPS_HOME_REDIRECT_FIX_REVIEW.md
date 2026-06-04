# F4OPS Home Redirect Fix Review

## Cabecalho

- **Agente:** Agent 5
- **Fase / Gate:** F4OPS — ajuste pós-validação de home/redirect
- **Tipo de handback:** review
- **Status final do gate:** approved_with_minors
- **Data:** 2026-06-04
- **Handback revisado:** `docs/handback/F4OPS_HOME_REDIRECT_FIX.md`
- **Reviewer:** Agent 5

## 1. Resumo

O fix esta correto no codigo e passou na validacao local.

`/funil/radar` passa a ser a home operacional principal para usuario autenticado, `/` anonimo passa a redirecionar para `/login`, `/dashboard` permanece protegido e acessivel como legado/F3, e o link da marca GoMVP na sidebar aponta para o Radar.

Ressalva: `https://mvp-2-go.vercel.app/` ainda retornou `307 /dashboard` nesta review, entao o fix ainda nao parece estar deployado na Vercel publica validada anteriormente. A validacao de producao deve ser refeita apos deploy/merge do fix.

## 2. Validacoes executadas

| Check | Resultado | Observacao |
|---|---:|---|
| Leitura `docs/handback/F4OPS_HOME_REDIRECT_FIX.md` | ok | Handback completo. |
| Leitura `.cursor/skills/quality/SKILL.md` | ok | Review feita como QA. |
| Leitura do brief F4OPS | ok | Escopo de redirects/navegacao e permitido se nao tocar motor/schema/sources. |
| Leitura `src/app/login/actions.ts` | ok | Login bem-sucedido redireciona para `/funil/radar`. |
| Leitura `src/app/page.tsx` | ok | Root page usa `HOME_ROUTE = "/funil/radar"`. |
| Leitura `src/lib/supabase/middleware.ts` | ok | `/`, `/funil/*` e rotas operacionais protegidas; anonimo em `/` vai para `/login`. |
| Leitura `src/components/dashboard/app-sidebar.tsx` | ok | Marca GoMVP linka para `/funil/radar`. |
| Busca por redirects principais para `/dashboard` | ok | Nao ha redirect principal para `/dashboard` nos arquivos alterados. |
| `npm run typecheck` | ok | Passou. |
| `npm run lint` | ok | Passou. |
| `npm run build` | ok | Passou; warning cronico Next/ESLint permanece. |
| Smoke local `http://localhost:3010` | ok | Redirects anonimos corretos. |
| Smoke Vercel `https://mvp-2-go.vercel.app` | parcial | Producao ainda retorna `/` -> `/dashboard`, comportamento antigo. |
| Regressao F4A/F4B | ok | `test:opportunity-gate`, `test:opportunity-blacklist`, `test:gtrends-normalizer`, `test:gtrends-overlap` passaram. |
| Escopo proibido | ok | Sem diff em motor/db/sources/api/vercel/env/package/migrations. |

## 3. Resultado dos smokes

### Localhost `3010`

- `/` -> `307 /login`.
- `/login` -> `200`.
- `/funil/radar` -> `307 /login` quando anonimo.
- `/dashboard` -> `307 /login` quando anonimo.
- `/custos` -> `307 /login` quando anonimo.

### Vercel publica atual

- `/` -> `307 /dashboard`.
- `/login` -> `200`.
- `/funil/radar` -> `307 /login` quando anonimo.
- `/dashboard` -> `307 /login` quando anonimo.

Interpretacao: a Vercel publica ainda parece estar no deploy anterior, antes do home redirect fix.

## 4. Achados por severidade

### BLOCKER

Nenhum no codigo/local.

### MAJOR

Nenhum no codigo/local.

### MINOR

1. Fix ainda nao confirmado em Vercel publica.
   - Evidencia: `https://mvp-2-go.vercel.app/` ainda retorna `307 /dashboard`.
   - Recomendacao: apos deploy do fix, repetir smoke em Vercel: `/`, `/login`, `/funil/radar`, `/dashboard` e login autenticado real.

2. Login real com credenciais nao foi reexecutado por esta review.
   - Mitigacao: `signInAction` redireciona diretamente para `/funil/radar` apos `signInWithPassword` sem erro.
   - Recomendacao: outro agente pode validar browser autenticado, como planejado.

## 5. Confirmacoes solicitadas

- `/funil/radar` como home principal: confirmado no codigo e local.
- Login bem-sucedido indo para `/funil/radar`: confirmado por leitura de `signInAction`; nao testado com credencial real.
- Usuario anonimo em `/funil/radar` indo para `/login`: confirmado local e Vercel.
- `/dashboard` nao e mais destino principal no codigo: confirmado local; Vercel publica ainda antiga.
- `/dashboard` segue acessivel/protegido como legado: confirmado.
- Sem alteracao em motor/scoring/schema/migrations/sources/envs: confirmado.

## 6. Custo IA

- Nenhuma chamada IA feita por esta review.
- `test:opportunity-blacklist` reportou `aiUsageLogsBefore=0` e `aiUsageLogsAfter=0`.

## 7. Recomendacao

Pode considerar o fix de codigo aprovado localmente.

Antes de fechar a validacao operacional final em Vercel, fazer deploy do fix e repetir o smoke publico. O outro agente deve validar os dois handbacks olhando especialmente a divergencia atual: local ja aponta `/` para `/login` quando anonimo; Vercel publica ainda aponta `/` para `/dashboard`.

