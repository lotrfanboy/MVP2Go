import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { watchTopics } from "@/db/schema";
import { EmptyState, InsightNotice, PageHeader, formatDateShort } from "@/components/funil/funil-ui";
import { createWatchTopic } from "./actions";
import { WatchTopicForm } from "./watch-topic-form";

export const dynamic = "force-dynamic";

export default async function WatchTopicsPage() {
  const db = getDb();
  let rows: typeof watchTopics.$inferSelect[] = [];
  let dbError = false;
  try {
    rows = await db.select().from(watchTopics).orderBy(desc(watchTopics.updatedAt)).limit(100);
  } catch {
    dbError = true;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Monitoramento"
        title="Topicos monitorados"
        description="Monitoramento recorrente. So ganha forca quando fontes externas geram evidencias no mesmo topic_key."
      />

      {dbError ? (
        <InsightNotice title="Topicos indisponiveis" tone="warning">
          Nao consegui consultar `watch_topics` agora.
        </InsightNotice>
      ) : null}

      <InsightNotice title="O que observar" tone="info">
        Use para acompanhar temas. Trate como seed ate haver evidencias externas correspondentes.
      </InsightNotice>

      <WatchTopicForm action={createWatchTopic} />

      <section className="rounded-lg border border-border/80 bg-card/80 p-4 shadow-[0_1px_0_hsl(0_0%_100%/0.03)]">
        <h2 className="text-sm font-semibold">Temas em observacao</h2>
        {rows.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="Nenhum topico monitorado"
              description="Adicione um tema para acompanhar ao longo do tempo. Ele vira seed, nao prova externa."
            />
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Tema</th>
                  <th className="px-3 py-2 font-medium">topic_key</th>
                  <th className="px-3 py-2 font-medium">Idioma</th>
                  <th className="px-3 py-2 font-medium">Mercado</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Atualizado</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-border/60">
                    <td className="px-3 py-2 font-medium">{row.topicLabel}</td>
                    <td className="px-3 py-2 font-mono text-[12px] text-muted-foreground">{row.topicKey}</td>
                    <td className="px-3 py-2">{row.language}</td>
                    <td className="px-3 py-2">{row.market}</td>
                    <td className="px-3 py-2">{row.status}</td>
                    <td className="px-3 py-2 text-muted-foreground">{formatDateShort(row.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
