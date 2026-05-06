"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { feedback } from "@/db/schema";

const unfilterOverrideSchema = z.object({
  ideaId: z.string().uuid(),
  note: z.string().min(3).max(2000),
});

export async function unfilterOverrideAction(formData: FormData) {
  const parsed = unfilterOverrideSchema.safeParse({
    ideaId: String(formData.get("ideaId") ?? ""),
    note: String(formData.get("note") ?? "").trim(),
  });

  if (!parsed.success) return;

  const db = getDb();
  await db.insert(feedback).values({
    ideaId: parsed.data.ideaId,
    action: "unfilter_override",
    note: parsed.data.note,
    weightsDelta: {},
  });

  revalidatePath("/filtradas");
  revalidatePath("/ranking");
}
