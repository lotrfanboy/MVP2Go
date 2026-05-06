import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { runs } from "@/db/schema";

export default async function RunsPage() {
  const db = getDb();
  const rows = await db
    .select({
      id: runs.id,
      kind: runs.kind,
      status: runs.status,
      startedAt: runs.startedAt,
      finishedAt: runs.finishedAt,
      itemsIn: runs.itemsIn,
      itemsOut: runs.itemsOut,
      costUsd: runs.costUsd,
      triggeredBy: runs.triggeredBy,
    })
    .from(runs)
    .orderBy(desc(runs.startedAt))
    .limit(50);

  return (
    <main className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Execuções (Runs)</h1>
        <p className="text-sm text-muted-foreground">Histórico das execuções do pipeline.</p>
      </header>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left">
            <tr>
              <th className="p-3">Kind</th>
              <th className="p-3">Status</th>
              <th className="p-3">Início</th>
              <th className="p-3">Fim</th>
              <th className="p-3">In / Out</th>
              <th className="p-3">Custo</th>
              <th className="p-3">Trigger</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="p-4 text-muted-foreground" colSpan={7}>
                  Sem execuções registradas.
                </td>
              </tr>
            ) : (
              rows.map((run) => (
                <tr key={run.id} className="border-t">
                  <td className="p-3">{run.kind}</td>
                  <td className="p-3">{run.status}</td>
                  <td className="p-3">{new Date(run.startedAt).toLocaleString("pt-BR")}</td>
                  <td className="p-3">
                    {run.finishedAt ? new Date(run.finishedAt).toLocaleString("pt-BR") : "-"}
                  </td>
                  <td className="p-3">
                    {run.itemsIn} / {run.itemsOut}
                  </td>
                  <td className="p-3 font-mono">{Number(run.costUsd).toFixed(4)}</td>
                  <td className="p-3">{run.triggeredBy}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
