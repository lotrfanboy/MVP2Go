import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { opportunityCards } from "@/db/schema";

type Props = { searchParams?: Promise<{ gate?: string }> };

export default async function OpportunitiesPage({ searchParams }: Props) {
  const sp = (await searchParams) ?? {};
  const gateFilter = sp.gate;
  const db = getDb();
  let rows: typeof opportunityCards.$inferSelect[] = [];
  try {
    rows = gateFilter
      ? await db
          .select()
          .from(opportunityCards)
          .where(eq(opportunityCards.gateState, gateFilter))
          .orderBy(desc(opportunityCards.opportunityScore))
          .limit(200)
      : await db.select().from(opportunityCards).orderBy(desc(opportunityCards.opportunityScore)).limit(200);
  } catch {
    rows = [];
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Oportunidades</h1>
      <p className="text-sm text-muted-foreground">
        Filtro rápido: adicione{" "}
        <code className="rounded bg-muted px-1">?gate=qualified_opportunity</code> na URL.
      </p>
      <div className="rounded-lg border border-border">
        <table className="w-full border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-3 py-2 font-medium">Rótulo</th>
              <th className="px-3 py-2 font-medium">Gate</th>
              <th className="px-3 py-2 font-medium">Opp score</th>
              <th className="px-3 py-2 font-medium">Fonte conf.</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                  Sem cartões. Rode score-opportunities após build-evidence.
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const showLowSource =
                  Number(r.sourceConfidence) <= 0.41 &&
                  (r.gateState === "opportunity_candidate" ||
                    r.gateState === "qualified_opportunity");

                return (
                  <tr key={r.id} className="border-b border-border/60">
                    <td className="px-3 py-2">
                      <a
                        href={`/funil/opportunities/${r.id}`}
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        {r.topicLabel}
                      </a>
                    </td>
                    <td className="px-3 py-2 font-mono text-[12px]">{r.gateState}</td>
                    <td className="px-3 py-2 tabular-nums">{r.opportunityScore}</td>
                    <td className="px-3 py-2">
                      <div className="tabular-nums">{r.sourceConfidence}</div>
                      {showLowSource ? (
                        <div className="mt-1 inline-flex rounded-full border border-amber-700/50 bg-amber-950/40 px-2 py-0.5 text-[11px] font-medium text-amber-100">
                          Baixa confiança de fonte
                        </div>
                      ) : null}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
