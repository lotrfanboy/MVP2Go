import "dotenv/config";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { costBudgets, prompts, weights } from "./schema";
import { PROMPT_DEFS } from "../prompts";
import { env } from "@/lib/env";

/**
 * Idempotent seed for F0:
 *   - Creates (or refreshes) the `cost_budgets` row for the current month
 *     with configurable budget (`AI_MONTHLY_BUDGET_USD`) and thresholds
 *     0.80 / 0.90 / 1.00 (D-08).
 *
 * Re-runnable every call. Does NOT touch other tables (none exist yet in F0).
 */
function firstOfMonthUtc(d = new Date()): string {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is required. See .env.example.");
  }

  const client = postgres(url, { max: 1, prepare: false });
  const db = drizzle(client, { schema, casing: "snake_case" });

  const period = firstOfMonthUtc();
  const monthlyBudgetUsd = env.AI_MONTHLY_BUDGET_USD.toFixed(2);
  console.log(`[seed] upserting cost_budgets row for period_month=${period} ...`);

  const result = await db
    .insert(costBudgets)
    .values({
      periodMonth: period,
      monthlyBudgetUsd,
      warningThreshold: "0.80",
      stopAutoThreshold: "0.90",
      hardStopThreshold: "1.00",
      currentSpendUsd: "0",
      status: "active",
    })
    .onConflictDoUpdate({
      target: costBudgets.periodMonth,
      set: {
        monthlyBudgetUsd,
        warningThreshold: "0.80",
        stopAutoThreshold: "0.90",
        hardStopThreshold: "1.00",
        updatedAt: sql`now()`,
      },
    })
    .returning({
      id: costBudgets.id,
      periodMonth: costBudgets.periodMonth,
      monthlyBudgetUsd: costBudgets.monthlyBudgetUsd,
      currentSpendUsd: costBudgets.currentSpendUsd,
    });

  console.log("[seed] done:", result);

  for (const prompt of PROMPT_DEFS) {
    await db
      .insert(prompts)
      .values({
        name: prompt.name,
        version: prompt.version,
        content: prompt.content,
      })
      .onConflictDoNothing();
  }
  console.log(`[seed] prompts upserted: ${PROMPT_DEFS.length}`);

  const defaultWeights: Array<{ name: string; value: string }> = [
    { name: "pain_clarity", value: "0.18" },
    { name: "b2c_fit", value: "0.15" },
    { name: "evidence_volume", value: "0.12" },
    { name: "signal_strength", value: "0.10" },
    { name: "audience_specificity", value: "0.10" },
    { name: "build_simplicity", value: "0.10" },
    { name: "distribution_potential", value: "0.08" },
    { name: "recency", value: "0.07" },
    { name: "support_low", value: "0.05" },
    { name: "lgpd_safety", value: "0.05" },
    { name: "category_bonus", value: "0.05" },
    { name: "cosine_threshold", value: "0.78" },
  ];

  for (const weight of defaultWeights) {
    await db
      .insert(weights)
      .values(weight)
      .onConflictDoUpdate({
        target: weights.name,
        set: { value: weight.value, updatedAt: sql`now()` },
      });
  }
  console.log(`[seed] weights upserted: ${defaultWeights.length}`);

  await client.end({ timeout: 5 });
}

main().catch((error) => {
  console.error("[seed] FAILED:", error);
  process.exit(1);
});
