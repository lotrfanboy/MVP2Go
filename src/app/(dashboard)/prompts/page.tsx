import { asc, desc } from "drizzle-orm";
import { getDb } from "@/db";
import { prompts } from "@/db/schema";

export default async function PromptsPage() {
  const db = getDb();
  const rows = await db
    .select({
      id: prompts.id,
      name: prompts.name,
      version: prompts.version,
      content: prompts.content,
      createdAt: prompts.createdAt,
    })
    .from(prompts)
    .orderBy(asc(prompts.name), desc(prompts.version));

  return (
    <main className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Prompts</h1>
        <p className="text-sm text-muted-foreground">Visualização read-only dos prompts versionados.</p>
      </header>
      {rows.length === 0 ? (
        <p className="rounded-xl border p-4 text-sm text-muted-foreground">
          Nenhum prompt encontrado. O seed da F2 deve criar as versões 001.
        </p>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <article key={row.id} className="rounded-xl border bg-card p-4">
              <h2 className="font-medium">
                {row.name} · {row.version}
              </h2>
              <p className="text-xs text-muted-foreground">{new Date(row.createdAt).toLocaleString("pt-BR")}</p>
              <pre className="mt-3 max-h-72 overflow-auto rounded border bg-muted/40 p-3 text-xs">{row.content}</pre>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
