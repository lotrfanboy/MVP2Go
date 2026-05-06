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
- create migrations;
- install packages;
- change env variables;
- change cron behavior;
- call OpenAI;
- touch secrets;
- commit, push, or create PR.

## Database Rules

If a migration is needed:

1. Explain why.
2. Show SQL preview.
3. Wait for owner approval.
4. Do not apply silently.

## Implementation Rules

- Keep TypeScript strict.
- Avoid `any` unless justified.
- Prefer typed data access.
- Preserve existing architecture.
- Do not implement future phases early.
- Do not invent backend just to satisfy frontend.
- Use honest placeholders where backend is not ready.

## Final Handback

At the end, create/update a handback with:

- Agent name
- Phase
- Scope completed
- Files created
- Files changed
- Commands executed
- Packages installed
- Migrations proposed/applied
- Env vars needed
- Tests/checks run
- Known issues
- Deviations from plan
- Next recommended step
- Reviewer requested