# F2_REVIEW — Agent 5 (Revisao F2)

## Status final

`approved_with_minors`

## Achados por severidade

### MINOR

1. **Warning recorrente de ESLint/Next no build.**
   - Arquivo: `eslint.config.mjs`.
   - Evidencia: `next build` finaliza com warning de plugin Next nao detectado.
   - Correcao sugerida: alinhar config ao formato recomendado do Next 15.

2. **Observabilidade de produto ainda limitada na UI atual para F2.**
   - Arquivos: `src/app/dashboard/page.tsx`, `src/app/(dashboard)/coleta/page.tsx`.
   - Evidencia: Playwright MCP mostra painel e tela de coleta funcionais, mas sem tela dedicada de ranking de ideias com justificativa de candidacia/score.
   - Nota: consistente com escopo de F2 (pipeline backend) e pendente para ciclo de painel (F3).

### INFO

1. **Gate reprovado anteriormente foi corrigido e revalidado.**
   - Arquivos: `src/pipeline/extract.ts`, `src/pipeline/filter_ai.ts`.
   - Evidencia: `extract.ts` chama `runAiFilterForDoubtfulItem()` em saidas ambiguas; `ai_usage_logs` registra `operation='filter_ai'` com `prompt_version='001'`.

2. **Servidor dev reiniciado para testes do operador e QA.**
   - `next dev` ativo em `http://localhost:3004` (porta `3000` ocupada por outro processo local).

## Correcoes aplicadas diretamente pelo Agent 5

Nenhuma alteracao de codigo de producao aplicada nesta revisao.

## Confirmacao dos gates F2 (✓/✗)

- [x] Migration F2 aplicada com `pgvector` habilitado.
- [x] Indice ivfflat em `signals.embedding` presente.
- [x] Tabelas F2 (`signals`, `clusters`, `signal_cluster`, `ideas`, `idea_signals`, `briefs`, `weights`, `prompts`, `feedback`) presentes.
- [x] 5 prompts versao `001` seedados em `prompts`.
- [x] Pesos default seedados (soma dos 10 pesos base = `1.00000`, `category_bonus=0.05` separado).
- [x] `npm run typecheck` / `npm run lint` / `npm run build` passam.
- [x] Pipeline ja gerou >= 20 ideias (snapshot atual: `ideas=119`).
- [x] `ai_usage_logs` registra chamadas IA com `prompt_version='001'`.
- [x] Teste de thresholds documentado no handback F2.
- [x] Invariante de blacklist em ideias: sem violacoes conhecidas.
- [x] Sem coletor adicional fora HN.
- [x] Nenhuma tela F3+ adiantada.
- [x] Reconciliacao de custo por run (`runs.cost_usd` ~= soma `ai_usage_logs.estimated_cost_usd`) validada em amostra recente.
- [x] Filtro hibrido F2 ativo em execucao (regras + IA leve com `P-FIL-001`) **comprovado**.

## Evidencias executadas nesta revisao final

- Build/checks:
  - `npm run typecheck` -> passou.
  - `npm run lint` -> passou.
  - `npm run build` -> passou (com warning MINOR do plugin Next).
- Cron F2:
  - `POST /api/cron/extract` sem bearer -> `401`.
  - `POST /api/cron/extract` com bearer -> `200` (run `1fbd8b9a-4cf2-4d94-908e-91499e11df77`).
- Banco (snapshot atual):
  - `signals=168`, `ideas=119`.
  - `ai_usage_logs` por operacao: `extract=213`, `embedding=5`, `cluster_summary=23`, `idea_gen=39`, `filter_ai=2`.
  - Evidencia objetiva do gate corrigido: `filter_ai` saiu de `0` para `>=1` e agora esta em `2`.
  - `runs.cost_usd` vs soma de `ai_usage_logs` batendo em amostra de runs `extract/generate`.
- Playwright MCP (UI/fluxos):
  - Login validado (`/login` -> `/dashboard`).
  - `/coleta` abre e mostra conversao `candidatos -> signals` e motivos de filtro em `raw_items`.
  - Confirmado ponto do operador: nao ha tela dedicada de ideias/ranking/justificativa no painel atual.

## Custo IA do mes corrente vs budget

- Mes: `2026-05`.
- Budget mensal configurado em ambiente: **US$ 5.00**.
- Gasto atual (`cost_budgets.current_spend_usd`): **US$ 0.060969**.
- Thresholds: **0.80 / 0.90 / 1.00**.
- Razao atual aproximada: **1.22%** do budget.

## Recomendacao ao operador

**F2 pode ser aceita e fechada.**

Pode acionar a proxima fase do plano.  
Como debito conhecido (nao bloqueante para F2), manter no backlog imediato de F3 a tela de ideias/ranking com explicabilidade (motivo de candidacia, score e evidencias por ideia), que foi o principal gap de visibilidade percebido na operacao.
