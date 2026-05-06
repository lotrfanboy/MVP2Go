import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { blacklistTerms, ideas } from "@/db/schema";
import { computeBlacklistTags, type ActiveBlacklistTerm } from "@/pipeline/blacklist";

export async function reapplyIdeasBlacklist(): Promise<{ processed: number }> {
  const db = getDb();
  const termRows = await db
    .select({
      term: blacklistTerms.term,
      category: blacklistTerms.category,
      language: blacklistTerms.language,
      matchKind: blacklistTerms.matchKind,
    })
    .from(blacklistTerms)
    .where(eq(blacklistTerms.active, true));

  const activeTerms: ActiveBlacklistTerm[] = termRows
    .filter((t) => t.matchKind === "keyword" || t.matchKind === "regex")
    .map((t) => ({
      term: t.term,
      category: t.category,
      language: t.language,
      matchKind: t.matchKind as "keyword" | "regex",
    }));

  const rows = await db
    .select({
      id: ideas.id,
      language: ideas.language,
      text: sql<string>`concat_ws(' ', ${ideas.name}, ${ideas.pain}, ${ideas.promise})`,
    })
    .from(ideas);

  for (const row of rows) {
    const tags = computeBlacklistTags(row.text, row.language, activeTerms);
    await db.update(ideas).set({ blacklistTags: tags, updatedAt: new Date() }).where(eq(ideas.id, row.id));
  }

  return { processed: rows.length };
}
