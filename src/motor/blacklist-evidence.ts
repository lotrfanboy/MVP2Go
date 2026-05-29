import { and, eq, inArray } from "drizzle-orm";
import type { DbClient } from "@/db";
import { blacklistTerms } from "@/db/schema";
import { computeBlacklistTags, type ActiveBlacklistTerm } from "@/pipeline/blacklist";

export async function listEvidenceBlacklistTerms(db: DbClient): Promise<ActiveBlacklistTerm[]> {
  const rows = await db
    .select({
      term: blacklistTerms.term,
      category: blacklistTerms.category,
      language: blacklistTerms.language,
      matchKind: blacklistTerms.matchKind,
    })
    .from(blacklistTerms)
    .where(
      and(eq(blacklistTerms.active, true), inArray(blacklistTerms.scope, ["raw_items", "all", "evidence"])),
    );

  return rows
    .filter((row) => row.matchKind === "keyword" || row.matchKind === "regex")
    .map((row) => ({
      term: row.term,
      category: row.category,
      language: row.language,
      matchKind: row.matchKind as "keyword" | "regex",
    }));
}

export function tagEvidenceText(text: string, language: string, terms: ActiveBlacklistTerm[]): string[] {
  return computeBlacklistTags(text, language, terms);
}
