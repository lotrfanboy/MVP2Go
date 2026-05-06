/**
 * F0 gate: validate `evaluateBudget()` thresholds 0.80 / 0.90 / 1.00 in cron vs
 * manual triggering, with optional override.
 *
 * No DB connection required: this exercises the pure threshold function. The
 * scenarios mirror the brief (78% ok, 82% warning, 92% auto-stop, 100% hard-stop)
 * using a small budget so the cents math is unambiguous.
 *
 * Run: `npm run test:budget`
 */
import { evaluateBudget, type BudgetTrigger } from "../src/ai/budget";

type Case = {
  label: string;
  spendUsd: number;
  budgetUsd: number;
  triggeredBy: BudgetTrigger;
  override?: boolean;
  expectedStatus: "ok" | "warning" | "auto_stopped" | "hard_stopped";
  expectedOk: boolean;
};

const thresholds = {
  warningThreshold: 0.8,
  autoStopThreshold: 0.9,
  hardStopThreshold: 1.0,
};

const cases: Case[] = [
  // 78% — under warning
  { label: "78% cron",                spendUsd: 0.39, budgetUsd: 0.5, triggeredBy: "cron",                  expectedStatus: "ok",            expectedOk: true },
  { label: "78% manual",              spendUsd: 0.39, budgetUsd: 0.5, triggeredBy: "manual",                expectedStatus: "ok",            expectedOk: true },
  // 82% — warning, both pass with log
  { label: "82% cron",                spendUsd: 0.41, budgetUsd: 0.5, triggeredBy: "cron",                  expectedStatus: "warning",       expectedOk: true },
  { label: "82% manual",              spendUsd: 0.41, budgetUsd: 0.5, triggeredBy: "manual",                expectedStatus: "warning",       expectedOk: true },
  // 92% — auto-stop for cron and for manual without override; manual+override passes (status=warning)
  { label: "92% cron",                spendUsd: 0.46, budgetUsd: 0.5, triggeredBy: "cron",                  expectedStatus: "auto_stopped",  expectedOk: false },
  { label: "92% cron+override",       spendUsd: 0.46, budgetUsd: 0.5, triggeredBy: "cron",   override: true, expectedStatus: "auto_stopped",  expectedOk: false }, // cron cannot override
  { label: "92% manual",              spendUsd: 0.46, budgetUsd: 0.5, triggeredBy: "manual",                expectedStatus: "auto_stopped",  expectedOk: false },
  { label: "92% manual+override",     spendUsd: 0.46, budgetUsd: 0.5, triggeredBy: "manual", override: true, expectedStatus: "warning",       expectedOk: true  },
  // 100% — hard-stop everywhere; override is NOT honored at hard stop
  { label: "100% cron",               spendUsd: 0.50, budgetUsd: 0.5, triggeredBy: "cron",                  expectedStatus: "hard_stopped",  expectedOk: false },
  { label: "100% manual",             spendUsd: 0.50, budgetUsd: 0.5, triggeredBy: "manual",                expectedStatus: "hard_stopped",  expectedOk: false },
  { label: "100% manual+override",    spendUsd: 0.50, budgetUsd: 0.5, triggeredBy: "manual", override: true, expectedStatus: "hard_stopped",  expectedOk: false },
];

let failed = 0;
for (const c of cases) {
  const result = evaluateBudget(
    {
      budget: c.budgetUsd,
      spend: c.spendUsd,
      ...thresholds,
    },
    { triggeredBy: c.triggeredBy, override: c.override },
  );

  const okMatches = result.ok === c.expectedOk;
  const statusMatches = result.status === c.expectedStatus;
  const pass = okMatches && statusMatches;

  if (pass) {
    console.log(
      `[ok]   ${c.label.padEnd(28)} -> ${result.status.padEnd(13)} (ratio=${result.ratio.toFixed(3)})`,
    );
  } else {
    failed++;
    console.error(
      `[FAIL] ${c.label.padEnd(28)} expected ok=${c.expectedOk} status=${c.expectedStatus}, got ok=${result.ok} status=${result.status}`,
    );
  }
}

if (failed > 0) {
  console.error(`\n${failed} case(s) failed.`);
  process.exit(1);
}

console.log(`\nAll ${cases.length} budget cases passed. Thresholds 0.80 / 0.90 / 1.00 OK.`);
