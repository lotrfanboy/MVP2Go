import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { evidences, opportunityCards, opportunityEvidences } from "@/db/schema";
import { GateForm } from "./gate-form";

type Props = { params: Promise<{ id: string }> };

export default async function OpportunityDetailPage({ params }: Props) {
  const { id } = await params;
  const db = getDb();

  const [oc] = await db.select().from(opportunityCards).where(eq(opportunityCards.id, id)).limit(1);
  if (!oc) notFound();

  const trace = await db
    .select({
      ev: evidences,
    })
    .from(opportunityEvidences)
    .innerJoin(evidences, eq(opportunityEvidences.evidenceId, evidences.id))
    .where(eq(opportunityEvidences.opportunityId, id));

  const showLowSource =
    oc.gateState === "qualified_opportunity" || Number(oc.sourceConfidence) <= 0.41;
  const flagLabel = "Baixa confiança de fonte";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{oc.topicLabel}</h1>
        <p className="mt-1 font-mono text-[12px] text-muted-foreground">id={oc.id}</p>
      </div>

      {showLowSource ? (
        <div className="rounded-md border border-amber-700/50 bg-amber-950/40 px-3 py-2 text-[13px] text-amber-100">
          <span className="font-semibold">{flagLabel}</span> — F4A está em HN-only.{" "}
          {oc.gateState === "qualified_opportunity"
            ? "Motor valida estrutura; não prova mercado amplo."
            : "Confiança de fonte limitada."}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border p-3 text-[13px]">
          <div className="font-medium">Scores</div>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            <li>trend: {oc.trendScore}</li>
            <li>pain: {oc.painScore}</li>
            <li>audience: {oc.audienceScore}</li>
            <li>source_confidence: {oc.sourceConfidence}</li>
            <li>launchability: {oc.launchabilityScore}</li>
            <li className="font-medium text-foreground">opportunity: {oc.opportunityScore}</li>
          </ul>
        </div>
        <div className="rounded-lg border border-border p-3 text-[13px]">
          <div className="font-medium">Gate</div>
          <p className="mt-2 font-mono text-[12px]">{oc.gateState}</p>
          <p className="mt-2 text-muted-foreground">reason_codes: {(oc.reasonCodes ?? []).join(", ") || "—"}</p>
        </div>
      </div>

      <GateForm id={oc.id} />

      <div>
        <h2 className="text-sm font-semibold">Trilha de evidências</h2>
        <ul className="mt-2 space-y-2 text-[13px]">
          {trace.length === 0 ? (
            <li className="text-muted-foreground">Sem vínculos (reprocesse o motor).</li>
          ) : (
            trace.map(({ ev }) => (
              <li key={ev.id} className="rounded border border-border/60 px-3 py-2">
                <span className="font-mono text-[12px]">{ev.evidenceType}</span>{" "}
                <span className="text-muted-foreground">[{ev.sourceKey}]</span>
                <div className="text-muted-foreground">{(ev.summary ?? "").slice(0, 280)}</div>
                {ev.sourceRef ? (
                  <a href={ev.sourceRef} className="text-primary text-[12px] underline-offset-2 hover:underline" target="_blank" rel="noreferrer">
                    Abrir fonte
                  </a>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
