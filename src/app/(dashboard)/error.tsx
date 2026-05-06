"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="space-y-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
      <h1 className="text-xl font-semibold tracking-tight text-destructive">Falha ao carregar painel</h1>
      <p className="text-sm text-destructive/90">
        Não foi possível carregar os dados do dashboard agora. Tente novamente.
      </p>
      <p className="text-xs text-destructive/80">{error.message}</p>
      <button type="button" onClick={reset} className="rounded-md border px-3 py-2 text-sm hover:bg-background/60">
        Tentar novamente
      </button>
    </main>
  );
}
