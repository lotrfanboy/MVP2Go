import Link from "next/link";
import { count, desc, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { evidences, opportunityCards } from "@/db/schema";
import {
  EvidenceTraceList,
  InsightNotice,
  MetricCard,
  PageHeader,
  SourceBadge,
  StatusBadge,
  formatScore,
  numberFromDb,
  sourceMeta,
  type EvidenceTraceItem,
} from "@/components/funil/funil-ui";

export const dynamic = "force-dynamic";

type OpportunityRow = {
  id: string;
  topicLabel: string;
  sourceConfidence: string;
  sourceCount: number;
  gateState: string;
};
type SourceRow = { sourceKey: string; c: number };

export default async function SourceConfidencePage() {
  const db = getDb();
  let opportunities: OpportunityRow[] = [];
  let recentEvidences: EvidenceTraceItem[] = [];
  let sources: SourceRow[] = [];
  let totalEvidences = 0;
  let externalEvidenceCount = 0;
  let seedEvidenceCount = 0;
  let sourceConfidenceAboveSingleSource = 0;
  let dbError = false;

  try {
    const [[te], [external], [seed], [overlap], opportunityRows, sourceRows, evidenceRows] = await Promise.all([
      db.select({ c: count() }).from(evidences),
      db
        .select({ c: count() })
        .from(evidences)
        .where(sql`${evidences.sourceKey} not in ('manual', 'watch')`),
      db
        .select({ c: count() })
        .from(evidences)
        .where(sql`${evidences.sourceKey} in ('manual', 'watch')`),
      db
        .select({ c: count() })
        .from(opportunityCards)
        .where(sql`${opportunityCards.sourceConfidence} > 0.4`),
      db
        .select({
          id: opportunityCards.id,
          topicLabel: opportunityCards.topicLabel,
          sourceConfidence: opportunityCards.sourceConfidence,
          sourceCount: opportunityCards.sourceCount,
          gateState: opportunityCards.gateState,
        })
        .from(opportunityCards)
        .orderBy(desc(opportunityCards.opportunityScore))
        .limit(80),
      db
        .select({ sourceKey: evidences.sourceKey, c: count() })
        .from(evidences)
        .groupBy(evidences.sourceKey)
        .orderBy(sql`count(*) DESC`),
      db
        .select({
          id: evidences.id,
          sourceKey: evidences.sourceKey,
          sourceRef: evidences.sourceRef,
          evidenceType: evidences.evidenceType,
          topicKey: evidences.topicKey,
          topicLabel: evidences.topicLabel,
          observedAt: evidences.observedAt,
          summary: evidences.summary,
          painText: evidences.painText,
          audienceHint: evidences.audienceHint,
          quoteExcerpt: evidences.quoteExcerpt,
          strength: evidences.strength,
          confidence: evidences.confidence,
          metricsJson: evidences.metricsJson,
          metadataJson: evidences.metadataJson,
          blacklistTags: evidences.blacklistTags,
          manualInputId: evidences.manualInputId,
          watchTopicId: evidences.watchTopicId,
        })
        .from(evidences)
        .orderBy(desc(evidences.observedAt))
        .limit(60),
    ]);

    totalEvidences = Number(te?.c ?? 0);
    externalEvidenceCount = Number(external?.c ?? 0);
    seedEvidenceCount = Number(seed?.c ?? 0);
    sourceConfidenceAboveSingleSource = Number(overlap?.c ?? 0);
    opportunities = opportunityRows;
    sources = sourceRows;
    recentEvidences = evidenceRows;
  } catch {
    dbError = true;
  }

  const hasTrends = sources.some((source) => source.sourceKey === "gtrends");
  const noOverlapYet = hasTrends && sourceConfidenceAboveSingleSource === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Auditabilidade"
        title="Evidencias e confianca das fontes"
        description="Sinais individuais que alimentam o motor. Podem vir de HN, Google Trends, manual/watch e futuras fontes; seeds internas nao validam mercado sozinhas."
      />

      {dbError ? (
        <InsightNotice title="Dados indisponiveis" tone="warning">
          Nao consegui carregar a auditoria de evidencias. A pagina continua funcional, mas sem dados.
        </InsightNotice>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total de evidencias" value={totalEvidences} helper="Tudo que alimenta o motor." />
        <MetricCard label="Fontes externas" value={externalEvidenceCount} helper="HN, GT e futuras fontes F5." />
        <MetricCard label="Seeds internas" value={seedEvidenceCount} helper="Manual/watch; nao validam mercado sozinhos." />
        <MetricCard label="Com uplift" value={sourceConfidenceAboveSingleSource} helper="Cards acima do patamar single-source." />
      </section>

      {noOverlapYet ? (
        <InsightNotice title="Sem overlap GT + HN nos dados atuais" tone="warning">
          Google Trends esta presente como `search_momentum`, mas ainda nao cruzou com HN/need clusters no mesmo
          `topic_key`. A UI mostra essa ausencia em vez de inflar confianca artificialmente.
        </InsightNotice>
      ) : (
        <InsightNotice title="O que observar" tone="info">
          Procure diversidade de fontes externas, clareza de dor/publico e ausencia de bloqueios. Metadados tecnicos ficam recolhidos nos cards.
        </InsightNotice>
      )}

      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <article className="rounded-lg border border-border/80 bg-card/80 p-4 shadow-[0_1px_0_hsl(0_0%_100%/0.03)]">
          <h2 className="text-sm font-semibold">Fontes observadas</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Fontes externas podem elevar confianca quando aparecem no mesmo tema. Seeds internas apenas orientam a investigacao.
          </p>
          <div className="mt-4 space-y-3">
            {sources.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma evidence ainda.</p>
            ) : (
              sources.map((source) => {
                const meta = sourceMeta(source.sourceKey);
                return (
                  <div key={source.sourceKey} className="rounded-md border border-border/80 bg-background/35 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <SourceBadge sourceKey={source.sourceKey} />
                      <span className="font-mono text-sm">{source.c}</span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">{meta.description}</p>
                  </div>
                );
              })
            )}
          </div>
        </article>

        <article className="rounded-lg border border-border/80 bg-card/80 p-4 shadow-[0_1px_0_hsl(0_0%_100%/0.03)]">
          <h2 className="text-sm font-semibold">Oportunidades por confianca</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            O numero e saida do motor. Esta tabela so ajuda a localizar cards que precisam de auditoria.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Oportunidade</th>
                  <th className="px-3 py-2 font-medium">Gate</th>
                  <th className="px-3 py-2 font-medium">Confianca</th>
                  <th className="px-3 py-2 font-medium">Fontes</th>
                </tr>
              </thead>
              <tbody>
                {opportunities.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                      Sem oportunidades.
                    </td>
                  </tr>
                ) : (
                  opportunities.map((row) => (
                    <tr key={row.id} className="border-b border-border/60">
                      <td className="px-3 py-2">
                          <Link className="rounded-sm text-violet-200 hover:text-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300" href={`/funil/opportunities/${row.id}`}>
                          {row.topicLabel}
                        </Link>
                      </td>
                      <td className="px-3 py-2">
                        <StatusBadge value={row.gateState} />
                      </td>
                      <td className="px-3 py-2 font-mono">{formatScore(row.sourceConfidence)}</td>
                      <td className="px-3 py-2 font-mono">
                        {row.sourceCount}
                        {numberFromDb(row.sourceConfidence) <= 0.4 ? (
                          <span className="ml-2 text-xs text-amber-100">baixo</span>
                        ) : null}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold">Trace generico de evidencias recentes</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Cards recentes com resumo primeiro. Abra detalhes tecnicos apenas quando precisar auditar ids, metricas e metadados.
          </p>
        </div>
        <EvidenceTraceList items={recentEvidences} showJson />
      </section>
    </div>
  );
}
