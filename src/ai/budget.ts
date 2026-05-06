import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { costBudgets } from "@/db/schema";

export type BudgetTrigger = "cron" | "manual";

export type BudgetStatus = "ok" | "warning" | "auto_stopped" | "hard_stopped";

export type BudgetCheckResult =
  | { ok: true; status: "ok" | "warning"; spend: number; budget: number; ratio: number }
  | {
      ok: false;
      status: "auto_stopped" | "hard_stopped";
      spend: number;
      budget: number;
      ratio: number;
      reason: string;
    };

export type AssertBudgetOptions = {
  triggeredBy: BudgetTrigger;
  /** Custo estimado da operação atual em USD. Somado ao gasto acumulado para checagem. */
  estimatedCostUsd?: number;
  /** Operador pode forçar `manual + override` para passar em `auto_stopped` (não em `hard_stopped`). */
  override?: boolean;
};

export type BudgetThresholds = {
  warningThreshold: number;
  autoStopThreshold: number;
  hardStopThreshold: number;
};

export type BudgetSnapshot = BudgetThresholds & {
  budget: number;
  spend: number;
};

/**
 * Pure threshold logic, separated from DB I/O for ergonomic testing.
 *
 * Hard rule (D-08, PRD §11):
 *   - hard_stop  (ratio >= hardThreshold)  → bloqueia tudo, override não vale.
 *   - auto_stop  (ratio >= autoThreshold)  → bloqueia cron sempre; manual só
 *                                            passa com `override=true`.
 *   - warning    (ratio >= warnThreshold)  → permite, mas sinaliza no log.
 *   - ok         caso contrário.
 */
export function evaluateBudget(
  snap: BudgetSnapshot,
  opts: { triggeredBy: BudgetTrigger; override?: boolean; additionalCostUsd?: number },
): BudgetCheckResult {
  const totalSpend = snap.spend + (opts.additionalCostUsd ?? 0);
  const ratio = snap.budget > 0 ? totalSpend / snap.budget : 0;

  if (ratio >= snap.hardStopThreshold) {
    return {
      ok: false,
      status: "hard_stopped",
      spend: totalSpend,
      budget: snap.budget,
      ratio,
      reason: `Hard stop reached (ratio=${ratio.toFixed(3)} >= ${snap.hardStopThreshold}). All AI calls blocked. Override is NOT honored at hard stop.`,
    };
  }

  if (ratio >= snap.autoStopThreshold) {
    if (opts.triggeredBy === "manual" && opts.override) {
      return {
        ok: true,
        status: "warning",
        spend: totalSpend,
        budget: snap.budget,
        ratio,
      };
    }
    const who = opts.triggeredBy === "cron" ? "cron-triggered" : "manual";
    const tip =
      opts.triggeredBy === "cron"
        ? "Cron runs cannot override; switch to manual + override to proceed consciously."
        : "Pass `override: true` to consciously proceed.";
    return {
      ok: false,
      status: "auto_stopped",
      spend: totalSpend,
      budget: snap.budget,
      ratio,
      reason: `Auto-stop reached for ${who} run (ratio=${ratio.toFixed(3)} >= ${snap.autoStopThreshold}). ${tip}`,
    };
  }

  if (ratio >= snap.warningThreshold) {
    return { ok: true, status: "warning", spend: totalSpend, budget: snap.budget, ratio };
  }

  return { ok: true, status: "ok", spend: totalSpend, budget: snap.budget, ratio };
}

function firstOfMonthUtc(d = new Date()): string {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

export async function addBudgetSpend(estimatedCostUsd: number): Promise<void> {
  if (estimatedCostUsd <= 0) return;
  const period = firstOfMonthUtc();
  await getDb()
    .update(costBudgets)
    .set({
      currentSpendUsd: sql`${costBudgets.currentSpendUsd} + ${String(estimatedCostUsd)}::numeric`,
      updatedAt: new Date(),
    })
    .where(eq(costBudgets.periodMonth, period));
}

/**
 * Loads the current month's budget row from `cost_budgets` and evaluates the
 * threshold against the proposed additional spend.
 */
export async function checkBudget(opts: AssertBudgetOptions): Promise<BudgetCheckResult> {
  const period = firstOfMonthUtc();

  const [row] = await getDb()
    .select()
    .from(costBudgets)
    .where(eq(costBudgets.periodMonth, period))
    .limit(1);

  if (!row) {
    throw new Error(
      `No cost_budgets row for period ${period}. Run \`npm run db:seed\` first.`,
    );
  }

  return evaluateBudget(
    {
      budget: Number(row.monthlyBudgetUsd),
      spend: Number(row.currentSpendUsd),
      warningThreshold: Number(row.warningThreshold),
      autoStopThreshold: Number(row.stopAutoThreshold),
      hardStopThreshold: Number(row.hardStopThreshold),
    },
    {
      triggeredBy: opts.triggeredBy,
      override: opts.override,
      additionalCostUsd: opts.estimatedCostUsd,
    },
  );
}

/**
 * Convenience wrapper that throws `BudgetExceededError` when the budget would
 * be exceeded. Use this immediately before any AI call (PRD RF-21).
 */
export async function assertBudget(opts: AssertBudgetOptions): Promise<void> {
  const result = await checkBudget(opts);
  if (!result.ok) {
    throw new BudgetExceededError(result.status, result.reason, result.ratio);
  }
}

export class BudgetExceededError extends Error {
  public readonly status: "auto_stopped" | "hard_stopped";
  public readonly ratio: number;

  constructor(status: "auto_stopped" | "hard_stopped", message: string, ratio: number) {
    super(message);
    this.name = "BudgetExceededError";
    this.status = status;
    this.ratio = ratio;
  }
}
