import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { needClusters } from "@/db/schema";

export default async function NeedClustersPage() {
  const db = getDb();
  let rows: typeof needClusters.$inferSelect[] = [];
  try {
    rows = await db.select().from(needClusters).orderBy(desc(needClusters.updatedAt)).limit(60);
  } catch {
    rows = [];
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Need clusters</h1>
      <p className="text-sm text-muted-foreground">
        Agrupamentos por dor/necessidade (não confundir com clusters F2 de `signals`).
      </p>
      <div className="rounded-lg border border-border">
        <table className="w-full border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-3 py-2 font-medium">Rótulo</th>
              <th className="px-3 py-2 font-medium">pain_summary</th>
              <th className="px-3 py-2 font-medium">N evidências</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-3 py-6 text-center text-muted-foreground">
                  Sem clusters de necessidade. Rode build-evidence.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-border/60">
                  <td className="px-3 py-2">{r.label ?? r.topicKey}</td>
                  <td className="max-w-lg px-3 py-2 text-muted-foreground">{(r.painSummary ?? "").slice(0, 180)}</td>
                  <td className="px-3 py-2 tabular-nums">{r.evidenceCount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
