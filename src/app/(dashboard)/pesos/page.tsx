import { asc } from "drizzle-orm";
import { getDb } from "@/db";
import { weights } from "@/db/schema";
import { recalculateScoresAction, updateWeightAction } from "./actions";

const BASE_WEIGHT_NAMES = new Set([
  "pain_clarity",
  "b2c_fit",
  "evidence_volume",
  "signal_strength",
  "audience_specificity",
  "build_simplicity",
  "distribution_potential",
  "recency",
  "support_low",
  "lgpd_safety",
]);

export default async function PesosPage() {
  const db = getDb();
  const rows = await db
    .select({
      id: weights.id,
      name: weights.name,
      value: weights.value,
      updatedAt: weights.updatedAt,
    })
    .from(weights)
    .orderBy(asc(weights.name));

  const baseSum = rows
    .filter((row) => BASE_WEIGHT_NAMES.has(row.name))
    .reduce((acc, row) => acc + Number(row.value), 0);

  return (
    <main className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pesos</h1>
          <p className="text-sm text-muted-foreground">Configuração de scoring determinístico.</p>
        </div>
        <span className="rounded border px-2 py-1 text-sm">Soma base: {baseSum.toFixed(3)}</span>
      </header>
      <form action={recalculateScoresAction}>
        <button type="submit" className="rounded-md border px-3 py-2 text-sm hover:bg-muted">
          Recalcular scores (sem IA)
        </button>
      </form>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left">
            <tr>
              <th className="p-3">Peso</th>
              <th className="p-3">Valor</th>
              <th className="p-3">Atualizado em</th>
              <th className="p-3">Ação</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="p-3 font-mono">{row.name}</td>
                <td className="p-3 font-mono">
                  <form action={updateWeightAction} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={row.id} />
                    <input
                      type="number"
                      name="value"
                      min="0"
                      max="1"
                      step="0.001"
                      defaultValue={Number(row.value)}
                      className="h-8 w-28 rounded border bg-background px-2 text-sm"
                    />
                    <button type="submit" className="rounded border px-2 py-1 text-xs hover:bg-muted">
                      Salvar
                    </button>
                  </form>
                </td>
                <td className="p-3">{new Date(row.updatedAt).toLocaleString("pt-BR")}</td>
                <td className="p-3 text-xs text-muted-foreground">Determinístico</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
