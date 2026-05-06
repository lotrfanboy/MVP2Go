"use client";

import { usePathname } from "next/navigation";
import type { NavItemConfig } from "./nav-config";

export function NavItem({ item }: { item: NavItemConfig }) {
  const pathname = usePathname();
  const isActive =
    pathname === item.href ||
    (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
  return (
    <a
      href={item.href}
      className={[
        "flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors",
        isActive
          ? "border-l-2 border-primary bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      ].join(" ")}
    >
      <span className="inline-flex h-4 w-4 items-center justify-center text-[10px] font-semibold">{item.icon}</span>
      <span className="truncate">{item.label}</span>
    </a>
  );
}
