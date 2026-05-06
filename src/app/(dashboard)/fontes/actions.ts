"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { sources } from "@/db/schema";

const createSourceSchema = z.object({
  name: z.string().min(2).max(120),
  kind: z.enum(["algolia-hn", "product-hunt", "rss", "apple-rss", "stack-exchange", "manual"]),
});

const toggleSourceSchema = z.object({
  sourceId: z.string().uuid(),
  active: z.boolean(),
});

export async function createSourceAction(formData: FormData) {
  const parsed = createSourceSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    kind: String(formData.get("kind") ?? ""),
  });

  if (!parsed.success) return;

  const db = getDb();
  await db.insert(sources).values({
    name: parsed.data.name,
    kind: parsed.data.kind,
    configJson: {},
    active: true,
  });

  revalidatePath("/fontes");
}

export async function toggleSourceAction(formData: FormData) {
  const parsed = toggleSourceSchema.safeParse({
    sourceId: String(formData.get("sourceId") ?? ""),
    active: String(formData.get("active") ?? "") === "true",
  });

  if (!parsed.success) return;

  const db = getDb();
  await db
    .update(sources)
    .set({ active: !parsed.data.active })
    .where(eq(sources.id, parsed.data.sourceId));

  revalidatePath("/fontes");
}
