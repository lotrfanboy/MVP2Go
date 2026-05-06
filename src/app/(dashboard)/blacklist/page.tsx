import { asc } from "drizzle-orm";
import { getDb } from "@/db";
import { blacklistTerms } from "@/db/schema";
import { createBlacklistTermAction, toggleBlacklistTermAction } from "./actions";

export default async function BlacklistPage() {
  const db = getDb();
  const rows = await db
    .select({
      id: blacklistTerms.id,
      term: blacklistTerms.term,
      category: blacklistTerms.category,
      scope: blacklistTerms.scope,
      language: blacklistTerms.language,
      matchKind: blacklistTerms.matchKind,
      active: blacklistTerms.active,
    })
    .from(blacklistTerms)
    .orderBy(asc(blacklistTerms.category), asc(blacklistTerms.term));

  return (
    <main className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Blacklist</h1>
        <p className="text-sm text-muted-foreground">Termos proibidos para sinais e ideias.</p>
      </header>
      <section className="rounded-xl border bg-card p-4">
        <h2 className="text-lg font-medium">Novo termo</h2>
        <form action={createBlacklistTermAction} className="mt-3 grid gap-3 md:grid-cols-5">
          <input
            name="term"
            placeholder="termo"
            className="h-9 rounded-md border bg-background px-3 text-sm"
            required
          />
          <input
            name="category"
            placeholder="categoria"
            className="h-9 rounded-md border bg-background px-3 text-sm"
            required
          />
          <select name="scope" className="h-9 rounded-md border bg-background px-3 text-sm">
            <option value="all">all</option>
            <option value="signal">signal</option>
            <option value="idea">idea</option>
          </select>
          <select name="language" className="h-9 rounded-md border bg-background px-3 text-sm">
            <option value="all">all</option>
            <option value="pt">pt</option>
            <option value="en">en</option>
          </select>
          <select name="matchKind" className="h-9 rounded-md border bg-background px-3 text-sm">
            <option value="keyword">keyword</option>
            <option value="regex">regex</option>
          </select>
          <button type="submit" className="h-9 rounded-md border px-3 text-sm hover:bg-muted md:col-span-5">
            Criar termo
          </button>
        </form>
      </section>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left">
            <tr>
              <th className="p-3">Termo</th>
              <th className="p-3">Categoria</th>
              <th className="p-3">Scope</th>
              <th className="p-3">Idioma</th>
              <th className="p-3">Match</th>
              <th className="p-3">Ativo</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="p-3">{row.term}</td>
                <td className="p-3">{row.category}</td>
                <td className="p-3">{row.scope}</td>
                <td className="p-3">{row.language}</td>
                <td className="p-3">{row.matchKind}</td>
                <td className="p-3">{row.active ? "Sim" : "Não"}</td>
                <td className="p-3">
                  <form action={toggleBlacklistTermAction}>
                    <input type="hidden" name="blacklistId" value={row.id} />
                    <input type="hidden" name="active" value={String(row.active)} />
                    <button type="submit" className="rounded border px-2 py-1 text-xs hover:bg-muted">
                      {row.active ? "Desativar" : "Ativar"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
