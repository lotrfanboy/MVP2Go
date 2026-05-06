import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/dashboard/app-shell";
import { getDb } from "@/db";
import { costBudgets } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  async function signOutAction() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const monthKey = monthStart.toISOString().slice(0, 10);

  const db = getDb();
  let budget:
    | {
        currentSpendUsd: string;
        monthlyBudgetUsd: string;
      }
    | undefined;

  try {
    [budget] = await db
      .select({
        currentSpendUsd: costBudgets.currentSpendUsd,
        monthlyBudgetUsd: costBudgets.monthlyBudgetUsd,
      })
      .from(costBudgets)
      .where(eq(costBudgets.periodMonth, monthKey))
      .orderBy(desc(costBudgets.updatedAt))
      .limit(1);
  } catch {
    budget = undefined;
  }

  const currentSpendUsd = Number(budget?.currentSpendUsd ?? 0);
  const monthlyBudgetUsd = Number(budget?.monthlyBudgetUsd ?? 50);

  return (
    <AppShell
      userEmail={user.email ?? "operador@built2go.com"}
      currentSpendUsd={currentSpendUsd}
      monthlyBudgetUsd={monthlyBudgetUsd}
      signOutAction={signOutAction}
    >
      {children}
    </AppShell>
  );
}
