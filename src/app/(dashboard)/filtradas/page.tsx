import Link from "next/link";
import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { ideas } from "@/db/schema";
import { unfilterOverrideAction } from "./actions";

export default async function FiltradasPage() {
  const db = getDb();
  const rows = await db
    .select({
      id: ideas.id,
      name: ideas.name,
      blacklistTags: ideas.blacklistTags,
      language: ideas.language,
      createdAt: ideas.createdAt,
      isOverridden: sql<boolean>`exists (
        select 1
        from feedback f
        where f.idea_id = ${ideas.id}
          and f.action = 'unfilter_override'
      )`,
    })
    .from(ideas)
    .where(eq(ideas.isFilteredOut, true));

  return (
    <main className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Filtradas</h1>
        <p className="text-sm text-muted-foreground">Auditoria de ideias fora do ranking principal.</p>
      </header>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left">
            <tr>
              <th className="p-3">Ideia</th>
              <th className="p-3">Motivo (blacklist)</th>
              <th className="p-3">Idioma</th>
              <th className="p-3">Data</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="p-4 text-muted-foreground" colSpan={4}>
                  Nenhuma ideia filtrada pela blacklist recentemente.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="p-3">{row.name}</td>
                  <td className="p-3">{row.blacklistTags.join(", ")}</td>
                  <td className="p-3">{row.language}</td>
                  <td className="p-3">{new Date(row.createdAt).toLocaleString("pt-BR")}</td>
                  <td className="p-3">
                    <div className="space-y-2">
                      <Link href={`/ideias/${row.id}`} className="text-xs text-primary hover:underline">
                        Ver detalhe
                      </Link>
                      {row.isOverridden ? (
                        <p className="text-xs text-muted-foreground">Revertida manualmente</p>
                      ) : (
                        <form action={unfilterOverrideAction} className="space-y-1">
                          <input type="hidden" name="ideaId" value={row.id} />
                          <input
                            name="note"
                            required
                            minLength={3}
                            placeholder="Motivo da reversão"
                            className="h-8 w-full rounded border bg-background px-2 text-xs"
                          />
                          <button type="submit" className="rounded border px-2 py-1 text-xs hover:bg-muted">
                            Reverter para ranking
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
