"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { blacklistTerms } from "@/db/schema";

const createBlacklistSchema = z.object({
  term: z.string().min(2).max(120),
  category: z.string().min(2).max(80),
  scope: z.enum(["all", "signal", "idea"]),
  language: z.enum(["all", "pt", "en"]),
  matchKind: z.enum(["keyword", "regex"]),
});

const toggleBlacklistSchema = z.object({
  blacklistId: z.string().uuid(),
  active: z.boolean(),
});

export async function createBlacklistTermAction(formData: FormData) {
  const parsed = createBlacklistSchema.safeParse({
    term: String(formData.get("term") ?? "").trim(),
    category: String(formData.get("category") ?? "").trim(),
    scope: String(formData.get("scope") ?? ""),
    language: String(formData.get("language") ?? ""),
    matchKind: String(formData.get("matchKind") ?? ""),
  });

  if (!parsed.success) return;

  const db = getDb();
  await db.insert(blacklistTerms).values({
    term: parsed.data.term,
    category: parsed.data.category,
    scope: parsed.data.scope,
    language: parsed.data.language,
    matchKind: parsed.data.matchKind,
    active: true,
  });

  revalidatePath("/blacklist");
}

export async function toggleBlacklistTermAction(formData: FormData) {
  const parsed = toggleBlacklistSchema.safeParse({
    blacklistId: String(formData.get("blacklistId") ?? ""),
    active: String(formData.get("active") ?? "") === "true",
  });

  if (!parsed.success) return;

  const db = getDb();
  await db
    .update(blacklistTerms)
    .set({ active: !parsed.data.active })
    .where(eq(blacklistTerms.id, parsed.data.blacklistId));

  revalidatePath("/blacklist");
}
