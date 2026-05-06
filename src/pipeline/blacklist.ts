import { and, eq, inArray } from "drizzle-orm";
import type { DbClient } from "@/db";
import { blacklistTerms } from "@/db/schema";

export type ActiveBlacklistTerm = {
  term: string;
  category: string;
  language: string;
  matchKind: "keyword" | "regex";
};

export async function listActiveBlacklistTerms(db: DbClient): Promise<ActiveBlacklistTerm[]> {
  const rows = await db
    .select({
      term: blacklistTerms.term,
      category: blacklistTerms.category,
      language: blacklistTerms.language,
      matchKind: blacklistTerms.matchKind,
    })
    .from(blacklistTerms)
    .where(and(eq(blacklistTerms.active, true), inArray(blacklistTerms.scope, ["raw_items", "all"])));

  return rows
    .filter((row) => row.matchKind === "keyword" || row.matchKind === "regex")
    .map((row) => ({
      term: row.term,
      category: row.category,
      language: row.language,
      matchKind: row.matchKind as "keyword" | "regex",
    }));
}

export function computeBlacklistTags(
  text: string,
  itemLanguage: string,
  terms: ActiveBlacklistTerm[],
): string[] {
  const lower = text.toLowerCase();
  const tags = new Set<string>();

  for (const term of terms) {
    if (term.language !== "other" && term.language !== "all" && term.language !== itemLanguage) continue;

    if (term.matchKind === "keyword") {
      if (lower.includes(term.term.toLowerCase())) {
        tags.add(term.category);
      }
      continue;
    }

    try {
      const regex = new RegExp(term.term, "i");
      if (regex.test(text)) {
        tags.add(term.category);
      }
    } catch {
      // Ignore invalid regex from DB to keep collection resilient.
    }
  }

  return [...tags];
}
