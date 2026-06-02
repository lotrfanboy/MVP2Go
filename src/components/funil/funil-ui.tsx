import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import { AlertTriangle, ArrowRight, ChevronDown, Database, ExternalLink, Info, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export type NoticeTone = "info" | "warning" | "danger" | "success";

export function numberFromDb(value: string | number | null | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatScore(value: string | number | null | undefined): string {
  return numberFromDb(value).toFixed(2);
}

export function formatDateShort(value: Date | string | null | undefined): string {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

export function truncateText(value: string | null | undefined, max = 180): string {
  if (!value) return "-";
  return value.length > max ? `${value.slice(0, max - 1)}\u2026` : value;
}

const GATE_META: Record<string, { label: string; description: string; tone: NoticeTone }> = {
  trend_only: {
    label: "Tendencia sem dor",
    description: "Ha movimento, mas o motor ainda nao encontrou dor suficiente.",
    tone: "warning",
  },
  watch: {
    label: "Em observacao",
    description: "Vale monitorar antes de promover.",
    tone: "info",
  },
  weak_signal: {
    label: "Sinal fraco",
    description: "Existe algum sinal, mas ele ainda nao sustenta investigacao forte.",
    tone: "warning",
  },
  pain_candidate: {
    label: "Dor candidata",
    description: "Ha dor, mas falta confianca externa ou clareza operacional.",
    tone: "info",
  },
  opportunity_candidate: {
    label: "Oportunidade candidata",
    description: "O motor encontrou uma combinacao inicial de dor, publico e viabilidade.",
    tone: "success",
  },
  qualified_opportunity: {
    label: "Oportunidade qualificada",
    description: "Candidata forte para avaliacao humana, ainda sem validacao real de mercado.",
    tone: "success",
  },
  approved_opportunity: {
    label: "Aprovada",
    description: "Aprovada pelo operador para a etapa futura de ideias.",
    tone: "success",
  },
  rejected: {
    label: "Rejeitada",
    description: "Bloqueada por regra, risco, baixa evidencia ou decisao do operador.",
    tone: "danger",
  },
  snoozed: {
    label: "Adiada",
    description: "Boa para revisitar depois, sem ocupar o topo agora.",
    tone: "info",
  },
};

const SOURCE_META: Record<string, { label: string; description: string; external: boolean }> = {
  hn: {
    label: "HN",
    description: "Discussao publica e sinal de early adopters.",
    external: true,
  },
  gtrends: {
    label: "Google Trends",
    description: "Interesse de busca e momentum; nao prova dor sozinho.",
    external: true,
  },
  ph: {
    label: "Product Hunt",
    description: "Oferta/solucao surgindo no nicho.",
    external: true,
  },
  reddit: {
    label: "Reddit",
    description: "Dor repetida em comunidades.",
    external: true,
  },
  youtube: {
    label: "YouTube",
    description: "Demanda de conteudo e linguagem do publico.",
    external: true,
  },
  reviews: {
    label: "Reviews",
    description: "Fraqueza de concorrentes e reclamacoes.",
    external: true,
  },
  manual: {
    label: "Manual",
    description: "Semente interna; nao aumenta confianca externa.",
    external: false,
  },
  watch: {
    label: "Watch",
    description: "Tema monitorado; nao aumenta confianca externa.",
    external: false,
  },
};

const EVIDENCE_TYPE_META: Record<string, string> = {
  discussion_signal: "Discussao",
  repeated_pain: "Dor repetida",
  manual_seed: "Semente manual",
  workaround_signal: "Gambiarra/workaround",
  alternative_request: "Pedido de alternativa",
  search_momentum: "Momentum de busca",
  solution_supply: "Oferta de solucao",
  content_demand: "Demanda de conteudo",
  competitor_weakness: "Fraqueza concorrente",
  pricing_complaint: "Reclamacao de preco",
  process_manual_work: "Trabalho manual",
};

export function gateMeta(gate: string) {
  return GATE_META[gate] ?? { label: gate, description: "Estado tecnico do motor.", tone: "info" as const };
}

export function sourceMeta(sourceKey: string) {
  return SOURCE_META[sourceKey] ?? { label: sourceKey, description: "Fonte ainda sem descricao.", external: true };
}

export function evidenceTypeLabel(type: string) {
  return EVIDENCE_TYPE_META[type] ?? type;
}

function toneClasses(tone: NoticeTone) {
  switch (tone) {
    case "danger":
      return "border-red-500/35 bg-red-500/10 text-red-100";
    case "success":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-100";
    case "warning":
      return "border-amber-500/35 bg-amber-500/10 text-amber-100";
    default:
      return "border-cyan-500/25 bg-cyan-500/10 text-cyan-100";
  }
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3 border-b border-border/70 pb-5 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? <p className="mb-2 text-[11px] font-semibold uppercase text-violet-300/90">{eyebrow}</p> : null}
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-foreground">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action ? <div className="flex-shrink-0">{action}</div> : null}
    </header>
  );
}

export function MetricCard({
  label,
  value,
  helper,
  href,
}: {
  label: string;
  value: ReactNode;
  helper?: ReactNode;
  href?: string;
}) {
  const body = (
    <div className="rounded-lg border border-border/80 bg-card/80 p-4 shadow-[0_1px_0_hsl(0_0%_100%/0.03)] transition-colors hover:border-violet-400/30">
      <div className="text-[11px] font-semibold uppercase text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-foreground">{value}</div>
      {helper ? <div className="mt-2 text-xs leading-5 text-muted-foreground">{helper}</div> : null}
    </div>
  );

  return href ? (
    <Link href={href as Route} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300">
      {body}
    </Link>
  ) : (
    body
  );
}

export function StatusBadge({ value }: { value: string }) {
  const meta = gateMeta(value);
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium", toneClasses(meta.tone))}>
      {meta.label}
    </span>
  );
}

export function SourceBadge({ sourceKey }: { sourceKey: string }) {
  const meta = sourceMeta(sourceKey);
  return (
    <span
      title={meta.description}
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        meta.external
          ? "border-violet-400/30 bg-violet-500/10 text-violet-100"
          : "border-slate-500/35 bg-slate-500/10 text-slate-200",
      )}
    >
      {meta.label}
    </span>
  );
}

export function ScoreBar({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number | null | undefined;
  helper?: string;
}) {
  const numeric = Math.max(0, Math.min(1, numberFromDb(value)));
  const width = `${Math.round(numeric * 100)}%`;
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-medium text-muted-foreground">{label}</span>
        <span className="font-mono text-foreground">{formatScore(value)}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-violet-400" style={{ width }} />
      </div>
      {helper ? <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{helper}</p> : null}
    </div>
  );
}

export function InsightNotice({
  tone = "info",
  title,
  children,
}: {
  tone?: NoticeTone;
  title: string;
  children: ReactNode;
}) {
  const Icon = tone === "danger" ? ShieldAlert : tone === "warning" ? AlertTriangle : Info;
  return (
    <div className={cn("rounded-lg border px-4 py-3 text-sm shadow-[0_1px_0_hsl(0_0%_100%/0.03)]", toneClasses(tone))}>
      <div className="flex gap-3">
        <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <div>
          <div className="font-medium">{title}</div>
          <div className="mt-1 leading-6 text-muted-foreground">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-border/80 bg-card/55 p-6 text-center">
      <Database aria-hidden="true" className="mx-auto h-5 w-5 text-muted-foreground" />
      <h3 className="mt-3 text-sm font-medium text-foreground">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref as Route}
          className="mt-4 inline-flex items-center gap-2 rounded-sm text-sm font-medium text-violet-200 hover:text-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
        >
          {actionLabel}
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}

export function JsonPreview({ value, maxHeight = "max-h-36" }: { value: unknown; maxHeight?: string }) {
  const text = JSON.stringify(value ?? {}, null, 2);
  return (
    <pre className={cn(maxHeight, "overflow-auto rounded-md border border-border bg-background/60 p-3 font-mono text-[11px] text-muted-foreground")}>
      {text.length > 900 ? `${text.slice(0, 897)}\u2026` : text}
    </pre>
  );
}

export type EvidenceTraceItem = {
  id: string;
  sourceKey: string;
  sourceRef: string | null;
  evidenceType: string;
  topicKey: string | null;
  topicLabel: string | null;
  observedAt: Date | string;
  summary: string | null;
  painText: string | null;
  audienceHint: string | null;
  quoteExcerpt?: string | null;
  strength: string | number;
  confidence: string | number;
  metricsJson: unknown;
  metadataJson: unknown;
  blacklistTags: string[];
  manualInputId?: string | null;
  watchTopicId?: string | null;
};

export function EvidenceTraceList({ items, showJson = false }: { items: EvidenceTraceItem[]; showJson?: boolean }) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="Sem evidencias vinculadas"
        description="O motor ainda nao ligou evidencias a este item. Reprocesse a camada de evidencias antes de interpretar o score."
      />
    );
  }

  return (
    <div className="space-y-3">
      {items.map((ev) => (
        <article key={ev.id} className="rounded-lg border border-border/80 bg-card/80 p-4 shadow-[0_1px_0_hsl(0_0%_100%/0.03)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <SourceBadge sourceKey={ev.sourceKey} />
                <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {evidenceTypeLabel(ev.evidenceType)}
                </span>
                {ev.sourceKey === "manual" || ev.sourceKey === "watch" ? (
                  <span className="rounded-full border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-100">
                    seed interna
                  </span>
                ) : null}
                {ev.blacklistTags.length > 0 ? (
                  <span className="rounded-full border border-red-500/35 bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-100">
                    {ev.blacklistTags.join(", ")}
                  </span>
                ) : null}
              </div>
              <h3 className="mt-3 text-sm font-medium text-foreground">
                {ev.topicLabel ?? ev.topicKey ?? "Topico sem rotulo"}
              </h3>
              {ev.topicKey ? <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">{ev.topicKey}</p> : null}
            </div>
            <div className="text-xs text-muted-foreground">{formatDateShort(ev.observedAt)}</div>
          </div>

          <div className="mt-3 grid gap-3 text-sm md:grid-cols-3">
            <div className="md:col-span-2">
              <p className="leading-6 text-muted-foreground">{truncateText(ev.summary, 320)}</p>
              {ev.quoteExcerpt ? <p className="mt-2 border-l border-violet-400/40 pl-3 text-muted-foreground">{ev.quoteExcerpt}</p> : null}
            </div>
            <div className="space-y-2 rounded-md border border-border/80 bg-background/35 p-3 text-xs text-muted-foreground">
              <div>Forca: <span className="font-mono text-foreground">{formatScore(ev.strength)}</span></div>
              <div>Parse conf.: <span className="font-mono text-foreground">{formatScore(ev.confidence)}</span></div>
              <div>Dor: <span className="text-foreground">{truncateText(ev.painText, 90)}</span></div>
              <div>Publico: <span className="text-foreground">{truncateText(ev.audienceHint, 90)}</span></div>
            </div>
          </div>

          {(!ev.painText || !ev.audienceHint) ? (
            <div className="mt-3 rounded-md border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs leading-5 text-amber-100">
              {ev.painText ? "Publico ainda pouco claro." : ev.audienceHint ? "Dor ainda pouco clara." : "Dor e publico ainda pouco claros."}
            </div>
          ) : null}

          {showJson ? (
            <details className="group/tech mt-3 rounded-md border border-border/80 bg-background/30">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300">
                <span>Ver detalhes tecnicos</span>
                <ChevronDown aria-hidden="true" className="h-3.5 w-3.5 transition-transform group-open/tech:rotate-180" />
              </summary>
              <div className="border-t border-border/70 p-3">
                <div className="mb-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {ev.sourceRef ? (
                    <a
                      href={ev.sourceRef}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-sm text-violet-200 hover:text-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
                    >
                      Abrir fonte
                      <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
                    </a>
                  ) : null}
                  <span className="font-mono">evidence_id={ev.id}</span>
                  {ev.manualInputId ? <span className="font-mono">manual_input_id={ev.manualInputId}</span> : null}
                  {ev.watchTopicId ? <span className="font-mono">watch_topic_id={ev.watchTopicId}</span> : null}
                </div>
                <div className="grid gap-3 lg:grid-cols-2">
                  <JsonPreview value={ev.metricsJson} />
                  <JsonPreview value={ev.metadataJson} />
                </div>
              </div>
            </details>
          ) : null}
        </article>
      ))}
    </div>
  );
}
