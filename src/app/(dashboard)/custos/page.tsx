import { desc, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { aiUsageLogs, costBudgets } from "@/db/schema";

export default async function CustosPage() {
  const db = getDb();
  const [budget, byOperation, latestCalls] = await Promise.all([
    db
      .select({
        periodMonth: costBudgets.periodMonth,
        currentSpendUsd: costBudgets.currentSpendUsd,
        monthlyBudgetUsd: costBudgets.monthlyBudgetUsd,
        status: costBudgets.status,
      })
      .from(costBudgets)
      .orderBy(desc(costBudgets.updatedAt))
      .limit(1),
    db
      .select({
        operation: aiUsageLogs.operation,
        totalCalls: sql<number>`count(*)`,
        totalCost: sql<number>`coalesce(sum(${aiUsageLogs.estimatedCostUsd}), 0)`,
      })
      .from(aiUsageLogs)
      .groupBy(aiUsageLogs.operation),
    db
      .select({
        id: aiUsageLogs.id,
        createdAt: aiUsageLogs.createdAt,
        operation: aiUsageLogs.operation,
        model: aiUsageLogs.model,
        tokensIn: aiUsageLogs.tokensIn,
        tokensOut: aiUsageLogs.tokensOut,
        estimatedCostUsd: aiUsageLogs.estimatedCostUsd,
        status: aiUsageLogs.status,
      })
      .from(aiUsageLogs)
      .orderBy(desc(aiUsageLogs.createdAt))
      .limit(50),
  ]);

  const current = budget[0];
  const spend = Number(current?.currentSpendUsd ?? 0);
  const monthly = Number(current?.monthlyBudgetUsd ?? 50);
  const ratio = monthly > 0 ? spend / monthly : 0;

  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Custos</h1>
        <p className="text-sm text-muted-foreground">Uso de IA versus budget mensal.</p>
      </header>

      <section className="rounded-xl border bg-card p-4">
        <h2 className="text-lg font-medium">Mês corrente</h2>
        <p className="mt-2 font-mono text-xl">
          US$ {spend.toFixed(3)} / US$ {monthly.toFixed(2)} ({(ratio * 100).toFixed(1)}%)
        </p>
        <div className="mt-3 h-2 w-full rounded bg-muted">
          <div className="h-2 rounded bg-primary" style={{ width: `${Math.min(ratio * 100, 100)}%` }} />
        </div>
      </section>

      <section className="rounded-xl border bg-card p-4">
        <h2 className="text-lg font-medium">Breakdown por operação</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="pb-2">Operação</th>
                <th className="pb-2">Chamadas</th>
                <th className="pb-2">Custo</th>
              </tr>
            </thead>
            <tbody>
              {byOperation.map((row) => (
                <tr key={row.operation} className="border-t">
                  <td className="py-2">{row.operation}</td>
                  <td className="py-2">{row.totalCalls}</td>
                  <td className="py-2 font-mono">US$ {Number(row.totalCost).toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-4">
        <h2 className="text-lg font-medium">Últimas 50 chamadas</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="p-2">Data</th>
                <th className="p-2">Operação</th>
                <th className="p-2">Modelo</th>
                <th className="p-2">Tokens In/Out</th>
                <th className="p-2">Custo</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {latestCalls.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="p-2">{new Date(row.createdAt).toLocaleString("pt-BR")}</td>
                  <td className="p-2">{row.operation}</td>
                  <td className="p-2">{row.model}</td>
                  <td className="p-2">
                    {row.tokensIn} / {row.tokensOut}
                  </td>
                  <td className="p-2 font-mono">US$ {Number(row.estimatedCostUsd).toFixed(4)}</td>
                  <td className="p-2">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
