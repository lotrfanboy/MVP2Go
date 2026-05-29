"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { opportunityCards } from "@/db/schema";

const Schema = z.object({
  id: z.string().uuid(),
  action: z.enum(["approve", "reject", "snooze", "watch"]),
  reason_code: z.string().min(2).max(80),
});

export async function transitionOpportunityGate(raw: z.infer<typeof Schema>) {
  const p = Schema.safeParse(raw);
  if (!p.success) return { ok: false as const, error: "invalid" };

  const db = getDb();
  const next = (() => {
    switch (p.data.action) {
      case "approve":
        return { gateState: "approved_opportunity" as const, codes: [p.data.reason_code] };
      case "reject":
        return { gateState: "rejected" as const, codes: [p.data.reason_code] };
      case "snooze":
        return { gateState: "snoozed" as const, codes: [p.data.reason_code] };
      case "watch":
        return { gateState: "watch" as const, codes: [p.data.reason_code] };
      default:
        return null;
    }
  })();
  if (!next) return { ok: false as const, error: "bad_action" };

  await db
    .update(opportunityCards)
    .set({
      gateState: next.gateState,
      reasonCodes: next.codes,
      updatedAt: new Date(),
    })
    .where(eq(opportunityCards.id, p.data.id));

  revalidatePath(`/funil/opportunities/${p.data.id}`);
  revalidatePath("/funil/opportunities");
  return { ok: true as const };
}
