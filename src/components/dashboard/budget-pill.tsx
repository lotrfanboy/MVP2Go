import Link from "next/link";

type BudgetPillProps = {
  currentSpendUsd: number;
  monthlyBudgetUsd: number;
};

function formatUsd(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  }).format(value);
}

export function BudgetPill({ currentSpendUsd, monthlyBudgetUsd }: BudgetPillProps) {
  const ratio = monthlyBudgetUsd > 0 ? currentSpendUsd / monthlyBudgetUsd : 0;
  const ratioPercent = Math.max(0, ratio * 100);

  const dotClass =
    ratio >= 1 ? "bg-red-600" : ratio >= 0.9 ? "bg-red-500" : ratio >= 0.8 ? "bg-amber-500" : "bg-slate-400";

  return (
    <Link
      href="/custos"
      className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-[13px] font-medium hover:bg-accent"
    >
      <span className={["h-2 w-2 rounded-full", dotClass].join(" ")} />
      <span className="font-mono text-muted-foreground">
        {formatUsd(currentSpendUsd)} / {formatUsd(monthlyBudgetUsd)} ({ratioPercent.toFixed(1).replace(".", ",")}%)
      </span>
    </Link>
  );
}
