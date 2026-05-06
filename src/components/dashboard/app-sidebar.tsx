import { Button } from "@/components/ui/button";
import { NavGroup } from "./nav-group";
import { NAV_GROUPS } from "./nav-config";

type AppSidebarProps = {
  userEmail: string;
  signOutAction: () => Promise<void>;
};

export function AppSidebar({ userEmail, signOutAction }: AppSidebarProps) {
  return (
    <aside className="flex h-full w-[240px] flex-shrink-0 flex-col border-r border-border bg-muted/40">
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
          <div className="h-2 w-2 rounded-full bg-primary-foreground" />
        </div>
        <span className="text-sm font-semibold tracking-tight">GoMVP</span>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-3 py-2">
        {NAV_GROUPS.map((group) => (
          <NavGroup key={group.label} group={group} />
        ))}
      </div>

      <div className="space-y-3 border-t border-border p-4">
        <div className="flex items-center gap-2">
          <span className="flex-1 truncate text-xs text-muted-foreground">{userEmail}</span>
          <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
            DEV
          </span>
        </div>
        <form action={signOutAction}>
          <Button type="submit" variant="ghost" size="sm" className="w-full justify-start gap-2 px-2">
            <span className="inline-flex h-4 w-4 items-center justify-center text-xs">↗</span>
            Sair
          </Button>
        </form>
      </div>
    </aside>
  );
}
