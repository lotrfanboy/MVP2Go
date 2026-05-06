import type { NavGroupConfig } from "./nav-config";
import { NavItem } from "./nav-item";

export function NavGroup({ group }: { group: NavGroupConfig }) {
  return (
    <div>
      <h3 className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {group.label}
      </h3>
      <div className="space-y-1">
        {group.items.map((item) => (
          <NavItem key={item.href} item={item} />
        ))}
      </div>
    </div>
  );
}
