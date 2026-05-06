"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { weights } from "@/db/schema";
import { runScoreIdeas } from "@/pipeline/score";

const updateWeightSchema = z.object({
  id: z.string().uuid(),
  value: z.coerce.number().min(0).max(1),
});

export async function updateWeightAction(formData: FormData) {
  const parsed = updateWeightSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    value: String(formData.get("value") ?? ""),
  });

  if (!parsed.success) return;

  const db = getDb();
  await db
    .update(weights)
    .set({ value: String(parsed.data.value), updatedAt: new Date() })
    .where(eq(weights.id, parsed.data.id));

  revalidatePath("/pesos");
}

export async function recalculateScoresAction() {
  await runScoreIdeas();
  revalidatePath("/ranking");
  revalidatePath("/ideias");
  revalidatePath("/pesos");
}
