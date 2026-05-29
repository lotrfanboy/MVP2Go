import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { manualInputs } from "@/db/schema";
import { ManualInputForm } from "./manual-input-form";

export default async function ManualPage() {
  const db = getDb();
  let rows: typeof manualInputs.$inferSelect[] = [];
  try {
    rows = await db.select().from(manualInputs).orderBy(desc(manualInputs.createdAt)).limit(20);
  } catch {
    rows = [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Análise manual</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Insere um semente manual. Confiança de fonte externa não aumenta (D-14/D-17).
        </p>
      </div>
      <ManualInputForm />
      <div className="rounded-lg border border-border">
        <table className="w-full border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Tipo</th>
              <th className="px-3 py-2 font-medium">Trecho</th>
              <th className="px-3 py-2 font-medium">Criado</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                  Nenhum envio manual ainda.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-border/60">
                  <td className="px-3 py-2">{r.status}</td>
                  <td className="px-3 py-2">{r.inputKind}</td>
                  <td className="max-w-md truncate px-3 py-2 text-muted-foreground">{r.payload}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {r.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
