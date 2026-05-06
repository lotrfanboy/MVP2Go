import Link from "next/link";
import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { costBudgets, feedback, ideas, runs } from "@/db/schema";

function monthStartIso() {
  const now = new Date();
  now.setUTCDate(1);
  now.setUTCHours(0, 0, 0, 0);
  return now;
}

export default async function DashboardPage() {
  const db = getDb();
  const monthStart = monthStartIso();

  let generated: { total: number } | undefined;
  let approved: { total: number } | undefined;
  let filtered: { total: number } | undefined;
  let lastRun:
    | {
        id: string;
        kind: string;
        status: string;
        startedAt: Date;
        itemsIn: number;
        itemsOut: number;
      }
    | undefined;
  let budget:
    | {
        currentSpendUsd: string;
        monthlyBudgetUsd: string;
        status: string;
      }
    | undefined;
  let topIdeas: Array<{ id: string; name: string; productType: string; totalScore: string }> = [];
  let recentFeedback: Array<{ id: string; action: string; createdAt: Date }> = [];
  let dbError = false;

  try {
    const [[g], [a], [f], [lr], [b], ti, rf] = await Promise.all([
      db.select({ total: count() }).from(ideas).where(gte(ideas.createdAt, monthStart)),
      db
        .select({ total: count() })
        .from(ideas)
        .where(and(gte(ideas.createdAt, monthStart), eq(ideas.status, "approved"))),
      db
        .select({ total: count() })
        .from(ideas)
        .where(and(gte(ideas.createdAt, monthStart), eq(ideas.isFilteredOut, true))),
      db
        .select({
          id: runs.id,
          kind: runs.kind,
          status: runs.status,
          startedAt: runs.startedAt,
          itemsIn: runs.itemsIn,
          itemsOut: runs.itemsOut,
        })
        .from(runs)
        .orderBy(desc(runs.startedAt))
        .limit(1),
      db
        .select({
          currentSpendUsd: costBudgets.currentSpendUsd,
          monthlyBudgetUsd: costBudgets.monthlyBudgetUsd,
          status: costBudgets.status,
        })
        .from(costBudgets)
        .orderBy(desc(costBudgets.updatedAt))
        .limit(1),
      db
        .select({
          id: ideas.id,
          name: ideas.name,
          productType: ideas.productType,
          totalScore: ideas.totalScore,
        })
        .from(ideas)
        .where(eq(ideas.isFilteredOut, false))
        .orderBy(sql`${ideas.totalScore} DESC`)
        .limit(5),
      db
        .select({ id: feedback.id, action: feedback.action, createdAt: feedback.createdAt })
        .from(feedback)
        .orderBy(desc(feedback.createdAt))
        .limit(10),
    ]);
    generated = g;
    approved = a;
    filtered = f;
    lastRun = lr;
    budget = b;
    topIdeas = ti;
    recentFeedback = rf;
  } catch {
    dbError = true;
  }

  const cards = [
    { label: "Ideias geradas (mês)", value: generated?.total ?? 0 },
    { label: "Ideias aprovadas (mês)", value: approved?.total ?? 0 },
    { label: "Ideias filtradas (mês)", value: filtered?.total ?? 0 },
    {
      label: "Custo IA (mês)",
      value: `${Number(budget?.currentSpendUsd ?? 0).toFixed(3)} / ${Number(budget?.monthlyBudgetUsd ?? 50).toFixed(2)} USD`,
    },
  ];

  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral operacional da semana.</p>
      </header>
      {dbError ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          Alguns dados não puderam ser carregados agora. Tente atualizar em instantes.
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="rounded-xl border bg-card p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border bg-card p-4">
          <h2 className="text-lg font-medium">Última execução</h2>
          {lastRun ? (
            <div className="mt-3 space-y-1 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">{lastRun.kind}</strong> · {lastRun.status}
              </p>
              <p>Itens in/out: {lastRun.itemsIn} / {lastRun.itemsOut}</p>
              <p>{new Date(lastRun.startedAt).toLocaleString("pt-BR")}</p>
              <Link href="/runs" className="text-primary hover:underline">
                Ver execuções
              </Link>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Sem execuções recentes.</p>
          )}
        </article>

        <article className="rounded-xl border bg-card p-4">
          <h2 className="text-lg font-medium">Top 5 ideias</h2>
          {topIdeas.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm">
              {topIdeas.map((idea) => (
                <li key={idea.id} className="flex items-center justify-between">
                  <Link href={`/ideias/${idea.id}`} className="truncate hover:underline">
                    {idea.name}
                  </Link>
                  <span className="font-mono text-muted-foreground">{Number(idea.totalScore).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Sem ideias geradas para o ranking atual.</p>
          )}
        </article>
      </section>

      <article className="rounded-xl border bg-card p-4">
        <h2 className="text-lg font-medium">Atividade recente</h2>
        {recentFeedback.length > 0 ? (
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {recentFeedback.map((item) => (
              <li key={item.id}>
                {item.action} · {new Date(item.createdAt).toLocaleString("pt-BR")}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">Sem ações de feedback registradas.</p>
        )}
      </article>
    </main>
  );
}
