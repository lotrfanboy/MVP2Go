import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { ideas, weights } from "@/db/schema";

const PRIORITY_PRODUCT_TYPES = new Set([
  "utility",
  "ai_tool",
  "calculator",
  "generator",
  "checker",
  "organizer",
]);

const SUBSCORE_KEYS = [
  "pain_clarity",
  "b2c_fit",
  "evidence_volume",
  "signal_strength",
  "audience_specificity",
  "build_simplicity",
  "distribution_potential",
  "recency",
  "support_low",
  "lgpd_safety",
] as const;

function clamp(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

export async function runScoreIdeas(): Promise<{ updated: number }> {
  const db = getDb();
  const weightRows = await db.select().from(weights);
  const weightMap = new Map(weightRows.map((w) => [w.name, Number(w.value)]));
  const categoryBonus = weightMap.get("category_bonus") ?? 0.05;

  const rows = await db.select().from(ideas);

  for (const row of rows) {
    const subscores = (row.subscores ?? {}) as Record<string, number>;
    let weighted = 0;
    for (const key of SUBSCORE_KEYS) {
      weighted += (weightMap.get(key) ?? 0) * (Number(subscores[key]) || 0);
    }
    const bonus = PRIORITY_PRODUCT_TYPES.has(row.productType) ? categoryBonus : 0;
    const total = clamp(weighted + bonus);
    await db.update(ideas).set({ totalScore: String(total), updatedAt: new Date() }).where(eq(ideas.id, row.id));
  }

  return { updated: rows.length };
}
