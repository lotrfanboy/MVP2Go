"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { watchTopics } from "@/db/schema";
import { toTopicKey } from "@/lib/topic-key";
import { recordWatchTopicEvidence } from "@/sources/watch/normalizer";

const CreateSchema = z.object({
  topic_label: z.string().min(2).max(200),
  language: z.string().default("all"),
  market: z.string().default("global"),
  notes: z.string().max(2000).optional(),
});

export async function createWatchTopic(formData: FormData): Promise<void> {
  const parsed = CreateSchema.safeParse({
    topic_label: formData.get("topic_label"),
    language: formData.get("language") ?? "all",
    market: formData.get("market") ?? "global",
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) {
    return;
  }
  const topicKey = toTopicKey(parsed.data.topic_label);
  const db = getDb();
  const [row] = await db
    .insert(watchTopics)
    .values({
      topicKey,
      topicLabel: parsed.data.topic_label,
      language: parsed.data.language,
      market: parsed.data.market,
      notes: parsed.data.notes || null,
      status: "active",
    })
    .returning({ id: watchTopics.id });
  if (row?.id) {
    await recordWatchTopicEvidence(row.id);
  }
  revalidatePath("/funil/watch-topics");
}

export async function archiveWatchTopic(id: string) {
  const db = getDb();
  await db.update(watchTopics).set({ status: "archived", updatedAt: new Date() }).where(eq(watchTopics.id, id));
  revalidatePath("/funil/watch-topics");
}
