import Link from "next/link";
import { count, desc, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { evidences, needClusters, opportunityCards, trendCandidates } from "@/db/schema";
import {
  EmptyState,
  InsightNotice,
  MetricCard,
  PageHeader,
  ScoreBar,
  SourceBadge,
  StatusBadge,
  formatDateShort,
  formatScore,
  gateMeta,
} from "@/components/funil/funil-ui";

export const dynamic = "force-dynamic";

type GateRow = { gateState: string; c: number };
type SourceRow = { sourceKey: string; c: number };
type LatestEvidenceRow = {
  id: string;
  sourceKey: string;
  evidenceType: string;
  topicLabel: string | null;
  topicKey: string | null;
  observedAt: Date;
};
type OpportunityRow = {
  id: string;
  topicLabel: string;
  opportunityScore: string;
  sourceConfidence: string;
  gateState: string;
  evidenceCount: number;
  sourceCount: number;
};

export default async function FunilRadarPage() {
  const db = getDb();
  let byGate: GateRow[] = [];
  let bySource: SourceRow[] = [];
  let latestEvidences: LatestEvidenceRow[] = [];
  let top: OpportunityRow[] = [];
  let totalEvidences = 0;
  let totalTrends = 0;
  let totalNeedClusters = 0;
  let totalOpportunities = 0;
  let lowConfidence = 0;
  let rejected = 0;
  let sourceConfidenceAboveSingleSource = 0;
  let dbError = false;

  try {
    const [[ec], [tc], [nc], [oc], [lc], [rj], [sc], gateRows, sourceRows, evidenceRows, topRows] =
      await Promise.all([
        db.select({ c: count() }).from(evidences),
        db.select({ c: count() }).from(trendCandidates),
        db.select({ c: count() }).from(needClusters),
        db.select({ c: count() }).from(opportunityCards),
        db
          .select({ c: count() })
          .from(opportunityCards)
          .where(sql`${opportunityCards.sourceConfidence} <= 0.4`),
        db
          .select({ c: count() })
          .from(opportunityCards)
          .where(sql`${opportunityCards.gateState} = 'rejected'`),
        db
          .select({ c: count() })
          .from(opportunityCards)
          .where(sql`${opportunityCards.sourceConfidence} > 0.4`),
        db
          .select({ gateState: opportunityCards.gateState, c: count() })
          .from(opportunityCards)
          .groupBy(opportunityCards.gateState),
        db
          .select({ sourceKey: evidences.sourceKey, c: count() })
          .from(evidences)
          .groupBy(evidences.sourceKey)
          .orderBy(sql`count(*) DESC`),
        db
          .select({
            id: evidences.id,
            sourceKey: evidences.sourceKey,
            evidenceType: evidences.evidenceType,
            topicLabel: evidences.topicLabel,
            topicKey: evidences.topicKey,
            observedAt: evidences.observedAt,
          })
          .from(evidences)
          .orderBy(desc(evidences.observedAt))
          .limit(6),
        db
          .select({
            id: opportunityCards.id,
            topicLabel: opportunityCards.topicLabel,
            opportunityScore: opportunityCards.opportunityScore,
            sourceConfidence: opportunityCards.sourceConfidence,
            gateState: opportunityCards.gateState,
            evidenceCount: opportunityCards.evidenceCount,
            sourceCount: opportunityCards.sourceCount,
          })
          .from(opportunityCards)
          .orderBy(desc(opportunityCards.opportunityScore))
          .limit(6),
      ]);

    totalEvidences = Number(ec?.c ?? 0);
    totalTrends = Number(tc?.c ?? 0);
    totalNeedClusters = Number(nc?.c ?? 0);
    totalOpportunities = Number(oc?.c ?? 0);
    lowConfidence = Number(lc?.c ?? 0);
    rejected = Number(rj?.c ?? 0);
    sourceConfidenceAboveSingleSource = Number(sc?.c ?? 0);
    byGate = gateRows;
    bySource = sourceRows;
    latestEvidences = evidenceRows;
    top = topRows;
  } catch {
    dbError = true;
  }

  const hasGTrends = bySource.some((row) => row.sourceKey === "gtrends");
  const noOverlapYet = hasGTrends && sourceConfidenceAboveSingleSource === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Motor de oportunidades"
        title="Radar"
        description="Resumo operacional do que o motor encontrou: evidencias, tendencias, dores agrupadas e oportunidades. Esta tela nao organiza o produto por fonte; fontes aparecem aqui apenas como rastreabilidade."
      />

      <InsightNotice title="Como ler o funil" tone="info">
        O fluxo atual e evidence-first: raw items viram signals legados, signals elegiveis e fontes futuras viram
        evidences, evidences formam dores agrupadas, e o motor gera opportunity cards. Score nao e validacao de
        mercado; manual e watch sao seeds internas, e confianca externa so sobe com fontes externas no mesmo tema.
      </InsightNotice>

      {dbError ? (
        <InsightNotice title="Dados indisponiveis" tone="warning">
          Nao consegui carregar todos os dados agora. A UI continua de pe, mas os numeros abaixo podem estar vazios.
        </InsightNotice>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Evidencias" value={totalEvidences} helper="Unidades atomicas que alimentam o motor." href="/funil/source-confidence" />
        <MetricCard label="Tendencias" value={totalTrends} helper="Momentum por topic_key e janela." href="/funil/trends" />
        <MetricCard label="Dores agrupadas" value={totalNeedClusters} helper="Clusters de dor/necessidade." href="/funil/need-clusters" />
        <MetricCard label="Oportunidades" value={totalOpportunities} helper="Cards avaliados pelo motor." href="/funil/opportunities" />
        <MetricCard label="Baixa confianca" value={lowConfidence} helper="Source confidence no patamar HN-only ou sem overlap." />
      </section>

      {noOverlapYet ? (
        <InsightNotice title="Google Trends existe, mas ainda nao cruzou com HN" tone="warning">
          O adapter `gtrends` ja produz `search_momentum`, mas os dados atuais nao compartilham `topic_key`
          com as dores HN/need clusters. Portanto o motor nao deve inflar source confidence.
        </InsightNotice>
      ) : lowConfidence > 0 ? (
        <InsightNotice title="Confianca ainda limitada" tone="info">
          Oportunidades com uma unica fonte externa ficam limitadas. Isso e esperado ate haver overlap real
          entre fontes externas no mesmo tema.
        </InsightNotice>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1fr_1.15fr]">
        <article className="rounded-lg border border-border/80 bg-card/80 p-4 shadow-[0_1px_0_hsl(0_0%_100%/0.03)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Estado por gate</h2>
              <p className="mt-1 text-xs text-muted-foreground">O gate diz onde cada oportunidade esta no funil.</p>
            </div>
            {rejected > 0 ? <StatusBadge value="rejected" /> : null}
          </div>
          {byGate.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title="Sem oportunidades ainda"
                description="Rode build-evidence e score-opportunities depois que houver evidencias suficientes."
              />
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {byGate.map((row) => {
                const meta = gateMeta(row.gateState);
                return (
                  <div key={row.gateState} className="rounded-md border border-border/80 bg-background/35 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <StatusBadge value={row.gateState} />
                      <span className="font-mono text-sm">{row.c}</span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">{meta.description}</p>
                  </div>
                );
              })}
            </div>
          )}
        </article>

        <article className="rounded-lg border border-border/80 bg-card/80 p-4 shadow-[0_1px_0_hsl(0_0%_100%/0.03)]">
          <h2 className="text-sm font-semibold">Cobertura de fontes</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Manual/watch sao sementes internas. So fontes externas contam para uplift de source confidence.
          </p>
          {bySource.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="Sem fontes com evidencias" description="A camada evidences ainda esta vazia." />
            </div>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {bySource.map((row) => (
                <div key={row.sourceKey} className="rounded-md border border-border/80 bg-background/35 p-3">
                  <div className="flex items-center justify-between">
                    <SourceBadge sourceKey={row.sourceKey} />
                    <span className="font-mono text-sm">{row.c}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-lg border border-border/80 bg-card/80 p-4 shadow-[0_1px_0_hsl(0_0%_100%/0.03)]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Proximas oportunidades para inspecionar</h2>
            <Link href="/funil/opportunities" className="rounded-sm text-xs font-medium text-violet-200 hover:text-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300">
              Ver todas
            </Link>
          </div>
          {top.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="Nenhuma oportunidade criada" description="O motor ainda nao gerou cards de oportunidade." />
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {top.map((o) => (
                <Link
                  key={o.id}
                  href={`/funil/opportunities/${o.id}`}
                  className="block rounded-md border border-border/80 bg-background/35 p-3 transition-colors hover:border-violet-400/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{o.topicLabel}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <StatusBadge value={o.gateState} />
                        <span className="text-xs text-muted-foreground">{o.evidenceCount} evidencias</span>
                        <span className="text-xs text-muted-foreground">{o.sourceCount} fontes</span>
                      </div>
                    </div>
                    <div className="font-mono text-sm">{formatScore(o.opportunityScore)}</div>
                  </div>
                  <div className="mt-3">
                    <ScoreBar label="Source confidence" value={o.sourceConfidence} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </article>

        <article className="rounded-lg border border-border/80 bg-card/80 p-4 shadow-[0_1px_0_hsl(0_0%_100%/0.03)]">
          <h2 className="text-sm font-semibold">Evidencias recentes</h2>
          <p className="mt-1 text-xs text-muted-foreground">O rastro cru que explica de onde o motor esta partindo.</p>
          {latestEvidences.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="Sem evidencias recentes" description="Nenhuma evidence foi encontrada na camada source-agnostic." />
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {latestEvidences.map((evidence) => (
                <div key={evidence.id} className="flex items-center justify-between gap-3 rounded-md border border-border/80 bg-background/35 p-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <SourceBadge sourceKey={evidence.sourceKey} />
                      <span className="text-xs text-muted-foreground">{evidence.evidenceType}</span>
                    </div>
                    <div className="mt-2 truncate text-sm">{evidence.topicLabel ?? evidence.topicKey ?? "Topico sem rotulo"}</div>
                  </div>
                  <span className="flex-shrink-0 text-xs text-muted-foreground">{formatDateShort(evidence.observedAt)}</span>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
