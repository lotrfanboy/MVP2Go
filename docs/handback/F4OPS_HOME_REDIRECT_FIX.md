# F4OPS Home Redirect Fix — Handback

## Cabeçalho

- **Agente:** Agent 12
- **Fase / Gate:** F4OPS — ajuste pós-validação de home/redirect
- **Tipo de handback:** done
- **Status final do gate:** pending_review
- **Data:** 2026-06-04
- **Branch / Worktree:** `main` em `c:\GoMVP`
- **Reviewer solicitado:** Agent 0 / Agent 5

---

## 1. Scope completed

- [x] Home principal do produto novo alterada para `/funil/radar`.
- [x] Login bem-sucedido redireciona para `/funil/radar`.
- [x] Rota raiz `/` envia usuário autenticado para `/funil/radar` e usuário anônimo para `/login`.
- [x] Link da marca GoMVP na sidebar aponta para `/funil/radar`.
- [x] `/dashboard` foi mantido acessível como rota legada/F3, não como destino principal.
- [x] Rotas protegidas continuam exigindo autenticação.
- [x] Nenhuma tela legada foi removida.

## 2. Files created

- `docs/handback/F4OPS_HOME_REDIRECT_FIX.md` — este handback.

## 3. Files changed

- `src/app/login/actions.ts` — redirect pós-login alterado de `/dashboard` para `/funil/radar`.
- `src/app/page.tsx` — destino principal da rota raiz alterado para `/funil/radar`.
- `src/lib/supabase/middleware.ts` — middleware agora protege `/`, `/funil/*` e rotas operacionais; usuário autenticado em `/` ou `/login` vai para `/funil/radar`.
- `src/components/dashboard/app-sidebar.tsx` — marca/logo GoMVP virou link para `/funil/radar`.

## 4. Commands executed

| Comando | Resultado | Observação |
|---|---|---|
| `npm run typecheck` | ok | TypeScript sem erros. |
| `npm run lint` | ok | ESLint passou. |
| `npm run build` | ok | Build Next passou; warning crônico do plugin Next/ESLint permanece. |
| `npx next start -p 3010` | ok | Servidor temporário de produção local para smoke de redirects. |
| Smoke HTTP local em `localhost:3010` | ok | Ver detalhes em §8. |

## 5. Packages installed

Nenhum.

## 6. Migrations proposed / applied

Nenhuma.

## 7. Env vars introduced or changed

Nenhuma.

`.env.example` atualizado? não.

## 8. Tests / checks run

### Validação estática

- Busca por redirects principais para `/dashboard`:
  - removidos de `src/app/login/actions.ts`;
  - removidos de `src/app/page.tsx`;
  - removidos do redirect de usuário autenticado no middleware.
- Usos restantes de `/dashboard` são legítimos:
  - prefixo protegido no middleware;
  - item legado `Dashboard F3` na navegação;
  - active-state do nav item legado;
  - `revalidatePath("/dashboard")` em ação de ideia legada.

### Smoke runtime local

Rodado contra `npx next start -p 3010`:

- `/` anônimo → `307 /login`.
- `/login` → `200`.
- `/funil/radar` anônimo → `307 /login`.
- `/dashboard` anônimo → `307 /login`.

### Validação de build

- `npm run typecheck`: passou.
- `npm run lint`: passou.
- `npm run build`: passou.

## 9. AI cost in this phase

Sem chamada IA. Gasto incremental: US$ 0,00.

## 10. Known issues

- Login real com credenciais não foi reexecutado nesta correção; a mudança de destino pós-login foi feita diretamente no server action `signInAction`.
- O warning crônico `The Next.js plugin was not detected in your ESLint configuration` permanece no build, sem bloquear.
- `/dashboard` segue existindo como legado/F3 por decisão de preservar rotas legadas.

## 11. Deviations from plan

Nenhum desvio de escopo. A correção ficou restrita a redirects/navegação principal.

## 12. Open questions

- Agent 0 deve decidir se quer registrar formalmente em docs de controle que `/funil/radar` é a home operacional principal após F4UX/F4OPS.
- Agent 5 pode validar com browser autenticado em Vercel que login real termina em `/funil/radar`.

## 13. Next recommended step

> Acionar Agent 0 para registrar/encaminhar a correção e pedir validação do Agent 5 com foco em redirects, login real e preservação do legado.

## 14. Reviewer requested

- Reviewer: Agent 0 / Agent 5.
- Foco recomendado:
  - confirmar que `/funil/radar` é a home principal;
  - confirmar que login real em Vercel vai para `/funil/radar`;
  - confirmar que usuário anônimo em `/funil/radar` vai para `/login`;
  - confirmar que `/dashboard` não é mais destino principal, mas segue acessível como legado;
  - confirmar que não houve alteração em motor/scoring/schema/migrations/sources/envs.
