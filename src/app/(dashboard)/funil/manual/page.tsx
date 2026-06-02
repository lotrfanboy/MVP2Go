import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { manualInputs } from "@/db/schema";
import { EmptyState, InsightNotice, PageHeader, formatDateShort } from "@/components/funil/funil-ui";
import { ManualInputForm } from "./manual-input-form";

export const dynamic = "force-dynamic";

export default async function ManualPage() {
  const db = getDb();
  let rows: typeof manualInputs.$inferSelect[] = [];
  let dbError = false;
  try {
    rows = await db.select().from(manualInputs).orderBy(desc(manualInputs.createdAt)).limit(20);
  } catch {
    dbError = true;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Investigacao sob demanda"
        title="Analise manual"
        description="Analise sob demanda. Cria seed auditavel, mas nao valida mercado sozinha nem aumenta source confidence externa."
      />

      {dbError ? (
        <InsightNotice title="Historico indisponivel" tone="warning">
          Nao consegui carregar os envios manuais recentes.
        </InsightNotice>
      ) : null}

      <InsightNotice title="O que observar" tone="info">
        Use para iniciar investigacao e depois confira se fontes externas retornam evidencias no mesmo tema.
      </InsightNotice>

      <ManualInputForm />

      <section className="rounded-lg border border-border/80 bg-card/80 p-4 shadow-[0_1px_0_hsl(0_0%_100%/0.03)]">
        <h2 className="text-sm font-semibold">Envios recentes</h2>
        {rows.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="Nenhum envio manual" description="Quando voce analisar um tema, ele aparece aqui como seed auditavel." />
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Tipo</th>
                  <th className="px-3 py-2 font-medium">Conteudo</th>
                  <th className="px-3 py-2 font-medium">Idioma</th>
                  <th className="px-3 py-2 font-medium">Criado</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-border/60">
                    <td className="px-3 py-2">{row.status}</td>
                    <td className="px-3 py-2">{row.inputKind}</td>
                    <td className="max-w-md truncate px-3 py-2 text-muted-foreground">{row.payload}</td>
                    <td className="px-3 py-2">{row.language}</td>
                    <td className="px-3 py-2 text-muted-foreground">{formatDateShort(row.createdAt)}</td>
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
