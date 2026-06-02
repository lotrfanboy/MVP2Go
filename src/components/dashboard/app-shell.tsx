import { AppSidebar } from "./app-sidebar";
import { AppTopbar } from "./app-topbar";

type AppShellProps = {
  userEmail: string;
  currentSpendUsd: number;
  monthlyBudgetUsd: number;
  signOutAction: () => Promise<void>;
  children: React.ReactNode;
};

export function AppShell({
  userEmail,
  currentSpendUsd,
  monthlyBudgetUsd,
  signOutAction,
  children,
}: AppShellProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <AppSidebar userEmail={userEmail} signOutAction={signOutAction} />
      <main className="flex min-w-0 flex-1 flex-col bg-background/[0.72]">
        <AppTopbar currentSpendUsd={currentSpendUsd} monthlyBudgetUsd={monthlyBudgetUsd} />
        <div className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-[1440px] px-6 py-6 lg:px-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
