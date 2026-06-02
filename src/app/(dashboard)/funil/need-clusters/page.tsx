import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { needClusters } from "@/db/schema";
import { EmptyState, InsightNotice, PageHeader, formatDateShort, formatScore } from "@/components/funil/funil-ui";

export const dynamic = "force-dynamic";

export default async function NeedClustersPage() {
  const db = getDb();
  let rows: typeof needClusters.$inferSelect[] = [];
  let dbError = false;
  try {
    rows = await db.select().from(needClusters).orderBy(desc(needClusters.updatedAt)).limit(60);
  } catch {
    dbError = true;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Necessidade"
        title="Dores agrupadas"
        description="Agrupam evidencias em torno de uma necessidade. Nao sao os clusters legados de signals; sao a ponte entre evidence e oportunidade."
      />

      <InsightNotice title="O que observar" tone="info">
        Procure dor clara, publico reconhecivel e coerencia. Um cluster pode ser promissor mesmo antes de virar opportunity card forte.
      </InsightNotice>

      {dbError ? (
        <InsightNotice title="Dores indisponiveis" tone="warning">
          Nao consegui consultar `need_clusters` agora.
        </InsightNotice>
      ) : null}

      {rows.length === 0 ? (
        <EmptyState
          title="Sem dores agrupadas"
          description="O motor ainda nao encontrou evidencias com dor suficiente para formar um need cluster."
        />
      ) : (
        <div className="grid gap-4">
          {rows.map((row) => (
            <article key={row.id} className="rounded-lg border border-border/80 bg-card/80 p-4 shadow-[0_1px_0_hsl(0_0%_100%/0.03)]">
              <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
                <div>
                  <h2 className="text-base font-semibold">{row.label ?? row.topicKey ?? "Dor sem rotulo"}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {row.painSummary || row.summary || "Sem resumo de dor registrado."}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    <span className="text-foreground">Publico:</span>{" "}
                    {row.audienceSummary || "publico ainda pouco claro"}
                  </p>
                  {row.topicTags.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {row.topicTags.map((tag) => (
                        <span key={tag} className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="rounded-md border border-border bg-background/35 p-3 text-sm text-muted-foreground">
                  <div>Evidencias: <span className="font-mono text-foreground">{row.evidenceCount}</span></div>
                  <div>Coerencia: <span className="font-mono text-foreground">{formatScore(row.coherenceScore)}</span></div>
                  <div>Status: <span className="font-mono text-foreground">{row.status}</span></div>
                  <div>Atualizado {formatDateShort(row.updatedAt)}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
