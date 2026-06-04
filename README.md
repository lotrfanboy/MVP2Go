# GoMVP

Motor interno de oportunidades B2C da Built2Go.
Coleta sinais públicos, normaliza evidências (`evidences`), agrupa dores em `need_clusters`, gera `opportunity_cards` com scoring multi-axis e só permite ideias/briefs após gates humanos.

> **Status atual:** F0/F1/F2/F3 concluídas. **F4A/F4B/F4UX/F4OPS aprovadas com minors**; próximo passo é formalizar `staging`/`feature/*` antes de iniciar qualquer nova fase funcional. Para o estado vivo do projeto, ver [`docs/PROJECT_STATE.md`](docs/PROJECT_STATE.md).

## Stack

- Next.js 15 (App Router) + TypeScript estrito
- Tailwind CSS + shadcn/ui
- Supabase (Postgres + Auth) — `pgvector` entra em F2
- Drizzle ORM + drizzle-kit
- OpenAI (somente em F2+; provider abstrato pronto em F0)
- Vercel + Vercel Cron (orquestrador único)

## Setup local

### 1. Pré-requisitos

- Node.js >= 20
- Conta Supabase (projeto **dev** dedicado)
- Acesso à conta OpenAI (apenas em F2+; F0 não consome)

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais reais. **Nunca comite `.env.local`.**

### 4. Aplicar migrations no Supabase dev

> **Importante:** sempre revise o SQL gerado em `src/db/migrations/0000_*.sql` antes de aplicar.

```bash
npm run db:generate    # gera SQL a partir de src/db/schema.ts
# revisar arquivo em src/db/migrations/
npm run db:migrate     # aplica no Supabase dev (DATABASE_URL)
npm run db:seed        # cria/atualiza linha de cost_budgets do mês corrente
```

### 5. Validar guard de orçamento

```bash
npm run test:budget
```

Simula `current_spend_usd` em 78%, 82%, 92% e 100% e valida o comportamento de `assertBudget()` em runs de cron vs manual.

### 6. Rodar localmente

```bash
npm run dev
```

O servidor local é **fixo** em [http://localhost:3000](http://localhost:3000) (porta 3000 obrigatória, sem fallback automático).
Use uma conta criada no Supabase Auth (Authentication → Users → Add user → email+password).

## Scripts

| Script | Descrição |
|---|---|
| `npm run dev` | Next.js dev server. |
| `npm run build` | Build de produção. |
| `npm run typecheck` | TypeScript sem emit. |
| `npm run lint` | ESLint. |
| `npm run format` | Prettier. |
| `npm run db:generate` | Gera SQL de migrations a partir do schema Drizzle. |
| `npm run db:migrate` | Aplica migrations pendentes no banco. |
| `npm run db:seed` | Cria/atualiza linha em `cost_budgets` do mês corrente. |
| `npm run test:budget` | Valida thresholds 0.80/0.90/1.00 do `assertBudget()`. |
| `npm run test:opportunity-gate` | Valida state machine F4A. |
| `npm run test:opportunity-blacklist` | Valida blacklist persistida no motor F4A. |
| `npm run test:gtrends-normalizer` | Valida normalização `gtrends:search_momentum` e lookup arbitrário unsupported. |
| `npm run test:gtrends-overlap` | Diagnostica overlap entre `gtrends`, HN, `need_clusters`, `watch_topics` e opportunities. |

## Estrutura

```
src/
├── app/
│   ├── (dashboard)/        # painel autenticado + Funil F4A
│   ├── api/cron/           # endpoints disparados pelo Vercel Cron
│   ├── auth/               # rotas de auth (signout)
│   ├── login/
│   ├── layout.tsx
│   └── page.tsx
├── ai/                     # provider, openai, budget
├── collectors/             # coletores (HN em produção)
├── components/             # dashboard + shadcn primitives
├── db/                     # schema, client, migrations, seed
├── lib/                    # auth, runs, env, utils
├── motor/                  # F4 opportunity motor source-agnostic
├── pipeline/               # F1/F2 legado
├── prompts/                # prompts versionados
└── sources/                # F4/F5 source adapters/normalizers
```

## Princípios operacionais

- Cada nova migration **deve ser revisada em SQL antes de ser aplicada**.
- Toda chamada de IA (em F2+) passa por `assertBudget()` e grava em `ai_usage_logs`.
- `prompt_version` é salvo em cada chamada (tabela `prompts` nasce em F2).
- Teto de IA: **`cost_budgets` + ENV** (ex.: `AI_MONTHLY_BUDGET_USD`). Na validação F4/F5 o alvo operacional típico documentado é US$ 5/mês (D-16) — valor efetivo sempre configurável, não hardcoded no código. Thresholds fixos sobre o budget vigente: 0.80 (warning) / 0.90 (auto-stop em cron) / 1.00 (hard-stop).
- Sem commit, push ou PR sem aprovação humana explícita.
- Branching a partir das próximas features: `main` = produção, `staging` = homologação/Preview fixo, `feature/*` = trabalho de agentes. Ver [`docs/operations/BRANCHING_AND_DEPLOYMENT.md`](docs/operations/BRANCHING_AND_DEPLOYMENT.md).

## Documentação

- [`docs/PRD.md`](docs/PRD.md) — PRD canônico.
- [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) — plano incremental por fase.
- [`docs/PROJECT_STATE.md`](docs/PROJECT_STATE.md) — estado vivo do projeto (mantido pelo Agent 0).
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — decisões fechadas (D-01..D-10) e operacionais.
- [`docs/AGENTS.md`](docs/AGENTS.md) — papéis, escopo e fluxo entre agentes.
- [`docs/HANDOFF_TEMPLATE.md`](docs/HANDOFF_TEMPLATE.md) — template obrigatório de handback.
- [`docs/NEXT_STEPS.md`](docs/NEXT_STEPS.md) — próximas ações.
- [`docs/agents/`](docs/agents/) — briefs operacionais por fase.
- [`docs/handback/`](docs/handback/) — relatórios de fechamento e reviews por gate.
