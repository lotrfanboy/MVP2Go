---
name: gomvp-frontend
description: Use this skill when designing or implementing GoMVP frontend screens, SaaS dashboard UI, Tailwind/shadcn components, responsive layout, empty states, or visual polish.
---

# GoMVP Frontend Skill

Use this skill for GoMVP UI/UX and frontend implementation.

## Visual Direction

Create a professional SaaS dashboard.

Inspired by:
- Linear
- Vercel
- Notion
- modern admin dashboards

The UI must feel:
- clean;
- sharp;
- trustworthy;
- fast;
- practical;
- internal lab/product ops focused.

Avoid:
- childish gradients;
- overdesigned animations;
- marketplace vibe;
- social network vibe;
- enterprise bloat;
- fake complexity.

## Language

User-facing UI must be in Brazilian Portuguese.

Code, file names and component names may be in English.

## F3 Screens

Implement/validate:

1. Dashboard
2. Ranking / Top ideias
3. Detalhe da ideia
4. Ideias filtradas
5. Sinais
6. Clusters
7. Execuções / Runs
8. Fontes
9. Custos IA
10. Blacklist / Regras
11. Weights
12. Prompts read-only
13. Brief MVP
14. Configurações / estados gerais

## Components

Prefer reusable components:

- app shell
- sidebar
- topbar
- page header
- KPI card
- data table
- filter bar
- status badge
- score badge
- risk badge
- empty state
- loading skeleton
- error state
- detail panel/drawer
- action button group
- budget progress card
- source status card

## Data Rules

Use real data when available.

If backend is not ready:
- use honest empty states;
- use placeholders clearly marked as placeholder/demo;
- do not invent backend;
- do not alter schema;
- do not create migrations.

## Product Truth

The UI must reinforce:

- AI score is prioritization, not real validation.
- Real validation requires click, signup, usage, return, payment or sharing.
- Risky/blacklisted ideas belong in “Filtradas”.
- GoMVP is for one operator reviewing ideas quickly.

## Forbidden

Do not:
- change schema;
- create migrations;
- change backend business logic;
- change collectors;
- change AI pipeline;
- change scoring;
- change budget/assertBudget;
- change cron;
- touch secrets;
- call OpenAI.

## UI Acceptance Checklist

For every screen:

- clear page title;
- short subtitle;
- primary action if applicable;
- loading state;
- empty state;
- error state;
- responsive layout;
- no broken navigation;
- no obvious overflow;
- no critical console errors.

## Final Validation

After implementation, request Playwright QA or run Playwright MCP if allowed.

Validate:
- all routes load;
- sidebar works;
- desktop/tablet/mobile works;
- no 404;
- no blank screens;
- no critical console errors.