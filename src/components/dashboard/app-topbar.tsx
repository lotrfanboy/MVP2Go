"use client";

import { usePathname } from "next/navigation";
import { NAV_GROUPS } from "./nav-config";
import { BudgetPill } from "./budget-pill";

type AppTopbarProps = {
  currentSpendUsd: number;
  monthlyBudgetUsd: number;
};

const STATIC_LABELS: Record<string, { group: string; label: string }> = {
  "/ideias": { group: "Legado", label: "Detalhe da ideia" },
  "/brief": { group: "Legado", label: "Brief legado" },
};

function breadcrumbFromPath(pathname: string) {
  const item = NAV_GROUPS.flatMap((group) =>
    group.items.map((navItem) => ({ group: group.label, item: navItem })),
  )
    .filter(({ item }) => !item.disabled)
    .sort((a, b) => b.item.href.length - a.item.href.length)
    .find(({ item }) => pathname === item.href || pathname.startsWith(`${item.href}/`));

  if (item) return { group: item.group, label: item.item.label };

  const staticMatch = Object.entries(STATIC_LABELS).find(([href]) => pathname.startsWith(href));
  return staticMatch?.[1] ?? { group: "Operacao", label: "Dashboard" };
}

export function AppTopbar({ currentSpendUsd, monthlyBudgetUsd }: AppTopbarProps) {
  const pathname = usePathname();
  const breadcrumb = breadcrumbFromPath(pathname);

  return (
    <header className="flex h-[52px] min-h-[52px] items-center justify-between border-b border-border/70 bg-background/[0.72] px-6 backdrop-blur-xl lg:px-8">
      <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
        <span>{breadcrumb.group}</span>
        <span className="text-muted-foreground/45">/</span>
        <span className="truncate font-medium text-foreground">{breadcrumb.label}</span>
      </div>
      <div className="flex flex-shrink-0 items-center gap-3">
        <BudgetPill currentSpendUsd={currentSpendUsd} monthlyBudgetUsd={monthlyBudgetUsd} />
        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-violet-400/25 bg-violet-400/10 text-[11px] font-semibold text-violet-100">
          OP
        </div>
      </div>
    </header>
  );
}
