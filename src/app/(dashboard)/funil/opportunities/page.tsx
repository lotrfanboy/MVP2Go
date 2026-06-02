import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { evidences, opportunityCards, opportunityEvidences } from "@/db/schema";
import {
  EmptyState,
  InsightNotice,
  PageHeader,
  ScoreBar,
  SourceBadge,
  StatusBadge,
  formatDateShort,
  gateMeta,
  numberFromDb,
} from "@/components/funil/funil-ui";

export const dynamic = "force-dynamic";

type Props = { searchParams?: Promise<{ gate?: string }> };

const FILTERS: Array<{ label: string; gate?: string }> = [
  { label: "Todas" },
  { label: "Candidatas", gate: "opportunity_candidate" },
  { label: "Qualificadas", gate: "qualified_opportunity" },
  { label: "Dor candidata", gate: "pain_candidate" },
  { label: "Trend only", gate: "trend_only" },
  { label: "Rejeitadas", gate: "rejected" },
];

export default async function OpportunitiesPage({ searchParams }: Props) {
  const sp = (await searchParams) ?? {};
  const gateFilter = sp.gate;
  const db = getDb();
  let rows: typeof opportunityCards.$inferSelect[] = [];
  let sourceMap = new Map<string, string[]>();
  let dbError = false;

  try {
    rows = gateFilter
      ? await db
          .select()
          .from(opportunityCards)
          .where(eq(opportunityCards.gateState, gateFilter))
          .orderBy(desc(opportunityCards.opportunityScore))
          .limit(120)
      : await db.select().from(opportunityCards).orderBy(desc(opportunityCards.opportunityScore)).limit(120);

    if (rows.length > 0) {
      const sourceRows = await db
        .select({
          opportunityId: opportunityEvidences.opportunityId,
          sourceKey: evidences.sourceKey,
        })
        .from(opportunityEvidences)
        .innerJoin(evidences, eq(opportunityEvidences.evidenceId, evidences.id))
        .where(inArray(opportunityEvidences.opportunityId, rows.map((row) => row.id)))
        .groupBy(opportunityEvidences.opportunityId, evidences.sourceKey);

      sourceMap = sourceRows.reduce((map, row) => {
        const current = map.get(row.opportunityId) ?? [];
        current.push(row.sourceKey);
        map.set(row.opportunityId, current);
        return map;
      }, new Map<string, string[]>());
    }
  } catch {
    dbError = true;
    rows = [];
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Centro do produto"
        title="Oportunidades"
        description="Cards gerados pelo motor a partir de evidencias e dores agrupadas. A lista mostra prioridade, gate, confianca de fonte e sinais de risco sem recalcular nada no frontend."
      />

      {dbError ? (
        <InsightNotice title="Oportunidades indisponiveis" tone="warning">
          Nao consegui consultar `opportunity_cards`. Tente atualizar depois que o banco estiver disponivel.
        </InsightNotice>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const active = filter.gate ? gateFilter === filter.gate : !gateFilter;
          return (
            <Link
              key={filter.label}
              href={filter.gate ? `/funil/opportunities?gate=${filter.gate}` : "/funil/opportunities"}
              className={[
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300",
                active
                  ? "border-violet-400/40 bg-violet-500/15 text-violet-100"
                  : "border-border/80 bg-card/60 text-muted-foreground hover:bg-muted/55 hover:text-foreground",
              ].join(" ")}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="Nenhuma oportunidade neste filtro"
          description="Quando o motor tiver evidencias suficientes, os cards aparecem aqui com gate, score e trilha de fontes."
          actionHref="/funil/radar"
          actionLabel="Voltar ao radar"
        />
      ) : (
        <section className="grid gap-4">
          {rows.map((row) => {
            const sources = sourceMap.get(row.id) ?? [];
            const lowSource =
              numberFromDb(row.sourceConfidence) <= 0.4 &&
              (row.gateState === "opportunity_candidate" || row.gateState === "qualified_opportunity");
            const rejected = row.gateState === "rejected" || row.blacklistTags.length > 0;
            const meta = gateMeta(row.gateState);

            return (
              <article key={row.id} className="rounded-lg border border-border/80 bg-card/80 p-4 shadow-[0_1px_0_hsl(0_0%_100%/0.03)]">
                <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge value={row.gateState} />
                      {lowSource ? (
                        <span className="rounded-full border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-100">
                          Baixa confianca de fonte
                        </span>
                      ) : null}
                      {rejected ? (
                        <span className="rounded-full border border-red-500/35 bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-100">
                          Bloqueio/rejeicao
                        </span>
                      ) : null}
                    </div>

                    <Link href={`/funil/opportunities/${row.id}`} className="mt-3 block text-lg font-semibold tracking-tight hover:text-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300">
                      {row.topicLabel}
                    </Link>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {row.painSummary || "Sem resumo de dor registrado para este card."}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      <span className="text-foreground">Publico:</span>{" "}
                      {row.audienceSummary || "publico ainda pouco claro"}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {sources.length > 0 ? sources.map((source) => <SourceBadge key={source} sourceKey={source} />) : null}
                      <span className="text-xs text-muted-foreground">{row.evidenceCount} evidencias</span>
                      <span className="text-xs text-muted-foreground">{row.sourceCount} fontes no card</span>
                      <span className="text-xs text-muted-foreground">Atualizado {formatDateShort(row.updatedAt)}</span>
                    </div>

                    <p className="mt-3 text-xs leading-5 text-muted-foreground">{meta.description}</p>
                  </div>

                  <div className="space-y-3 rounded-md border border-border/80 bg-background/35 p-3">
                    <ScoreBar label="Opportunity" value={row.opportunityScore} />
                    <ScoreBar label="Dor" value={row.painScore} />
                    <ScoreBar label="Trend" value={row.trendScore} />
                    <ScoreBar label="Source confidence" value={row.sourceConfidence} />
                    <ScoreBar label="Launchability" value={row.launchabilityScore} />
                  </div>
                </div>

                {(row.reasonCodes.length > 0 || row.blacklistTags.length > 0) && (
                  <div className="mt-4 rounded-md border border-border/80 bg-background/35 p-3 text-xs leading-5 text-muted-foreground">
                    {row.reasonCodes.length > 0 ? <div>Reason codes: {row.reasonCodes.join(", ")}</div> : null}
                    {row.blacklistTags.length > 0 ? <div>Blacklist tags: {row.blacklistTags.join(", ")}</div> : null}
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
