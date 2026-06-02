import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { trendCandidates } from "@/db/schema";
import { EmptyState, InsightNotice, PageHeader, ScoreBar, formatDateShort } from "@/components/funil/funil-ui";

export const dynamic = "force-dynamic";

export default async function FunilTrendsPage() {
  const db = getDb();
  let rows: typeof trendCandidates.$inferSelect[] = [];
  let dbError = false;
  try {
    rows = await db.select().from(trendCandidates).orderBy(desc(trendCandidates.computedAt)).limit(80);
  } catch {
    dbError = true;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Movimento"
        title="Tendencias"
        description="Mostram movimento por tema. Nao provam dor nem oportunidade sozinhas; servem para priorizar investigacao quando cruzam com evidencias melhores."
      />

      {dbError ? (
        <InsightNotice title="Tendencias indisponiveis" tone="warning">
          Nao consegui consultar `trend_candidates` agora.
        </InsightNotice>
      ) : null}

      <InsightNotice title="O que observar" tone="info">
        Compare score, janela e persistencia. Se nao houver dor ou publico claro, trate como movimento, nao como oportunidade.
      </InsightNotice>

      {rows.length === 0 ? (
        <EmptyState
          title="Sem tendencias calculadas"
          description="Rode build-evidence depois de coletar sinais. O motor cria janelas 24h/7d/14d/30d quando ha evidencias suficientes."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((row) => (
            <article key={row.id} className="rounded-lg border border-border/80 bg-card/80 p-4 shadow-[0_1px_0_hsl(0_0%_100%/0.03)]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold">{row.topicLabel}</h2>
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground">{row.topicKey}</p>
                </div>
                <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {row.windowKind}
                </span>
              </div>
              <div className="mt-4 space-y-3">
                <ScoreBar label="Trend score" value={row.trendScore} />
                <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <div>Recencia: <span className="font-mono text-foreground">{row.recency}</span></div>
                  <div>Frequencia: <span className="font-mono text-foreground">{row.frequency}</span></div>
                  <div>Aceleracao: <span className="font-mono text-foreground">{row.acceleration}</span></div>
                  <div>Persistencia: <span className="font-mono text-foreground">{row.persistence}</span></div>
                  <div>Diversidade: <span className="font-mono text-foreground">{row.sourceDiversity}</span></div>
                  <div>Evidencias: <span className="font-mono text-foreground">{row.evidenceCount}</span></div>
                </div>
                <p className="text-xs text-muted-foreground">Calculado {formatDateShort(row.computedAt)}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
