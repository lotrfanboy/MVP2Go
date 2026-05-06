"use client";

import { usePathname } from "next/navigation";
import { BudgetPill } from "./budget-pill";

type AppTopbarProps = {
  currentSpendUsd: number;
  monthlyBudgetUsd: number;
};

function breadcrumbFromPath(pathname: string) {
  const first = pathname.split("/").filter(Boolean)[0] ?? "dashboard";
  const mapping: Record<string, string> = {
    dashboard: "Dashboard",
    ranking: "Ranking",
    ideias: "Detalhe da Ideia",
    filtradas: "Filtradas",
    sinais: "Sinais",
    clusters: "Clusters",
    runs: "Execuções",
    custos: "Custos",
    fontes: "Fontes",
    pesos: "Pesos",
    blacklist: "Blacklist",
    prompts: "Prompts",
    brief: "Brief MVP",
    configuracoes: "Configurações",
    coleta: "Coleta",
  };
  return mapping[first] ?? "Dashboard";
}

export function AppTopbar({ currentSpendUsd, monthlyBudgetUsd }: AppTopbarProps) {
  const pathname = usePathname();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Operação</span>
        <span>›</span>
        <span className="text-foreground">{breadcrumbFromPath(pathname)}</span>
      </div>
      <div className="flex items-center gap-4">
        <BudgetPill currentSpendUsd={currentSpendUsd} monthlyBudgetUsd={monthlyBudgetUsd} />
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          OP
        </div>
      </div>
    </header>
  );
}
