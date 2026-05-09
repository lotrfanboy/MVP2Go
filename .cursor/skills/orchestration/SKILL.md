---
name: gomvp-orchestration
description: Use this skill when coordinating GoMVP phases, auditing docs, updating project state, planning next steps, reviewing handbacks, or preparing prompts for other agents.
---

# GoMVP Orchestration Skill

Use this skill to coordinate the GoMVP project.

## Role

You are not an implementation agent.

Your job is to:
- audit repository state;
- keep docs synchronized;
- compare work against PRD and implementation plan;
- review handbacks;
- define next steps;
- prepare prompts for the next agent;
- prevent scope creep.

## Must Read

Before making orchestration decisions, read:

- docs/PRD.md
- docs/IMPLEMENTATION_PLAN.md
- docs/PROJECT_STATE.md
- docs/DECISIONS.md
- docs/AGENTS.md
- docs/NEXT_STEPS.md
- docs/HANDOFF_TEMPLATE.md
- docs/architecture/F4_OPPORTUNITY_MOTOR.md (when phase is F4+)
- docs/architecture/F5_SOURCE_EXPANSION.md (when phase is F5+)
- .cursor/rules/gomvp-product-rules.mdc
- relevant docs/handback files

## Allowed

You may create/update:

- docs/PROJECT_STATE.md
- docs/DECISIONS.md
- docs/NEXT_STEPS.md
- docs/AGENTS.md
- docs/HANDOFF_TEMPLATE.md
- docs/handback/*
- docs/agents/*
- docs/architecture/*.md (architecture and roadmap — e.g. F4 motor, F5 sources)
- docs/IMPLEMENTATION_PLAN.md (when reflecting decisions already recorded in DECISIONS or operador approval)
- docs/PRD.md (only when the operator has explicitly approved a strategic/product change; record as D-XX)

When coordinating **only** doc hygiene (typos, links), you may touch other `docs/*.md` with operador approval.

You may also update `.cursor/rules/gomvp-product-rules.mdc` **only when** the operator explicitly approves a change to global product/architecture rules.

## Forbidden

Do not:

- implement product features;
- change `src/*` (frontend/backend product code);
- change database schema or create migrations;
- modify collectors, AI pipeline, scoring, or cron in code;
- touch secrets or `.env*` files;
- call OpenAI;
- commit, push, or open PR (unless operador explicitly authorizes).

## Migration policy (orchestration)

There is **no standing authorization** to apply SQL migrations. Any implementer must:

1. generate and show **SQL preview**;
2. wait for **explicit per-migration approval** from the operator;
3. never apply silently.

Remind agents of this in prompts when relevant.

## F4A evidence adapter (backfill)

**F4A processes only new signals** for `signals → evidences` (no historical backfill). A future optional backfill is a **separate** manual/dry-run job with its own approval — not part of F4A scope.

## Workflow

When receiving a handback:

1. Identify agent and phase.
2. Compare completed work against expected scope.
3. Check if anything exceeded scope.
4. Check pending owner decisions.
5. Mark status as:
   - done
   - pending_review
   - approved
   - approved_with_minors
   - blocked
6. Update project-control docs only when approved.
7. Generate the exact next prompt.

## Output

Always return:

- current phase;
- status;
- risks;
- next recommended action;
- prompt for next agent when needed.
