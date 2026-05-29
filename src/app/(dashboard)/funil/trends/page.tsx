import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { trendCandidates } from "@/db/schema";

export default async function FunilTrendsPage() {
  const db = getDb();
  let rows: typeof trendCandidates.$inferSelect[] = [];
  try {
    rows = await db.select().from(trendCandidates).orderBy(desc(trendCandidates.computedAt)).limit(80);
  } catch {
    rows = [];
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Tendências</h1>
      <p className="text-sm text-muted-foreground">
        Tabela trend_candidates por janela (24h/7d/14d/30d). Valores derivados de evidências.
      </p>
      <div className="rounded-lg border border-border">
        <table className="w-full border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-3 py-2 font-medium">topic_key</th>
              <th className="px-3 py-2 font-medium">Janela</th>
              <th className="px-3 py-2 font-medium">trend_score</th>
              <th className="px-3 py-2 font-medium">Mercado</th>
              <th className="px-3 py-2 font-medium">N</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                  Sem candidatos de tendência. Rode build-evidence após coletar sinais.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-border/60">
                  <td className="px-3 py-2 font-mono text-[12px]">{r.topicKey}</td>
                  <td className="px-3 py-2">{r.windowKind}</td>
                  <td className="px-3 py-2 tabular-nums">{r.trendScore}</td>
                  <td className="px-3 py-2">{r.market}</td>
                  <td className="px-3 py-2">{r.evidenceCount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
