import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { evidences, opportunityCards } from "@/db/schema";

type OpportunityRow = typeof opportunityCards.$inferSelect;

type EvidenceAuditRow = {
  id: string;
  sourceKey: string;
  evidenceType: string;
  topicKey: string | null;
  topicLabel: string | null;
  observedAt: Date;
  strength: string;
  confidence: string;
  painText: string | null;
  audienceHint: string | null;
  metricsJson: unknown;
  metadataJson: unknown;
};

function formatDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function formatJsonPreview(value: unknown): string {
  const text = JSON.stringify(value ?? {}, null, 2);
  return text.length > 360 ? `${text.slice(0, 357)}...` : text;
}

export default async function SourceConfidencePage() {
  const db = getDb();
  let rows: OpportunityRow[] = [];
  let recentEvidences: EvidenceAuditRow[] = [];
  try {
    [rows, recentEvidences] = await Promise.all([
      db.select().from(opportunityCards).orderBy(desc(opportunityCards.opportunityScore)).limit(80),
      db
        .select({
          id: evidences.id,
          sourceKey: evidences.sourceKey,
          evidenceType: evidences.evidenceType,
          topicKey: evidences.topicKey,
          topicLabel: evidences.topicLabel,
          observedAt: evidences.observedAt,
          strength: evidences.strength,
          confidence: evidences.confidence,
          painText: evidences.painText,
          audienceHint: evidences.audienceHint,
          metricsJson: evidences.metricsJson,
          metadataJson: evidences.metadataJson,
        })
        .from(evidences)
        .orderBy(desc(evidences.observedAt))
        .limit(60),
    ]);
  } catch {
    rows = [];
    recentEvidences = [];
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Fonte & confiança</h1>
        <p className="text-sm text-muted-foreground">
          `source_confidence` deriva de fontes externas distintas. Manual e watch aparecem como rastreio,
          mas não elevam a contagem externa.
        </p>
      </div>

      <div className="rounded-lg border border-border">
        <table className="w-full border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-3 py-2 font-medium">Oportunidade</th>
              <th className="px-3 py-2 font-medium">source_confidence</th>
              <th className="px-3 py-2 font-medium">Fontes (#)</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-3 py-6 text-center text-muted-foreground">
                  Sem dados.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-border/60">
                  <td className="px-3 py-2">
                    <a className="text-primary hover:underline" href={`/funil/opportunities/${r.id}`}>
                      {r.topicLabel}
                    </a>
                  </td>
                  <td className="px-3 py-2 tabular-nums">{r.sourceConfidence}</td>
                  <td className="px-3 py-2 tabular-nums">{r.sourceCount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <section className="space-y-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Evidências recentes</h2>
          <p className="text-sm text-muted-foreground">
            Auditoria genérica da camada `evidences`, independente da origem. Use esta tabela para conferir
            `source_key`, `evidence_type`, tópico, métricas e metadados antes de interpretar qualquer score.
          </p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="min-w-[1200px] border-collapse text-left text-[12px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-3 py-2 font-medium">Fonte</th>
                <th className="px-3 py-2 font-medium">Tipo</th>
                <th className="px-3 py-2 font-medium">Tópico</th>
                <th className="px-3 py-2 font-medium">Observado</th>
                <th className="px-3 py-2 font-medium">Força</th>
                <th className="px-3 py-2 font-medium">Dor</th>
                <th className="px-3 py-2 font-medium">Audiência</th>
                <th className="px-3 py-2 font-medium">Métricas / metadata</th>
              </tr>
            </thead>
            <tbody>
              {recentEvidences.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-muted-foreground">
                    Sem evidências recentes.
                  </td>
                </tr>
              ) : (
                recentEvidences.map((evidence) => (
                  <tr key={evidence.id} className="border-b border-border/60 align-top">
                    <td className="px-3 py-2">
                      <span className="rounded bg-muted px-2 py-1 font-mono text-[11px]">
                        {evidence.sourceKey}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-[11px]">{evidence.evidenceType}</td>
                    <td className="max-w-[220px] px-3 py-2">
                      <div className="font-medium">{evidence.topicLabel ?? evidence.topicKey ?? "Sem tópico"}</div>
                      {evidence.topicKey ? (
                        <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                          {evidence.topicKey}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 tabular-nums">{formatDate(evidence.observedAt)}</td>
                    <td className="px-3 py-2 tabular-nums">
                      {evidence.strength}
                      <div className="text-muted-foreground">conf {evidence.confidence}</div>
                    </td>
                    <td className="max-w-[180px] px-3 py-2 text-muted-foreground">
                      {evidence.painText ?? "-"}
                    </td>
                    <td className="max-w-[180px] px-3 py-2 text-muted-foreground">
                      {evidence.audienceHint ?? "-"}
                    </td>
                    <td className="px-3 py-2">
                      <div className="grid gap-2 lg:grid-cols-2">
                        <pre className="max-h-40 overflow-auto rounded bg-muted p-2 font-mono text-[11px]">
                          {formatJsonPreview(evidence.metricsJson)}
                        </pre>
                        <pre className="max-h-40 overflow-auto rounded bg-muted p-2 font-mono text-[11px]">
                          {formatJsonPreview(evidence.metadataJson)}
                        </pre>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
