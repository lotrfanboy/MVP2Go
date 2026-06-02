import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { evidences, opportunityCards, opportunityEvidences } from "@/db/schema";
import {
  EvidenceTraceList,
  InsightNotice,
  JsonPreview,
  PageHeader,
  ScoreBar,
  StatusBadge,
  formatDateShort,
  gateMeta,
  numberFromDb,
  type EvidenceTraceItem,
} from "@/components/funil/funil-ui";
import { GateForm } from "./gate-form";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function OpportunityDetailPage({ params }: Props) {
  const { id } = await params;
  const db = getDb();

  const [oc] = await db.select().from(opportunityCards).where(eq(opportunityCards.id, id)).limit(1);
  if (!oc) notFound();

  const traceRows = await db
    .select({
      ev: evidences,
    })
    .from(opportunityEvidences)
    .innerJoin(evidences, eq(opportunityEvidences.evidenceId, evidences.id))
    .where(eq(opportunityEvidences.opportunityId, id));

  const trace: EvidenceTraceItem[] = traceRows.map(({ ev }) => ({
    id: ev.id,
    sourceKey: ev.sourceKey,
    sourceRef: ev.sourceRef,
    evidenceType: ev.evidenceType,
    topicKey: ev.topicKey,
    topicLabel: ev.topicLabel,
    observedAt: ev.observedAt,
    summary: ev.summary,
    painText: ev.painText,
    audienceHint: ev.audienceHint,
    quoteExcerpt: ev.quoteExcerpt,
    strength: ev.strength,
    confidence: ev.confidence,
    metricsJson: ev.metricsJson,
    metadataJson: ev.metadataJson,
    blacklistTags: ev.blacklistTags,
    manualInputId: ev.manualInputId,
    watchTopicId: ev.watchTopicId,
  }));

  const status = gateMeta(oc.gateState);
  const lowSource = numberFromDb(oc.sourceConfidence) <= 0.4;
  const rejected = oc.gateState === "rejected" || oc.blacklistTags.length > 0;
  const hasOverlap = numberFromDb(oc.sourceConfidence) > 0.4;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Detalhe da oportunidade"
        title={oc.topicLabel}
        description="Esta tela explica por que o motor promoveu, segurou ou rejeitou o card. O frontend apenas apresenta a saida do motor; nao recalcula score nem gate."
      />

      <section className="rounded-lg border border-border/80 bg-card/80 p-5 shadow-[0_1px_0_hsl(0_0%_100%/0.03)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge value={oc.gateState} />
              {lowSource ? (
                <span className="rounded-full border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-100">
                  Baixa confianca de fonte
                </span>
              ) : null}
              {rejected ? (
                <span className="rounded-full border border-red-500/35 bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-100">
                  Rejeitada ou bloqueada
                </span>
              ) : null}
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">{status.description}</p>
            <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
              <div className="rounded-md border border-border/80 bg-background/35 p-3">
                <div className="text-xs font-medium uppercase text-muted-foreground">Dor detectada</div>
                <p className="mt-2 leading-6">{oc.painSummary || "Sem resumo de dor suficiente."}</p>
              </div>
              <div className="rounded-md border border-border/80 bg-background/35 p-3">
                <div className="text-xs font-medium uppercase text-muted-foreground">Publico sugerido</div>
                <p className="mt-2 leading-6">{oc.audienceSummary || "Publico ainda pouco claro."}</p>
              </div>
            </div>
          </div>

          <div className="grid min-w-[220px] gap-2 text-sm">
            <div className="rounded-md border border-border/80 bg-background/35 p-3">
              <div className="text-xs uppercase text-muted-foreground">Opportunity score</div>
              <div className="mt-1 font-mono text-3xl font-semibold">{Number(oc.opportunityScore).toFixed(2)}</div>
            </div>
            <div className="rounded-md border border-border/80 bg-background/35 p-3 text-xs text-muted-foreground">
              <div>{oc.evidenceCount} evidencias</div>
              <div>{oc.sourceCount} fontes no card</div>
              <div>Atualizado {formatDateShort(oc.updatedAt)}</div>
            </div>
          </div>
        </div>
      </section>

      {lowSource ? (
        <InsightNotice title="Por que a confianca esta baixa?" tone="warning">
          O motor limita source confidence quando ha apenas uma fonte externa ou quando manual/watch sao apenas
          sementes. Isso evita tratar HN-only ou input manual como validacao de mercado.
        </InsightNotice>
      ) : null}

      {!hasOverlap ? (
        <InsightNotice title="Sem overlap externo demonstrado" tone="info">
          Este card ainda nao mostra confirmacao entre fontes externas no mesmo `topic_key`. Ausencia em Trends
          nao e ausencia de demanda; e apenas falta de evidencia cruzada nesta rodada.
        </InsightNotice>
      ) : null}

      {rejected ? (
        <InsightNotice title="Por que foi rejeitada ou bloqueada?" tone="danger">
          O motor pode rejeitar por risco, blacklist, baixa launchability ou evidencia insuficiente. Veja
          `reason_codes` e `blacklist_tags` abaixo antes de reabrir a investigacao.
        </InsightNotice>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <article className="rounded-lg border border-border/80 bg-card/80 p-4 shadow-[0_1px_0_hsl(0_0%_100%/0.03)]">
          <h2 className="text-sm font-semibold">Scores do motor</h2>
          <p className="mt-1 text-xs text-muted-foreground">Pain pesa mais que trend no score composto.</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <ScoreBar label="Trend" value={oc.trendScore} />
            <ScoreBar label="Dor" value={oc.painScore} />
            <ScoreBar label="Publico" value={oc.audienceScore} />
            <ScoreBar label="Source confidence" value={oc.sourceConfidence} />
            <ScoreBar label="Launchability" value={oc.launchabilityScore} />
            <ScoreBar label="Opportunity" value={oc.opportunityScore} />
          </div>
        </article>

        <article className="rounded-lg border border-border/80 bg-card/80 p-4 shadow-[0_1px_0_hsl(0_0%_100%/0.03)]">
          <h2 className="text-sm font-semibold">Status e motivos</h2>
          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            <div>
              <div className="text-xs uppercase text-muted-foreground">Gate</div>
              <div className="mt-1 font-mono text-foreground">{oc.gateState}</div>
            </div>
            <div>
              <div className="text-xs uppercase text-muted-foreground">Reason codes</div>
              <div className="mt-1">{oc.reasonCodes.length > 0 ? oc.reasonCodes.join(", ") : "-"}</div>
            </div>
            <div>
              <div className="text-xs uppercase text-muted-foreground">Blacklist tags</div>
              <div className="mt-1">{oc.blacklistTags.length > 0 ? oc.blacklistTags.join(", ") : "-"}</div>
            </div>
            <div>
              <div className="text-xs uppercase text-muted-foreground">Topic key</div>
              <div className="mt-1 font-mono text-[12px]">{oc.topicKey ?? "-"}</div>
            </div>
          </div>
        </article>
      </section>

      <section className="rounded-lg border border-border/80 bg-card/80 p-4 shadow-[0_1px_0_hsl(0_0%_100%/0.03)]">
        <details className="group/axes">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-md text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300">
            <span>Ver detalhes tecnicos dos eixos</span>
            <span className="text-xs text-muted-foreground">JSON do motor</span>
          </summary>
          <p className="mt-2 text-xs text-muted-foreground">JSON produzido pelo motor, exibido apenas para auditoria.</p>
          <div className="mt-4">
            <JsonPreview value={oc.axesJson} maxHeight="max-h-64" />
          </div>
        </details>
      </section>

      <section className="rounded-lg border border-border/80 bg-card/80 p-4 shadow-[0_1px_0_hsl(0_0%_100%/0.03)]">
        <h2 className="text-sm font-semibold">Acoes do operador</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          F4UX nao gera ideias nem briefs. A geracao estruturada entra na F4C; por enquanto estes botoes apenas
          atualizam o gate do card existente.
        </p>
        <div className="mt-4">
          <GateForm id={oc.id} />
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold">Trilha de evidencias</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Evidencias ligadas a esta oportunidade. O resumo vem primeiro; metricas, ids e metadados ficam recolhidos.
          </p>
        </div>
        <EvidenceTraceList items={trace} showJson />
      </section>
    </div>
  );
}
