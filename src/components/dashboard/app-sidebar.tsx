import Link from "next/link";
import type { Route } from "next";
import { Button } from "@/components/ui/button";
import { LogOut, Orbit } from "lucide-react";
import { NavGroup } from "./nav-group";
import { NAV_GROUPS } from "./nav-config";

const HOME_ROUTE = "/funil/radar" as Route;

type AppSidebarProps = {
  userEmail: string;
  signOutAction: () => Promise<void>;
};

export function AppSidebar({ userEmail, signOutAction }: AppSidebarProps) {
  return (
    <aside className="flex h-full w-[256px] flex-shrink-0 flex-col border-r border-border/80 bg-card/[0.88] shadow-[inset_-1px_0_0_hsl(var(--foreground)/0.03)] backdrop-blur-xl">
      <div className="border-b border-border/70 px-4 py-4">
        <Link
          href={HOME_ROUTE}
          className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-violet-400/25 bg-violet-400/10 text-violet-200 shadow-[0_0_0_1px_hsl(0_0%_100%/0.03)]">
            <Orbit aria-hidden="true" className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold tracking-tight">GoMVP</div>
            <div className="truncate text-[11px] text-muted-foreground">Opportunity intelligence</div>
          </div>
        </Link>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-3 py-4 [scrollbar-width:thin]">
        {NAV_GROUPS.map((group) => (
          <NavGroup key={group.label} group={group} />
        ))}
      </div>

      <div className="space-y-3 border-t border-border/70 p-4">
        <div className="flex items-center gap-2">
          <span className="flex-1 truncate text-xs text-muted-foreground">{userEmail}</span>
          <span className="rounded border border-border bg-muted/70 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            DEV
          </span>
        </div>
        <form action={signOutAction}>
          <Button type="submit" variant="ghost" size="sm" className="w-full justify-start gap-2 px-2">
            <LogOut aria-hidden="true" className="h-4 w-4" />
            Sair
          </Button>
        </form>
      </div>
    </aside>
  );
}
