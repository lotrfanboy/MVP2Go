import type { NavGroupConfig } from "./nav-config";
import { NavItem } from "./nav-item";

export function NavGroup({ group }: { group: NavGroupConfig }) {
  const items = (
    <div className={group.compact ? "space-y-0.5 opacity-80" : "space-y-1"}>
      {group.items.map((item) => (
        <NavItem key={item.href} item={item} />
      ))}
    </div>
  );

  if (group.collapsed) {
    return (
      <details className="group/nav rounded-md" open={!group.collapsed}>
        <summary className="flex cursor-pointer list-none items-center justify-between rounded-md px-2 py-1.5 text-[11px] font-semibold uppercase text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300">
          <span>{group.label}</span>
          <span aria-hidden="true" className="text-[10px] transition-transform group-open/nav:rotate-90">
            ›
          </span>
        </summary>
        <div className="mt-1">{items}</div>
      </details>
    );
  }

  return (
    <section>
      <h3 className="mb-2 px-2 text-[11px] font-semibold uppercase text-muted-foreground/90">
        {group.label}
      </h3>
      {items}
    </section>
  );
}
