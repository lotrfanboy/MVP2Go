# F4OPS Done — Vercel Preview / Staging + Performance Validation

## Cabeçalho

- **Agente:** Agent 12
- **Fase / Gate:** F4OPS — Vercel Preview / Staging + Performance Validation
- **Tipo de handback:** done
- **Status final do gate:** unknown — aguardando revisão Agent 5
- **Data:** 2026-06-04
- **Branch / Worktree:** `main` em `c:\GoMVP`
- **Reviewer solicitado:** Agent 5

---

## 1. Scope completed

- [x] Projeto Vercel existente validado em modo read-only: `mvp-2-go`.
- [x] Build Vercel validado após correção App Router: deploy `Ready` no commit `450ca86`.
- [x] URL pública autorizada pelo operador para esta rodada: `https://mvp-2-go.vercel.app`.
- [x] Fluxo atual confirmado: GitHub `main` → Vercel Production deploy. Branch/Preview Deploy ainda recomendado para próximas rodadas.
- [x] Env vars necessárias mapeadas por nome e escopo, sem valores reais.
- [x] Supabase dev atual aprovado pelo operador para Preview/Staging nesta F4OPS.
- [x] Login e redirects de rotas protegidas validados em produção.
- [x] Rotas principais do Funil e Sistema/Admin verificadas por HTTP/browser/logs.
- [x] Performance básica comparada entre produção hospedada e localhost.
- [x] Logs Vercel revisados sem erro crítico recente.
- [x] Cron Google Trends confirmado desligado em `vercel.json`.
- [x] Confirmado que não houve alteração em motor, scoring, schema, migrations, sources, envs, crons GT, F4C ou F5.

## 2. Files created

- `docs/handback/F4OPS_DONE.md` — handback da fase F4OPS.

## 3. Files changed

- `src/app/(dashboard)/page.tsx` — removido porque era uma page raiz duplicada dentro do route group `(dashboard)`; `src/app/page.tsx` já cobre `/` e redireciona para `/dashboard`. A duplicação gerava trace para `.next/server/app/(dashboard)/page_client-reference-manifest.js`, que não era emitido no build.
- `docs/handback/F4OPS_DONE.md` — este handback.

## 4. Commands executed

| Comando | Resultado | Observação |
|---|---|---|
| `npm run typecheck` | ok | Passou antes do deploy validado. |
| `npm run lint` | ok | Passou; warning crônico Next/ESLint aparece no build, não como erro. |
| `npm run build` | ok | Passou localmente com `.next` limpo antes e depois da correção App Router. |
| `npm run test:opportunity-gate` | ok | State machine F4A preservada. |
| `npm run test:opportunity-blacklist` | ok | Sem incremento de IA; cleanup ok. |
| `npm run test:gtrends-normalizer` | ok | Normalizer GT preservado. |
| `npm run test:gtrends-overlap` | ok | Sem overlap GT+HN, sem inflar Source Confidence. |
| `vercel --version` | ok | `Vercel CLI 54.7.1`. |
| `vercel whoami` | ok | Conta autenticada: `carloseduardosantos2011-3377`. |
| `vercel project ls` | ok | Projeto `mvp-2-go` encontrado. |
| `vercel project inspect mvp-2-go` | ok | Next.js preset, root `.`, Node `24.x`, build `npm run build`/`next build`. |
| `vercel inspect <failed-deployment> --logs` | ok | Falha confirmada no commit `343241c` com ENOENT do manifest de `(dashboard)/page`. |
| `vercel inspect <ready-deployment> --logs` | ok | Deploy `Ready` confirmado no commit `450ca86`. |
| `vercel logs https://mvp-2-go.vercel.app --limit 50` | ok | Rotas protegidas com 200 após login; redirects/login observados. |
| `vercel logs --level error --since 1h` | ok | Sem logs `error`. |
| `vercel logs --status-code 500/502/503/504 --since 1h` | ok | Sem 5xx recentes. |
| Smoke HTTP com `Invoke-WebRequest` | ok | Produção anônima: `/login` 200; rotas protegidas 307 para `/login`. |
| Smoke browser com `agent-browser` | ok parcial | `/login` renderiza; redirects protegidos ok; sem console errors. Sem sessão/credencial automatizada registrada no agente. |

## 5. Packages installed

Nenhum.

## 6. Migrations proposed / applied

Nenhuma.

## 7. Env vars introduced or changed

Nenhuma variável nova foi introduzida ou alterada por esta fase.

`.env.example` atualizado? não.

Mapeamento validado por nome, sem valores:

- `DATABASE_URL` — server-only.
- `NEXT_PUBLIC_SUPABASE_URL` — public.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public.
- `SUPABASE_SERVICE_ROLE_KEY` — server-only.
- `OPENAI_API_KEY` — server-only.
- `OPENAI_LLM_MODEL` — server-only.
- `OPENAI_EMBEDDING_MODEL` — server-only.
- `ALLOW_PAID_AI` — server-only.
- `AI_MONTHLY_BUDGET_USD` — server-only.
- `CRON_SECRET` — server-only.
- `APP_BASE_URL` — server/runtime config.

Google Trends / BigQuery deve seguir ausente ou falso até aprovação operacional específica:

- `GTRENDS_ENABLED` — server-only.
- `GOOGLE_CLOUD_PROJECT` — server-only.
- `GTRENDS_DEFAULT_COUNTRY_CODE` — server-only.
- `GTRENDS_MAX_ROWS` — server-only.
- `GTRENDS_MAX_BYTES_BILLED` — server-only.

## 8. Tests / checks run

### Build/App Router

- Build Vercel falho anterior:
  - Branch `main`.
  - Commit `343241c`.
  - Erro: `ENOENT: no such file or directory, lstat '/vercel/path0/.next/server/app/(dashboard)/page_client-reference-manifest.js'`.
- Diagnóstico local:
  - `src/app/page.tsx` existe e redireciona para `/dashboard`.
  - `src/app/(dashboard)/page.tsx` existia e exportava componente válido, mas era uma page raiz duplicada do route group.
  - `src/app/(dashboard)/dashboard/page.tsx` é a rota real `/dashboard`.
  - `src/app/dashboard/layout.tsx` existe, mas sem `src/app/dashboard/page.tsx`.
  - `src/app/funil/*` não existe; Funil está corretamente em `src/app/(dashboard)/funil/*`, resolvendo para `/funil/*`.
- Correção:
  - `src/app/(dashboard)/page.tsx` removido.
  - Build limpo local passou.
  - `app-paths-manifest.json` não contém mais `/(dashboard)/page`.
  - `.next/server/app/(dashboard)/page.js.nft.json` não existe mais.
  - `.next/server/app/(dashboard)/page_client-reference-manifest.js` não é mais esperado.
- Build Vercel pronto:
  - Commit `450ca86`.
  - Status `Ready`.
  - Build completou sem ENOENT.

### Smoke HTTP em produção

URL autorizada pelo operador nesta rodada: `https://mvp-2-go.vercel.app`.

- `/` → `307` para `/dashboard`.
- `/login` → `200`.
- `/dashboard` → `307` para `/login` quando anônimo.
- `/funil/radar` → `307` para `/login` quando anônimo.
- `/funil/opportunities` → `307` para `/login` quando anônimo.
- `/funil/source-confidence` → `307` para `/login` quando anônimo.
- `/funil/trends` → `307` para `/login` quando anônimo.
- `/funil/need-clusters` → `307` para `/login` quando anônimo.
- `/funil/manual` → `307` para `/login` quando anônimo.
- `/funil/watch-topics` → `307` para `/login` quando anônimo.
- `/configuracoes` → `307` para `/login` quando anônimo.
- `/custos` → `307` para `/login` quando anônimo.

### Smoke browser em produção

- `/login` renderizou com heading `GoMVP`, campo `E-mail`, campo `Senha` e botão `Entrar`.
- Rotas protegidas testadas no browser redirecionaram para `/login`.
- Console browser sem erros no smoke anônimo.
- Logs Vercel recentes mostraram `POST /login` com `303` e rotas protegidas com `200` após login, indicando que login/redirect funcionaram em produção durante a rodada.

### Logs Vercel

- Sem logs `error` na última hora validada.
- Sem status `500`, `502`, `503` ou `504` na última hora validada.
- Logs recentes incluem rotas `/dashboard`, `/funil/radar`, `/funil/opportunities`, `/funil/source-confidence`, `/funil/trends`, `/funil/need-clusters`, `/funil/manual`, `/funil/watch-topics`, `/custos` e `/configuracoes`.

### Performance percebida / timings básicos

Produção anônima:

- `/login`: aproximadamente 64 ms no smoke HTTP.
- `/funil/radar`: aproximadamente 872 ms até redirect.
- `/funil/opportunities`: aproximadamente 519 ms até redirect.
- `/funil/source-confidence`: aproximadamente 559 ms até redirect.

Localhost anônimo existente:

- `/login`: aproximadamente 6765 ms.
- `/funil/radar`: aproximadamente 3012 ms até redirect.
- `/funil/opportunities`: aproximadamente 1892 ms até redirect.
- `/funil/source-confidence`: aproximadamente 2637 ms até redirect.

Conclusão operacional: a lentidão observada parece majoritariamente ligada ao ambiente localhost/dev server, não ao build hospedado na Vercel.

## 9. AI cost in this phase

- Período: 2026-06-02..2026-06-04.
- Mês corrente: 2026-06.
- Sem chamada IA feita por F4OPS.
- Scripts de teste reportaram sem incremento de `ai_usage_logs` onde aplicável.
- Gasto incremental desta fase: US$ 0,00.

## 10. Known issues

- Projeto Vercel está com Node `24.x`; `package.json` declara `"node": ">=20.0.0"`, e a Vercel avisou que isso pode subir automaticamente para novo major. Recomendação: considerar pin explícito de Node 20 ou 22 em decisão operacional separada, se quiser reduzir variabilidade.
- Workspace local não está linkado a Vercel (`.vercel/` ausente). A validação foi feita contra o projeto remoto via CLI autenticado.
- A validação autenticada completa por browser não foi automatizada com credencial/sessão salva pelo agente; porém logs Vercel mostram login real e rotas autenticadas retornando 200 durante a rodada.
- Warning crônico: `The Next.js plugin was not detected in your ESLint configuration`. Não bloqueia F4OPS.
- Restam arquivos untracked antigos fora do escopo (`=`, zip F4A, logs/snapshots QA). Não foram limpos por restrição explícita do operador.
- F4OPS usou Production URL como ambiente de validação nesta rodada por aprovação explícita do operador; para rotina normal, manter preferência por branch/Preview Deploy.

## 11. Deviations from plan

- **O que mudou:** validação foi feita na URL Production `https://mvp-2-go.vercel.app`, não em Preview Deploy.
- **Por que mudou:** operador aprovou explicitamente: "NESTA EM ESPECIFICO, PODE FAZER EM PROD".
- **Risco aceito:** smoke em produção pode tocar rotas reais; mitigado por validações read-only/anônimas, inspeção de logs e sem alteração de dados/env/crons.
- **Aprovação:** sim, operador em 2026-06-02.

- **O que mudou:** houve uma correção mínima de App Router (`src/app/(dashboard)/page.tsx` removido) durante F4OPS.
- **Por que mudou:** deploy Vercel falhava com ENOENT de client-reference-manifest gerado por page raiz duplicada no route group `(dashboard)`.
- **Risco aceito:** baixo; `src/app/page.tsx` já cobre `/` e redireciona para `/dashboard`.
- **Aprovação:** sim, operador pediu tratar como erro de build/App Router e corrigir inconsistência sem criar feature.

## 12. Open questions

- Definir se o projeto Vercel deve pinzar Node em `20.x`/`22.x` em vez de usar `24.x` automático.
- Decidir se vale criar branch/Preview Deploy dedicado para próximas validações, mesmo que esta rodada tenha sido aceita em produção.
- Decidir se deve limpar arquivos untracked antigos antes de encerrar a feature/branch.
- Decidir se `GTRENDS_*` deve entrar em `.env.example` somente quando houver aprovação para ativar cron/BigQuery operacional.

## 13. Next recommended step

> Acionar Agent 5 para revisar F4OPS contra `docs/agents/AGENT_12_F4OPS_VERCEL_STAGING.md`, com foco em build Vercel, rota App Router corrigida, logs/rotas de produção, GT cron desligado e ausência de alterações em motor/scoring/schema/sources/F4C/F5.

## 14. Reviewer requested

- Reviewer: Agent 5.
- Foco recomendado da review:
  - confirmar que o ENOENT foi resolvido pelo commit `450ca86`;
  - confirmar que `src/app/(dashboard)/page.tsx` não é mais necessário;
  - revisar logs Vercel e smoke das rotas principais;
  - confirmar que cron Google Trends segue desligado;
  - confirmar que nenhuma alteração de motor/scoring/schema/migration/sources/env/F4C/F5 foi feita.
