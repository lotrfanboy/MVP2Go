import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { opportunityCards } from "@/db/schema";

export default async function SourceConfidencePage() {
  const db = getDb();
  let rows: typeof opportunityCards.$inferSelect[] = [];
  try {
    rows = await db.select().from(opportunityCards).orderBy(desc(opportunityCards.opportunityScore)).limit(80);
  } catch {
    rows = [];
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Fonte & confiança</h1>
      <p className="text-sm text-muted-foreground">
        `source_confidence` deriva de fontes externas distintas (manual/watch não elevam contagem — ver F4).
      </p>
      <div className="rounded-lg border border-border">
        <table className="w-full border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-3 py-2 font-medium">Oportunidade</th>
              <th className="px-3 py-2 font-medium">source_confidence</th>
              <th className="px-3 py-2 font-medium">Fontes (#)</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-3 py-6 text-center text-muted-foreground">
                  Sem dados.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-border/60">
                  <td className="px-3 py-2">
                    <a className="text-primary hover:underline" href={`/funil/opportunities/${r.id}`}>
                      {r.topicLabel}
                    </a>
                  </td>
                  <td className="px-3 py-2 tabular-nums">{r.sourceConfidence}</td>
                  <td className="px-3 py-2 tabular-nums">{r.sourceCount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
