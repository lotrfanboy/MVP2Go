import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { signals } from "@/db/schema";

export default async function SinaisPage() {
  const db = getDb();
  const rows = await db
    .select({
      id: signals.id,
      title: signals.title,
      language: signals.language,
      relevanceB2c: signals.relevanceB2c,
      signalStrength: signals.signalStrength,
      status: signals.status,
      createdAt: signals.createdAt,
    })
    .from(signals)
    .orderBy(desc(signals.createdAt))
    .limit(30);

  return (
    <main className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Sinais</h1>
        <p className="text-sm text-muted-foreground">Explorer de sinais extraídos do pipeline.</p>
      </header>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left">
            <tr>
              <th className="p-3">Título</th>
              <th className="p-3">Idioma</th>
              <th className="p-3">Relevância B2C</th>
              <th className="p-3">Strength</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="p-4 text-muted-foreground" colSpan={5}>
                  Nenhum sinal extraído hoje.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="p-3">{row.title || "(sem título)"}</td>
                  <td className="p-3">{row.language}</td>
                  <td className="p-3 font-mono">{Number(row.relevanceB2c).toFixed(2)}</td>
                  <td className="p-3 font-mono">{Number(row.signalStrength).toFixed(2)}</td>
                  <td className="p-3">{row.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
