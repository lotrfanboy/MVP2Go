import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { feedback, ideaSignals, ideas, signals } from "@/db/schema";
import { ideaAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function IdeaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();

  const [idea] = await db
    .select({
      id: ideas.id,
      name: ideas.name,
      pain: ideas.pain,
      audience: ideas.audience,
      promise: ideas.promise,
      mvp: ideas.mvp,
      channel: ideas.channel,
      monetization: ideas.monetization,
      totalScore: ideas.totalScore,
      status: ideas.status,
      productType: ideas.productType,
      language: ideas.language,
      subscores: ideas.subscores,
      createdAt: ideas.createdAt,
    })
    .from(ideas)
    .where(eq(ideas.id, id))
    .limit(1);

  if (!idea) notFound();

  const [evidenceRows, feedbackRows] = await Promise.all([
    db
      .select({
        signalId: ideaSignals.signalId,
        evidenceQuote: ideaSignals.evidenceQuote,
        sourceUrl: ideaSignals.sourceUrl,
        title: signals.title,
      })
      .from(ideaSignals)
      .leftJoin(signals, eq(ideaSignals.signalId, signals.id))
      .where(eq(ideaSignals.ideaId, idea.id))
      .limit(20),
    db
      .select({
        id: feedback.id,
        action: feedback.action,
        note: feedback.note,
        createdAt: feedback.createdAt,
      })
      .from(feedback)
      .where(eq(feedback.ideaId, idea.id))
      .orderBy(desc(feedback.createdAt))
      .limit(20),
  ]);

  return (
    <main className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{idea.name}</h1>
        <p className="text-sm text-muted-foreground">
          {idea.productType} · {idea.language} · status {idea.status} · score {Number(idea.totalScore).toFixed(2)}
        </p>
        <form action={ideaAction} className="grid gap-2 rounded-xl border bg-card p-3 md:grid-cols-3">
          <input type="hidden" name="ideaId" value={idea.id} />
          <input
            name="note"
            placeholder="Nota opcional da ação"
            className="h-9 rounded-md border bg-background px-3 text-sm md:col-span-3"
          />
          <button type="submit" name="action" value="approve" className="h-9 rounded-md border px-3 text-sm hover:bg-muted">
            Aprovar
          </button>
          <button type="submit" name="action" value="reject" className="h-9 rounded-md border px-3 text-sm hover:bg-muted">
            Rejeitar
          </button>
          <button
            type="submit"
            name="action"
            value="promising"
            className="h-9 rounded-md border px-3 text-sm hover:bg-muted"
          >
            Marcar promissora
          </button>
          <button type="submit" name="action" value="snooze" className="h-9 rounded-md border px-3 text-sm hover:bg-muted">
            Adiar (snooze)
          </button>
          <button type="submit" name="action" value="note" className="h-9 rounded-md border px-3 text-sm hover:bg-muted">
            Registrar nota
          </button>
        </form>
      </header>

      <section className="grid gap-3 md:grid-cols-2">
        <article className="rounded-xl border bg-card p-4">
          <h2 className="font-medium">Resumo</h2>
          <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
            <li>
              <strong>Dor:</strong> {idea.pain}
            </li>
            <li>
              <strong>Audiência:</strong> {idea.audience}
            </li>
            <li>
              <strong>Promessa:</strong> {idea.promise}
            </li>
            <li>
              <strong>MVP:</strong> {idea.mvp}
            </li>
            <li>
              <strong>Canal:</strong> {idea.channel}
            </li>
            <li>
              <strong>Monetização:</strong> {idea.monetization}
            </li>
          </ul>
        </article>

        <article className="rounded-xl border bg-card p-4">
          <h2 className="font-medium">Subscores (JSON)</h2>
          <pre className="mt-3 overflow-auto rounded border bg-muted/40 p-3 text-xs">
            {JSON.stringify(idea.subscores, null, 2)}
          </pre>
          <div className="mt-3">
            <Link href={`/brief/${idea.id}`} className="text-sm text-primary hover:underline">
              Abrir brief MVP
            </Link>
          </div>
        </article>
      </section>

      <section className="rounded-xl border bg-card p-4">
        <h2 className="font-medium">Evidências</h2>
        {evidenceRows.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Sem evidências associadas.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {evidenceRows.map((row) => (
              <li key={`${row.signalId}-${row.sourceUrl ?? ""}`} className="rounded border p-2">
                <p className="text-muted-foreground">{row.title ?? "Sinal sem título"}</p>
                <p className="mt-1 italic">{row.evidenceQuote ?? "(sem quote)"}</p>
                {row.sourceUrl ? (
                  <a href={row.sourceUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    Ver fonte
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border bg-card p-4">
        <h2 className="font-medium">Histórico de ações</h2>
        {feedbackRows.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Nenhuma ação registrada.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {feedbackRows.map((row) => (
              <li key={row.id}>
                {row.action} · {row.note ?? "-"} · {new Date(row.createdAt).toLocaleString("pt-BR")}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
