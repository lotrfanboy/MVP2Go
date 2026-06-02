# F4UX Funnel UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the GoMVP funnel understandable as an opportunity motor in under 30 seconds without changing motor, scoring, schema, collectors, cron, feedback, ideas, or briefs.

**Architecture:** Keep the current Next.js App Router and server-component data access. Add focused frontend components for navigation, badges, score cards, evidence trace, and empty states, then reuse them across `/funil/*`. Data stays read-only except the already-existing manual/watch/gate actions.

**Tech Stack:** Next.js 15 App Router, TypeScript strict, Tailwind, shadcn/ui primitives, Drizzle read queries, `lucide-react` icons.

---

## File Structure

- Modify `.gitignore`: ignore local npm cache used by sandboxed installs.
- Modify `package.json` and `package-lock.json`: add `lucide-react`.
- Create `docs/superpowers/plans/2026-06-01-f4ux-funnel-ui.md`: this execution plan.
- Create `src/components/funil/funil-ui.tsx`: shared funnel UI primitives: page header, badges, score cards, source badges, empty states, JSON preview, format helpers.
- Modify `src/components/dashboard/nav-config.ts`: restructure navigation around Principal, Funil, Execucao, Sistema, Legado.
- Modify `src/components/dashboard/nav-item.tsx`, `nav-group.tsx`, `app-sidebar.tsx`, `app-topbar.tsx`, `app-shell.tsx`, `funil-disclaimer.tsx`: real icons, clearer active states, dark-first polish, PT-BR breadcrumbs.
- Modify `src/app/globals.css`: dark-first visual tokens with subtle purple accent and readable light mode fallback.
- Modify `src/app/(dashboard)/funil/radar/page.tsx`: operator overview with counts, source coverage, low-confidence/overlap notices, latest opportunities.
- Modify `src/app/(dashboard)/funil/opportunities/page.tsx`: product-centric list with filters, gate explanations, score/source badges, rejection/low-confidence states.
- Modify `src/app/(dashboard)/funil/opportunities/[id]/page.tsx`: opportunity detail with hero summary, status explanation, score breakdown, evidence trace, F4C placeholder.
- Modify `src/app/(dashboard)/funil/source-confidence/page.tsx`: generic evidence audit with source meanings and overlap explanation.
- Modify `src/app/(dashboard)/funil/trends/page.tsx`, `need-clusters/page.tsx`, `manual/page.tsx`, `watch-topics/page.tsx`, forms: PT-BR labels and honest seed/validation microcopy.
- Create `docs/handback/F4UX_DONE.md`: final handback after checks.

## Task 1: Dependencies And Baseline

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `.gitignore`
- Create: `docs/superpowers/plans/2026-06-01-f4ux-funnel-ui.md`

- [ ] **Step 1: Install icon dependency**

Run:

```bash
npm install lucide-react --cache ./.npm-cache
```

Expected: dependency installed, package files updated, npm may report existing audit warnings.

- [ ] **Step 2: Ignore workspace npm cache**

Add `.npm-cache/` to `.gitignore`.

- [ ] **Step 3: Run initial checks**

Run:

```bash
npm run typecheck
npm run lint
```

Expected: either pass or reveal pre-existing route/config issues to fix before UI work.

## Task 2: Navigation And Shell

**Files:**
- Modify: `src/components/dashboard/nav-config.ts`
- Modify: `src/components/dashboard/nav-item.tsx`
- Modify: `src/components/dashboard/nav-group.tsx`
- Modify: `src/components/dashboard/app-sidebar.tsx`
- Modify: `src/components/dashboard/app-topbar.tsx`
- Modify: `src/components/dashboard/app-shell.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Replace letter icons**

Use `lucide-react` icon names in nav config and render them in `NavItem`.

- [ ] **Step 2: Reorder navigation**

Set groups to Principal, Funil, Execucao, Sistema, Legado. Keep sources as infrastructure under Sistema, not a primary product path.

- [ ] **Step 3: Improve active state**

Use a subtle purple accent border/background and preserve readable contrast in dark mode.

- [ ] **Step 4: Fix breadcrumbs**

Map `/funil/*` routes to "Funil > ..." and legacy routes to "Legado > ...".

- [ ] **Step 5: Run focused checks**

Run:

```bash
npm run typecheck
```

Expected: TypeScript passes after icon typing changes.

## Task 3: Funnel UI Primitives

**Files:**
- Create: `src/components/funil/funil-ui.tsx`
- Modify: `src/components/dashboard/funil-disclaimer.tsx`

- [ ] **Step 1: Add shared helpers**

Implement functions for percent formatting, compact dates, gate labels, evidence type labels, source labels, source validation class, and score bands.

- [ ] **Step 2: Add UI primitives**

Create `PageHeader`, `MetricCard`, `StatusBadge`, `SourceBadge`, `ScoreBar`, `InsightNotice`, `EmptyState`, `JsonPreview`, and `EvidenceTraceList`.

- [ ] **Step 3: Update disclaimer**

Replace the amber warning block with a compact operator notice explaining score, validation, manual/watch seeds, and F4C placeholder.

## Task 4: Radar And Funnel Overview

**Files:**
- Modify: `src/app/(dashboard)/funil/radar/page.tsx`

- [ ] **Step 1: Extend read queries**

Add counts for evidences, trends, need clusters, opportunities, rejected, low confidence, source coverage, latest evidences, and latest opportunities.

- [ ] **Step 2: Render operator overview**

Show the product flow, key metrics, source coverage, low-overlap notice, top opportunities, and empty states.

- [ ] **Step 3: Keep queries bounded**

Use limits for latest lists and aggregate counts server-side.

## Task 5: Opportunities List And Detail

**Files:**
- Modify: `src/app/(dashboard)/funil/opportunities/page.tsx`
- Modify: `src/app/(dashboard)/funil/opportunities/[id]/page.tsx`
- Modify: `src/app/(dashboard)/funil/opportunities/[id]/gate-form.tsx`

- [ ] **Step 1: Replace raw query-string filter help**

Render segmented filter links for main gates and keep the existing `?gate=` behavior.

- [ ] **Step 2: Render opportunity cards/table hybrid**

Show title, gate label, score bars, source confidence, evidence count, source count, low-confidence and rejection badges.

- [ ] **Step 3: Improve detail hero**

Show pain, audience, status explanation, axes, reason codes, blacklist tags, source confidence explanation, and a no-F4C-actions-yet note.

- [ ] **Step 4: Expand evidence trace**

Show `source_key`, `evidence_type`, `topic_key`, `topic_label`, `source_ref`, `observed_at`, `metrics_json`, `metadata_json`, `blacklist_tags`, `manual_input_id`, and `watch_topic_id`.

## Task 6: Evidence, Trends, Needs, Manual, Watch

**Files:**
- Modify: `src/app/(dashboard)/funil/source-confidence/page.tsx`
- Modify: `src/app/(dashboard)/funil/trends/page.tsx`
- Modify: `src/app/(dashboard)/funil/need-clusters/page.tsx`
- Modify: `src/app/(dashboard)/funil/manual/page.tsx`
- Modify: `src/app/(dashboard)/funil/manual/manual-input-form.tsx`
- Modify: `src/app/(dashboard)/funil/watch-topics/page.tsx`
- Modify: `src/app/(dashboard)/funil/watch-topics/watch-topic-form.tsx`

- [ ] **Step 1: Source confidence page**

Explain external source confidence, no overlap, HN, Google Trends, manual/watch seeds, and absence in trends.

- [ ] **Step 2: Trends page**

Explain trend as momentum, not pain; show window scores and evidence count.

- [ ] **Step 3: Need clusters page**

Use "Dores agrupadas" labels and clarify distinction from legacy `clusters`.

- [ ] **Step 4: Manual and watch pages**

Use PT-BR labels and honest copy: manual analyzes now; watch monitors over time; neither validates market alone.

## Task 7: Validation And Handback

**Files:**
- Create: `docs/handback/F4UX_DONE.md`

- [ ] **Step 1: Run required checks**

Run:

```bash
npm run typecheck
npm run lint
npm run build
npm run test:gtrends-normalizer
npm run test:gtrends-overlap
```

Expected: pass or documented failure with exact reason.

- [ ] **Step 2: Run browser validation**

Start local server and validate `/dashboard`, `/funil/radar`, `/funil/opportunities`, one opportunity detail when data exists, `/funil/source-confidence`, `/funil/manual`, `/funil/watch-topics`, and legacy/admin routes.

- [ ] **Step 3: Write handback**

Create `docs/handback/F4UX_DONE.md` with changed files, pages improved, checks, browser notes, scope confirmations, remaining minors, and F4C readiness recommendation.

## Self-Review

- Spec coverage: plan covers navigation, Radar, Opportunities, Evidence Trace, Source Confidence, Manual, Watch, visual polish, checks, and handback.
- Scope guard: no motor, scoring, schema, migrations, collectors, cron, paid providers, feedback, idea generation, or brief generation.
- Type consistency: plan uses actual table/component names already present in the repo.
