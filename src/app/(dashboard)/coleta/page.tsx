import { and, count, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { rawItems, signals, sources } from "@/db/schema";

const PAGE_SIZE = 30;

type StatusFilter = "todos" | "candidatos" | "filtrados" | "blacklist";

function parseStatus(value: string | undefined): StatusFilter {
  if (value === "candidatos" || value === "filtrados" || value === "blacklist") return value;
  return "todos";
}

export default async function ColetaPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const status = parseStatus(
    typeof params.status === "string" ? params.status : Array.isArray(params.status) ? params.status[0] : undefined,
  );
  const sourceParam =
    typeof params.source === "string" ? params.source : Array.isArray(params.source) ? params.source[0] : "";
  const query = typeof params.q === "string" ? params.q.trim() : Array.isArray(params.q) ? params.q[0] ?? "" : "";
  const pageRaw = typeof params.page === "string" ? params.page : Array.isArray(params.page) ? params.page[0] : "1";
  const page = Math.max(1, Number.parseInt(pageRaw ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const db = getDb();
  let sourceRows: Array<{ id: string; name: string }> = [];
  try {
    sourceRows = await db.select({ id: sources.id, name: sources.name }).from(sources).orderBy(sources.name);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Falha ao carregar dados de coleta.";
    return (
      <main className="flex flex-col gap-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Coleta / Raw Items / Candidatos</h1>
          <p className="text-sm text-muted-foreground">
            Não foi possível conectar ao banco de dados neste momento.
          </p>
        </header>
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {message}
        </div>
      </main>
    );
  }

  const conditions = [];
  if (status === "candidatos") {
    conditions.push(eq(rawItems.isCandidate, true));
  } else if (status === "filtrados") {
    conditions.push(eq(rawItems.isFilteredOut, true));
  } else if (status === "blacklist") {
    conditions.push(sql`cardinality(${rawItems.blacklistTags}) > 0`);
  }

  if (sourceParam) {
    const sourceIds = sourceRows.filter((s) => s.name === sourceParam).map((s) => s.id);
    if (sourceIds.length > 0) {
      conditions.push(inArray(rawItems.sourceId, sourceIds));
    }
  }

  if (query) {
    conditions.push(
      or(
        ilike(sql<string>`coalesce(${rawItems.rawPayload} ->> 'title', '')`, `%${query}%`),
        ilike(rawItems.url, `%${query}%`),
      )!,
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalRow] = await db
    .select({ total: count() })
    .from(rawItems)
    .where(whereClause);
  const total = totalRow?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const rows = await db
    .select({
      id: rawItems.id,
      title: sql<string>`coalesce(${rawItems.rawPayload} ->> 'title', '')`,
      url: rawItems.url,
      language: rawItems.language,
      isCandidate: rawItems.isCandidate,
      isFilteredOut: rawItems.isFilteredOut,
      filterReason: rawItems.filterReason,
      blacklistTags: rawItems.blacklistTags,
      fetchedAt: rawItems.fetchedAt,
      sourceName: sources.name,
    })
    .from(rawItems)
    .innerJoin(sources, eq(rawItems.sourceId, sources.id))
    .where(whereClause)
    .orderBy(sql`${rawItems.fetchedAt} DESC`)
    .limit(PAGE_SIZE)
    .offset(offset);

  const [conversionRow] = await db
    .select({
      totalCandidates: sql<number>`count(*) filter (where ${rawItems.isCandidate} = true)`,
      convertedToSignals: count(signals.id),
    })
    .from(rawItems)
    .leftJoin(signals, eq(signals.rawItemId, rawItems.id));

  function makeHref(nextPage: number) {
    const p = new URLSearchParams();
    if (status !== "todos") p.set("status", status);
    if (sourceParam) p.set("source", sourceParam);
    if (query) p.set("q", query);
    p.set("page", String(nextPage));
    return `/coleta?${p.toString()}`;
  }

  return (
    <main className="flex flex-col gap-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Coleta / Raw Items / Candidatos</h1>
        <p className="text-sm text-muted-foreground">
          Visualização somente leitura dos itens coletados da fonte configurada.
        </p>
        <p className="text-sm text-muted-foreground">
          Conversão candidatos {conversionRow?.totalCandidates ?? 0} -&gt; signals{" "}
          {conversionRow?.convertedToSignals ?? 0}
        </p>
      </header>

      <form method="GET" className="grid gap-3 rounded-md border p-4 md:grid-cols-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="status" className="text-sm font-medium">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status}
            className="h-9 rounded-md border bg-background px-3 text-sm"
          >
            <option value="todos">Todos</option>
            <option value="candidatos">Candidatos</option>
            <option value="filtrados">Filtrados</option>
            <option value="blacklist">Blacklist</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="source" className="text-sm font-medium">
            Fonte
          </label>
          <select
            id="source"
            name="source"
            defaultValue={sourceParam}
            className="h-9 rounded-md border bg-background px-3 text-sm"
          >
            <option value="">Todas</option>
            {sourceRows.map((source) => (
              <option key={source.id} value={source.name}>
                {source.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 md:col-span-2">
          <label htmlFor="q" className="text-sm font-medium">
            Busca por título
          </label>
          <input
            id="q"
            name="q"
            defaultValue={query}
            placeholder="Ex.: onboarding tool"
            className="h-9 rounded-md border bg-background px-3 text-sm"
          />
        </div>

        <input type="hidden" name="page" value="1" />
        <div className="md:col-span-4">
          <button type="submit" className="h-9 rounded-md border px-3 text-sm hover:bg-muted">
            Aplicar filtros
          </button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left">
            <tr>
              <th className="p-3 font-medium">Título</th>
              <th className="p-3 font-medium">Fonte</th>
              <th className="p-3 font-medium">Idioma</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Motivo</th>
              <th className="p-3 font-medium">URL</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-muted-foreground">
                  Nenhum item encontrado.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const statusLabel = row.isCandidate
                  ? "candidato"
                  : row.blacklistTags.length > 0
                    ? "blacklist"
                    : row.isFilteredOut
                      ? "filtrado"
                      : "raw";
                const reason =
                  row.blacklistTags.length > 0
                    ? row.blacklistTags.join(", ")
                    : row.filterReason || "-";
                const title = row.title || "(sem título)";
                return (
                  <tr key={row.id} className="border-t align-top">
                    <td className="p-3">
                      <a href={row.url} target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">
                        {title}
                      </a>
                    </td>
                    <td className="p-3">{row.sourceName}</td>
                    <td className="p-3">{row.language}</td>
                    <td className="p-3">{statusLabel}</td>
                    <td className="p-3">{reason}</td>
                    <td className="p-3">
                      <a href={row.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                        abrir
                      </a>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <footer className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Página {page} de {totalPages} ({total} itens)
        </span>
        <div className="flex gap-2">
          {page > 1 ? (
            <a className="rounded-md border px-3 py-1 hover:bg-muted" href={makeHref(page - 1)}>
              Anterior
            </a>
          ) : (
            <span className="rounded-md border px-3 py-1 text-muted-foreground">Anterior</span>
          )}
          {page < totalPages ? (
            <a className="rounded-md border px-3 py-1 hover:bg-muted" href={makeHref(page + 1)}>
              Próxima
            </a>
          ) : (
            <span className="rounded-md border px-3 py-1 text-muted-foreground">Próxima</span>
          )}
        </div>
      </footer>
    </main>
  );
}
