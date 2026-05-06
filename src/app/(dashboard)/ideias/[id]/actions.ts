"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { feedback, ideas } from "@/db/schema";

const actionSchema = z.object({
  ideaId: z.string().uuid(),
  action: z.enum(["approve", "reject", "promising", "snooze", "note"]),
  note: z.string().max(2000).optional(),
});

const statusByAction: Record<"approve" | "reject" | "promising" | "snooze", string> = {
  approve: "approved",
  reject: "rejected",
  promising: "promising",
  snooze: "snoozed",
};

export async function ideaAction(formData: FormData) {
  const parsed = actionSchema.safeParse({
    ideaId: String(formData.get("ideaId") ?? ""),
    action: String(formData.get("action") ?? ""),
    note: String(formData.get("note") ?? "").trim() || undefined,
  });

  if (!parsed.success) return;

  const db = getDb();
  const { action, ideaId, note } = parsed.data;

  if (action !== "note") {
    await db
      .update(ideas)
      .set({ status: statusByAction[action], updatedAt: new Date() })
      .where(eq(ideas.id, ideaId));
  }

  await db.insert(feedback).values({
    ideaId,
    action,
    note: note ?? null,
    weightsDelta: {},
  });

  revalidatePath(`/ideias/${ideaId}`);
  revalidatePath("/ranking");
  revalidatePath("/filtradas");
  revalidatePath("/dashboard");
}
