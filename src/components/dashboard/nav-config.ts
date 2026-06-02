export type NavIconName =
  | "activity"
  | "archive"
  | "badge"
  | "brain"
  | "database"
  | "dollar"
  | "file"
  | "filter"
  | "gauge"
  | "layers"
  | "lightbulb"
  | "list"
  | "radar"
  | "search"
  | "settings"
  | "shield"
  | "sliders"
  | "spark"
  | "target"
  | "trend";

export type NavItemConfig = {
  label: string;
  href: string;
  icon: NavIconName;
  legacy?: boolean;
  badge?: string;
  disabled?: boolean;
};

export type NavGroupConfig = {
  label: string;
  compact?: boolean;
  collapsed?: boolean;
  secondary?: boolean;
  items: NavItemConfig[];
};

export const NAV_GROUPS: NavGroupConfig[] = [
  {
    label: "Principal",
    items: [
      { label: "Radar", href: "/funil/radar", icon: "radar" },
      { label: "Oportunidades", href: "/funil/opportunities", icon: "target" },
    ],
  },
  {
    label: "Funil",
    items: [
      { label: "Evidencias", href: "/funil/source-confidence", icon: "database" },
      { label: "Tendencias", href: "/funil/trends", icon: "trend" },
      { label: "Dores agrupadas", href: "/funil/need-clusters", icon: "layers" },
      { label: "Analise manual", href: "/funil/manual", icon: "search" },
      { label: "Topicos monitorados", href: "/funil/watch-topics", icon: "list" },
    ],
  },
  {
    label: "Execucao",
    items: [
      { label: "Ideias", href: "/funil/ideas", icon: "lightbulb", badge: "F4C", disabled: true },
      { label: "Briefs MVP", href: "/funil/briefs", icon: "file", badge: "F4C", disabled: true },
    ],
  },
  {
    label: "Sistema/Admin",
    collapsed: true,
    secondary: true,
    items: [
      { label: "Fontes", href: "/fontes", icon: "badge" },
      { label: "Execucoes", href: "/runs", icon: "activity" },
      { label: "Custos IA", href: "/custos", icon: "dollar" },
      { label: "Regras / Blacklist", href: "/blacklist", icon: "shield" },
      { label: "Pesos", href: "/pesos", icon: "sliders" },
      { label: "Prompts", href: "/prompts", icon: "brain" },
      { label: "Configuracoes", href: "/configuracoes", icon: "settings" },
    ],
  },
  {
    label: "Legado",
    compact: true,
    collapsed: true,
    secondary: true,
    items: [
      { label: "Dashboard F3", href: "/dashboard", icon: "gauge", legacy: true },
      { label: "Ranking de ideias", href: "/ranking", icon: "spark", legacy: true },
      { label: "Filtradas", href: "/filtradas", icon: "filter", legacy: true },
      { label: "Sinais", href: "/sinais", icon: "activity", legacy: true },
      { label: "Clusters F2", href: "/clusters", icon: "layers", legacy: true },
      { label: "Brief legado", href: "/brief/latest", icon: "file", legacy: true },
      { label: "Coleta raw", href: "/coleta", icon: "archive", legacy: true },
    ],
  },
];
