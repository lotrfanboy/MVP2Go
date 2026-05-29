import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { watchTopics } from "@/db/schema";
import { createWatchTopic } from "./actions";
import { WatchTopicForm } from "./watch-topic-form";

export default async function WatchTopicsPage() {
  const db = getDb();
  let rows: typeof watchTopics.$inferSelect[] = [];
  try {
    rows = await db.select().from(watchTopics).orderBy(desc(watchTopics.updatedAt)).limit(100);
  } catch {
    rows = [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Watch topics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Temas ativos para rastrear. Seeds de auditoria — não elevam confiança de fonte externa.
        </p>
      </div>
      <WatchTopicForm action={createWatchTopic} />
      <div className="rounded-lg border border-border">
        <table className="w-full border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-3 py-2 font-medium">Chave</th>
              <th className="px-3 py-2 font-medium">Rótulo</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Atualizado</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                  Nenhum watch topic ainda.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-border/60">
                  <td className="px-3 py-2 font-mono text-[12px]">{r.topicKey}</td>
                  <td className="px-3 py-2">{r.topicLabel}</td>
                  <td className="px-3 py-2">{r.status}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {r.updatedAt.toISOString().slice(0, 16).replace("T", " ")}
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
