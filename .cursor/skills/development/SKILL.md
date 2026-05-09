---
name: gomvp-development
description: Use this skill when implementing GoMVP product code, APIs, routes, database access, frontend integration, collectors, or phase-specific engineering tasks.
---

# GoMVP Development Skill

Use this skill for implementation work in GoMVP.

## Core Principles

Build in small, reviewable slices.

Prefer:
- simple implementation;
- type-safe code;
- clear file organization;
- no overengineering;
- low-support product behavior;
- web-first MVP;
- reusable components/utilities.

## Must Read

Before editing files, read:

- docs/PRD.md
- docs/IMPLEMENTATION_PLAN.md
- docs/PROJECT_STATE.md
- docs/DECISIONS.md
- docs/AGENTS.md
- .cursor/rules/gomvp-product-rules.mdc
- current agent brief in docs/agents/
- docs/architecture/F4_OPPORTUNITY_MOTOR.md (when working on F4A/B/C)
- docs/architecture/F5_SOURCE_EXPANSION.md (when working on F5)

## Approval First

Before editing, report:

1. current phase;
2. assigned scope;
3. files you plan to create/change;
4. commands you plan to run;
5. risks;
6. ask for approval.

## Forbidden Without Explicit Approval

Do not:

- change schema;
- create or **apply** migrations (SQL preview is allowed after reporting scope; **application** requires explicit per-migration operador approval — there is no standing authorization);
- install packages;
- change env variables (except documenting new keys in `.env.example` when operador approves);
- change cron behavior;
- call OpenAI;
- touch secrets;
- commit, push, or create PR.

## Database Rules

If a migration is needed:

1. Explain why.
2. Show **full SQL preview** (or `drizzle-kit` output) to the operator.
3. Wait for **explicit approval of that specific migration** before `db:migrate` or any apply step.
4. Never apply silently.

## Implementation Rules (product / architecture)

- Keep TypeScript strict.
- Avoid `any` unless justified.
- Prefer typed data access.
- Preserve existing architecture.
- Do not implement future phases early.
- Do not invent backend just to satisfy frontend.
- Use honest placeholders where backend is not ready.
- **Never rename or substitute `signals` with `evidences`.** They are distinct layers (`signals` = F2 semantic extractions; `evidences` = source-agnostic motor input). The motor (`src/motor/*`) is **source-agnostic**: do not import HN/Trends/PH/etc. inside it.
- **F4A adapter `signals → evidences`:** process **only new** signals after go-live — **no historical backfill** unless a separate operador-approved job with dry-run exists.
- **AI budget:** effective monthly cap comes from **ENV + `cost_budgets`** (e.g. `AI_MONTHLY_BUDGET_USD`), not hardcoded literals. During F4/F5 motor validation the **operational default** is often US$ 5/mês (see D-16); that value is **configurable**, not an eternal fixed product constant.
- Every AI call goes through `assertBudget()` and logs to `ai_usage_logs` with `prompt_version`.

## Final Handback

At the end, create/update a handback with:

- Agent name
- Phase
- Scope completed
- Files created
- Files changed
- Commands executed
- Packages installed
- Migrations proposed/applied (with SQL preview link or paste; note operador approval)
- Env vars needed
- Tests/checks run
- Known issues
- Deviations from plan
- Next recommended step
- Reviewer requested
