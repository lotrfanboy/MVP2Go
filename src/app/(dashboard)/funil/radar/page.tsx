import { count, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { evidences, opportunityCards } from "@/db/schema";

export default async function FunilRadarPage() {
  const db = getDb();
  let byGate: { gate_state: string; c: number }[] = [];
  let totalEvidences = 0;
  let top: { id: string; topicLabel: string; opportunityScore: string; gateState: string }[] = [];
  try {
    byGate = await db
      .select({ gate_state: opportunityCards.gateState, c: count() })
      .from(opportunityCards)
      .groupBy(opportunityCards.gateState);

    const [[ec]] = await Promise.all([db.select({ c: count() }).from(evidences)]);
    totalEvidences = Number(ec?.c ?? 0);

    top = await db
      .select({
        id: opportunityCards.id,
        topicLabel: opportunityCards.topicLabel,
        opportunityScore: opportunityCards.opportunityScore,
        gateState: opportunityCards.gateState,
      })
      .from(opportunityCards)
      .orderBy(sql`${opportunityCards.opportunityScore} DESC`)
      .limit(8);
  } catch {
    byGate = [];
  }

  const mapGate = Object.fromEntries(byGate.map((r) => [r.gate_state, Number(r.c)]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Radar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Visão rápida do funil de oportunidades (F4A). Dados parciais até o cron processar evidências.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border p-4">
          <div className="text-[11px] font-medium uppercase text-muted-foreground">Evidências</div>
          <div className="mt-1 text-2xl font-semibold tabular-nums">{totalEvidences}</div>
        </div>
        <div className="rounded-lg border border-border p-4 md:col-span-2">
          <div className="text-[11px] font-medium uppercase text-muted-foreground">Por gate</div>
          <ul className="mt-2 space-y-1 text-[13px]">
            {Object.keys(mapGate).length === 0 ? (
              <li className="text-muted-foreground">Sem oportunidades ainda.</li>
            ) : (
              Object.entries(mapGate).map(([g, n]) => (
                <li key={g}>
                  <span className="font-mono">{g}</span>: {n}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
      <div>
        <h2 className="text-sm font-semibold">Top opportunity_score</h2>
        <ul className="mt-2 space-y-2 text-[13px]">
          {top.length === 0 ? (
            <li className="text-muted-foreground">Vazio — rode o pipeline de evidências.</li>
          ) : (
            top.map((o) => (
              <li key={o.id}>
                <a href={`/funil/opportunities/${o.id}`} className="text-primary underline-offset-4 hover:underline">
                  {o.topicLabel}
                </a>{" "}
                <span className="text-muted-foreground">
                  ({o.gateState}) score {o.opportunityScore}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
