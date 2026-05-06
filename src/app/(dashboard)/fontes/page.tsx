import { asc } from "drizzle-orm";
import { getDb } from "@/db";
import { sources } from "@/db/schema";
import { createSourceAction, toggleSourceAction } from "./actions";

export default async function FontesPage() {
  const db = getDb();
  const rows = await db
    .select({
      id: sources.id,
      name: sources.name,
      kind: sources.kind,
      active: sources.active,
      createdAt: sources.createdAt,
    })
    .from(sources)
    .orderBy(asc(sources.name));

  return (
    <main className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Fontes</h1>
        <p className="text-sm text-muted-foreground">Visualização atual das fontes configuradas.</p>
      </header>
      <section className="rounded-xl border bg-card p-4">
        <h2 className="text-lg font-medium">Nova fonte</h2>
        <form action={createSourceAction} className="mt-3 grid gap-3 md:grid-cols-3">
          <input
            name="name"
            placeholder="Nome da fonte"
            className="h-9 rounded-md border bg-background px-3 text-sm"
            required
          />
          <select name="kind" className="h-9 rounded-md border bg-background px-3 text-sm" required>
            <option value="algolia-hn">algolia-hn</option>
            <option value="product-hunt">product-hunt</option>
            <option value="rss">rss</option>
            <option value="apple-rss">apple-rss</option>
            <option value="stack-exchange">stack-exchange</option>
            <option value="manual">manual</option>
          </select>
          <button type="submit" className="h-9 rounded-md border px-3 text-sm hover:bg-muted">
            Criar fonte
          </button>
        </form>
      </section>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">Kind</th>
              <th className="p-3">Ativa</th>
              <th className="p-3">Criada em</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="p-3">{row.name}</td>
                <td className="p-3">{row.kind}</td>
                <td className="p-3">{row.active ? "Sim" : "Não"}</td>
                <td className="p-3">{new Date(row.createdAt).toLocaleString("pt-BR")}</td>
                <td className="p-3">
                  <form action={toggleSourceAction}>
                    <input type="hidden" name="sourceId" value={row.id} />
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
