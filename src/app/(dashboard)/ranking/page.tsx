import Link from "next/link";
import { and, eq, ilike, or, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { ideas } from "@/db/schema";

type RankingTab = "top30" | "promising" | "approved" | "rejected" | "snoozed";

function parseTab(value: string | undefined): RankingTab {
  if (value === "promising" || value === "approved" || value === "rejected" || value === "snoozed") return value;
  return "top30";
}

export default async function RankingPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const tab = parseTab(typeof params.tab === "string" ? params.tab : undefined);
  const q = typeof params.q === "string" ? params.q.trim() : "";

  const db = getDb();
  const whereParts = [
    sql`${ideas.isFilteredOut} = false OR exists (
      select 1
      from feedback f
      where f.idea_id = ${ideas.id}
        and f.action = 'unfilter_override'
    )`,
  ];

  if (tab !== "top30") {
    whereParts.push(eq(ideas.status, tab));
  }

  if (q) {
    whereParts.push(or(ilike(ideas.name, `%${q}%`), ilike(ideas.pain, `%${q}%`), ilike(ideas.audience, `%${q}%`))!);
  }

  const rows = await db
    .select({
      id: ideas.id,
      name: ideas.name,
      audience: ideas.audience,
      productType: ideas.productType,
      language: ideas.language,
      totalScore: ideas.totalScore,
      status: ideas.status,
      createdAt: ideas.createdAt,
    })
    .from(ideas)
    .where(and(...whereParts))
    .orderBy(sql`${ideas.totalScore} DESC`)
    .limit(30);

  const tabs: Array<{ key: RankingTab; label: string }> = [
    { key: "top30", label: "Top 30" },
    { key: "promising", label: "Promissoras" },
    { key: "approved", label: "Aprovadas" },
    { key: "rejected", label: "Rejeitadas" },
    { key: "snoozed", label: "Snooze" },
  ];

  return (
    <main className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Ranking</h1>
        <p className="text-sm text-muted-foreground">Top 30 ideias ordenadas por score total.</p>
      </header>
      <section className="rounded-xl border bg-card p-3">
        <form method="GET" className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {tabs.map((item) => (
              <Link
                key={item.key}
                href={`/ranking?tab=${item.key}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={[
                  "rounded-md border px-2 py-1 text-xs",
                  tab === item.key ? "bg-muted font-medium" : "hover:bg-muted",
                ].join(" ")}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input type="hidden" name="tab" value={tab} />
            <input
              name="q"
              defaultValue={q}
              placeholder="Buscar por ideia, dor ou audiência"
              className="h-9 w-full rounded-md border bg-background px-3 text-sm md:w-80"
            />
            <button type="submit" className="h-9 rounded-md border px-3 text-sm hover:bg-muted">
              Buscar
            </button>
          </div>
        </form>
      </section>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left">
            <tr>
              <th className="p-3">Ideia</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Idioma</th>
              <th className="p-3">Status</th>
              <th className="p-3">Score</th>
              <th className="p-3">Gerada em</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="p-4 text-muted-foreground" colSpan={6}>
                  Sem ideias geradas para os filtros atuais.
                </td>
              </tr>
            ) : (
              rows.map((idea) => (
                <tr key={idea.id} className="border-t">
                  <td className="p-3">
                    <Link className="hover:underline" href={`/ideias/${idea.id}`}>
                      {idea.name}
                    </Link>
                    <p className="line-clamp-1 text-xs text-muted-foreground">{idea.audience}</p>
                  </td>
                  <td className="p-3">{idea.productType}</td>
                  <td className="p-3">{idea.language}</td>
                  <td className="p-3">{idea.status}</td>
                  <td className="p-3 font-mono">{Number(idea.totalScore).toFixed(2)}</td>
                  <td className="p-3">{new Date(idea.createdAt).toLocaleString("pt-BR")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
