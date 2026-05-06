import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { briefs, ideas } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function BriefPage({ params }: { params: Promise<{ ideaId: string }> }) {
  const { ideaId } = await params;
  const db = getDb();

  const ideaIdResolved =
    ideaId === "latest"
      ? (
          await db
            .select({ id: ideas.id })
            .from(ideas)
            .where(eq(ideas.status, "approved"))
            .limit(1)
        )[0]?.id
      : ideaId;

  if (!ideaIdResolved) {
    return (
      <main className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">Brief MVP</h1>
        <p className="text-sm text-muted-foreground">Nenhuma ideia aprovada encontrada.</p>
      </main>
    );
  }

  const [idea] = await db
    .select({ id: ideas.id, name: ideas.name, status: ideas.status })
    .from(ideas)
    .where(eq(ideas.id, ideaIdResolved))
    .limit(1);

  if (!idea) notFound();

  const [brief] = await db
    .select({
      id: briefs.id,
      objective: briefs.objective,
      hypothesis: briefs.hypothesis,
      audience: briefs.audience,
      promise: briefs.promise,
      screens: briefs.screens,
      features: briefs.features,
      landingCopy: briefs.landingCopy,
      metrics: briefs.metrics,
      limitations: briefs.limitations,
      createdAt: briefs.createdAt,
    })
    .from(briefs)
    .where(eq(briefs.ideaId, idea.id))
    .limit(1);

  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Brief MVP</h1>
        <p className="text-sm text-muted-foreground">
          Ideia: {idea.name} ({idea.status})
        </p>
      </header>

      {!brief ? (
        <section className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
          Brief disponível somente após aprovação e geração. A geração sob demanda chega em F4.
          <div className="mt-2">
            <Link href={`/ideias/${idea.id}`} className="text-primary hover:underline">
              Voltar para detalhe da ideia
            </Link>
          </div>
        </section>
      ) : (
        <section className="space-y-3 rounded-xl border bg-card p-4">
          <p>
            <strong>Objetivo:</strong> {brief.objective}
          </p>
          <p>
            <strong>Hipótese:</strong> {brief.hypothesis}
          </p>
          <p>
            <strong>Audiência:</strong> {brief.audience}
          </p>
          <p>
            <strong>Promessa:</strong> {brief.promise}
          </p>
          <pre className="max-h-96 overflow-auto rounded border bg-muted/40 p-3 text-xs">
            {JSON.stringify(
              {
                screens: brief.screens,
                features: brief.features,
                landingCopy: brief.landingCopy,
                metrics: brief.metrics,
                limitations: brief.limitations,
              },
              null,
              2,
            )}
          </pre>
        </section>
      )}
    </main>
  );
}
