# GoMVP — HANDOFF TEMPLATE

> Template **obrigatório** para qualquer handback de implementação.
> Salvar como `docs/handback/F<N>_DONE.md` (ou `F<N>_REVIEW.md` para Agent 5).
> Agentes não-implementadores (Agent 0/5) usam variações deste template.

---

## Cabeçalho

- **Agente:** `<ex.: Agent 6>`
- **Fase / Gate:** `<ex.: F3 — Painel + Ações>`
- **Tipo de handback:** `done | review | partial | blocked`
- **Status final do gate:** `approved | approved_with_minors | rejected | partial | unknown`
- **Data:** `YYYY-MM-DD`
- **Branch / Worktree:** `<branch ou "n/a (sem git local)">`
- **Reviewer solicitado:** `Agent 5`

---

## 1. Scope completed

Lista objetiva do que foi entregue, casada com o brief da fase em [`docs/agents/`](agents/) e com o Implementation Plan.

- [ ] item A
- [ ] item B
- [ ] item C

Não incluir features fora do escopo aprovado.

## 2. Files created

Lista de arquivos novos com caminho relativo ao repo:

- `src/...`
- `docs/...`

## 3. Files changed

Lista de arquivos editados (sem diffs gigantes, só caminho + 1 linha de motivo):

- `src/...` — motivo curto.
- `docs/...` — motivo curto.

## 4. Commands executed

Comandos efetivamente rodados durante a fase. Marcar resultado.

| Comando | Resultado | Observação |
|---|---|---|
| `npm install` | ok / failed | — |
| `npm run typecheck` | ok / failed | — |
| `npm run lint` | ok / failed | — |
| `npm run build` | ok / failed | — |
| `npm run db:generate` | ok / failed | — |
| `npm run db:migrate` | ok / failed | só com aprovação |
| `npm run db:seed` | ok / failed | — |
| `npm run test:budget` | ok / failed | quando aplicável |
| outros | — | — |

## 5. Packages installed

Lista cada pacote novo com versão exata e justificativa curta.

- `pkg@x.y.z` — motivo.

Se nenhum pacote foi instalado, escrever `Nenhum`.

## 6. Migrations proposed / applied

- **Arquivo:** `src/db/migrations/0XXX_*.sql`.
- **Status:** `proposed | reviewed | applied`.
- **Banco alvo:** `dev | prod` (apenas dev na V1).
- **SQL preview entregue ao operador antes de aplicar?** `sim | não`.
- **Resumo do schema afetado:** `<tabelas, índices, extensões>`.

Se não houver migration, escrever `Nenhuma`.

## 7. Env vars introduced or changed

- `VAR_NOME` — propósito, escopo (server-only / public), default seguro.

`.env.example` atualizado? `sim | não`.

Se nenhuma, escrever `Nenhuma`.

## 8. Tests / checks run

- Tests automatizados: `vitest | tsx scripts/* | n/a`.
- Smoke manual: lista do que foi exercido (login, ranking, etc.).
- Evidência (logs, `runs.id`, contagens em `ai_usage_logs`).

## 9. AI cost in this phase

- Período: `YYYY-MM-DD`..`YYYY-MM-DD`.
- Mês corrente: `YYYY-MM`.
- Budget mensal vigente: `US$ X.XX` (fonte: `cost_budgets` + ENV; na validação F4/F5 alvo típico US$ 5 — D-16).
- Gasto acumulado no mês (`cost_budgets.current_spend_usd`): `US$ X.XX`.
- Gasto incremental desta fase: `US$ X.XX`.
- Operações usadas (de `ai_usage_logs.operation`): contagem por `extract`, `embedding`, `cluster_summary`, `idea_gen`, `filter_ai`, `brief`.

Se a fase não chamou IA, escrever `Sem chamada IA. ai_usage_logs incremento = 0`.

## 10. Known issues

- Bugs conhecidos.
- Edge cases não cobertos.
- Pontos de fragilidade.

## 11. Deviations from plan

Qualquer divergência do PRD, Implementation Plan ou brief da fase. Para cada uma:

- **O que mudou:** ...
- **Por que mudou:** ...
- **Risco aceito:** ...
- **Aprovação:** `sim | não` (se sim, quem aprovou e quando).

Se nenhum desvio, escrever `Nenhum`.

## 12. Open questions

Perguntas não resolvidas que ficam para o operador / próxima fase.

## 13. Next recommended step

Uma única próxima ação clara, no formato:

> Acionar `<Agent X>` para `<o quê>`.
> ou
> Operador deve `<decisão>` antes de qualquer outro passo.

## 14. Reviewer requested

- Reviewer: `Agent 5`.
- Foco recomendado da review: `<lista curta de pontos críticos>`.

---

## Notas operacionais permanentes para todo handback

- Não inventar trabalho concluído. Só listar o que tem evidência (arquivo no repo, run no banco, log).
- Não esconder desvios. Registrar em §11 mesmo que pequenos.
- Não exibir secrets. Nunca colar `.env.local`, `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `CRON_SECRET` em handback.
- Sem commit/push/PR sem aprovação explícita.
