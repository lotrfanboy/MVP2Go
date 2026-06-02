"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import {
  Activity,
  Archive,
  BadgeCheck,
  Brain,
  CircleSlash,
  Database,
  DollarSign,
  FileText,
  Filter,
  Gauge,
  Layers,
  Lightbulb,
  ListChecks,
  Radar,
  Search,
  Settings,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Target,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import type { NavIconName, NavItemConfig } from "./nav-config";

const ICONS: Record<NavIconName, LucideIcon> = {
  activity: Activity,
  archive: Archive,
  badge: BadgeCheck,
  brain: Brain,
  database: Database,
  dollar: DollarSign,
  file: FileText,
  filter: Filter,
  gauge: Gauge,
  layers: Layers,
  lightbulb: Lightbulb,
  list: ListChecks,
  radar: Radar,
  search: Search,
  settings: Settings,
  shield: Shield,
  sliders: SlidersHorizontal,
  spark: Sparkles,
  target: Target,
  trend: TrendingUp,
};

export function NavItem({ item }: { item: NavItemConfig }) {
  const pathname = usePathname();
  const Icon = item.disabled ? CircleSlash : ICONS[item.icon];
  const isActive =
    pathname === item.href ||
    (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

  if (item.disabled) {
    return (
      <div className="flex cursor-not-allowed items-center gap-2 rounded-md px-2 py-1.5 text-[12px] font-medium text-muted-foreground/55">
        <Icon aria-hidden="true" className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="truncate">{item.label}</span>
        {item.badge ? (
          <span className="ml-auto rounded border border-border px-1.5 py-0.5 text-[9px] font-semibold uppercase text-muted-foreground">
            {item.badge}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <Link
      href={item.href as Route}
      className={[
        "group flex min-w-0 items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300",
        isActive
          ? "border-violet-400/30 bg-violet-400/10 text-foreground shadow-[inset_2px_0_0_hsl(264_84%_68%/0.72)]"
          : item.legacy
            ? "text-muted-foreground/55 hover:border-border/70 hover:bg-muted/45 hover:text-muted-foreground"
            : "text-muted-foreground hover:border-border/80 hover:bg-muted/55 hover:text-foreground",
      ].join(" ")}
    >
      <Icon
        aria-hidden="true"
        className={[
          "h-3.5 w-3.5 flex-shrink-0",
          isActive ? "text-violet-300" : "text-muted-foreground group-hover:text-foreground",
        ].join(" ")}
      />
      <span className="truncate">{item.label}</span>
      {item.badge || item.legacy ? (
        <span className="ml-auto rounded border border-border bg-background/60 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-muted-foreground">
          {item.badge ?? "Legado"}
        </span>
      ) : null}
    </Link>
  );
}
