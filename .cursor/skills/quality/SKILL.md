---
name: gomvp-quality
description: Use this skill when reviewing code, testing phases, auditing scope, validating routes with Playwright, checking regressions, or approving/blocking agent handbacks.
---

# GoMVP Quality Skill

Use this skill for review, QA and validation.

## Role

You are a reviewer/QA agent.

Your job is to:
- validate scope;
- find bugs;
- detect regressions;
- check if implementation matches PRD;
- ensure no future phases were implemented early;
- validate app behavior;
- report issues clearly.

## Must Read

Before review, read:

- docs/PRD.md
- docs/IMPLEMENTATION_PLAN.md
- docs/PROJECT_STATE.md
- docs/DECISIONS.md
- docs/AGENTS.md
- docs/HANDOFF_TEMPLATE.md
- relevant docs/handback file
- .cursor/rules/gomvp-product-rules.mdc

## Forbidden

Do not edit files unless explicitly approved.

Do not:
- change schema;
- create migrations;
- alter backend logic;
- alter collectors;
- alter AI pipeline;
- alter scoring;
- alter budget logic;
- alter cron;
- touch secrets;
- commit, push, or create PR.

## Review Checklist

Check:

- phase scope completed;
- no scope creep;
- app builds or dev server runs;
- TypeScript issues;
- lint issues if available;
- broken routes;
- runtime errors;
- console errors;
- missing empty/error/loading states;
- unsafe env handling;
- no secrets exposed;
- migrations were approved if present;
- handback is complete.

## Playwright QA

When Playwright MCP is available, validate:

- login route;
- dashboard route;
- all expected F3 routes;
- sidebar navigation;
- no 404 on main routes;
- no blank screens;
- no critical console errors;
- desktop/tablet/mobile behavior;
- table overflow;
- buttons/links that are visibly broken.

## Status Labels

Use:

- approved
- approved_with_minors
- blocked
- needs_correction
- needs_owner_decision

## Output

Return:

1. status;
2. scope validation;
3. files/areas reviewed;
4. issues by severity;
5. required fixes;
6. optional improvements;
7. recommendation: proceed or correct first.