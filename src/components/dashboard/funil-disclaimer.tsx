export function FunilDisclaimer() {
  return (
    <div className="mb-6 rounded-md border border-amber-800/40 bg-amber-950/30 px-4 py-3 text-[13px] text-amber-100">
      <p className="font-medium text-amber-50">Lembrete do funil</p>
      <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
        <li>Score IA não é validação real.</li>
        <li>Opportunity ≠ MVP. Brief ≠ validação.</li>
      </ul>
    </div>
  );
}
