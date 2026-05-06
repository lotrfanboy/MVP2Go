import "dotenv/config";
import { eq } from "drizzle-orm";
import { assertBudget, checkBudget } from "@/ai/budget";
import { getDb } from "@/db";
import { costBudgets } from "@/db/schema";

function firstOfMonthUtc(d = new Date()): string {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

async function setSpend(spendUsd: string): Promise<void> {
  const period = firstOfMonthUtc();
  await getDb()
    .update(costBudgets)
    .set({
      currentSpendUsd: spendUsd,
      updatedAt: new Date(),
    })
    .where(eq(costBudgets.periodMonth, period));
}

async function currentBudget() {
  const period = firstOfMonthUtc();
  const [row] = await getDb()
    .select()
    .from(costBudgets)
    .where(eq(costBudgets.periodMonth, period))
    .limit(1);
  if (!row) throw new Error(`No budget row for ${period}`);
  return row;
}

async function runScenario(label: string, spendRatio: number): Promise<void> {
  const budgetRow = await currentBudget();
  const budget = Number(budgetRow.monthlyBudgetUsd);
  const spend = (budget * spendRatio).toFixed(6);
  await setSpend(spend);

  const cron = await checkBudget({ triggeredBy: "cron" });
  const manual = await checkBudget({ triggeredBy: "manual" });
  const manualOverride = await checkBudget({ triggeredBy: "manual", override: true });

  console.log(
    `[${label}] spend=${spend} ratio=${spendRatio.toFixed(2)} cron=${cron.status} manual=${manual.status} manual+override=${manualOverride.status}`,
  );

  const checks: Array<{ name: string; fn: () => Promise<void> }> = [
    { name: "assert cron", fn: () => assertBudget({ triggeredBy: "cron" }) },
    { name: "assert manual", fn: () => assertBudget({ triggeredBy: "manual" }) },
    {
      name: "assert manual+override",
      fn: () => assertBudget({ triggeredBy: "manual", override: true }),
    },
  ];

  for (const check of checks) {
    try {
      await check.fn();
      console.log(`  - ${check.name}: pass`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`  - ${check.name}: blocked (${message})`);
    }
  }
}

async function main() {
  const initial = await currentBudget();
  const originalSpend = String(initial.currentSpendUsd);
  console.log(`[budget] month=${initial.periodMonth} budget=${initial.monthlyBudgetUsd} original_spend=${originalSpend}`);

  try {
    await runScenario("0.79", 0.79);
    await runScenario("0.85", 0.85);
    await runScenario("0.95", 0.95);
    await runScenario("1.00", 1.0);
  } finally {
    await setSpend(originalSpend);
    console.log(`[budget] restored original spend=${originalSpend}`);
  }
}

main().catch((error) => {
  console.error("[test-budget-live] FAILED", error);
  process.exit(1);
});
