import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { clusters } from "@/db/schema";

export default async function ClustersPage() {
  const db = getDb();
  const rows = await db
    .select({
      id: clusters.id,
      label: clusters.label,
      summary: clusters.summary,
      coherenceScore: clusters.coherenceScore,
      status: clusters.status,
      createdAt: clusters.createdAt,
    })
    .from(clusters)
    .orderBy(desc(clusters.createdAt))
    .limit(50);

  return (
    <main className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Clusters</h1>
        <p className="text-sm text-muted-foreground">Agrupamentos de sinais e ideias relacionados.</p>
      </header>
      <div className="grid gap-3 md:grid-cols-2">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum agrupamento de ideias ativo.</p>
        ) : (
          rows.map((cluster) => (
            <article key={cluster.id} className="rounded-xl border bg-card p-4">
              <h2 className="font-medium">{cluster.label ?? "Cluster sem rótulo"}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{cluster.summary ?? "Sem resumo ainda."}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>{cluster.status}</span>
                <span>Coerência {Number(cluster.coherenceScore ?? 0).toFixed(2)}</span>
              </div>
            </article>
          ))
        )}
      </div>
    </main>
  );
}
