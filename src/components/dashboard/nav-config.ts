export type NavItemConfig = {
  label: string;
  href: string;
  icon: string;
  /** Marca rotas do fluxo legado (F2/F3) conforme F4A. */
  legacy?: boolean;
};

export type NavGroupConfig = {
  label: string;
  items: NavItemConfig[];
};

export const NAV_GROUPS: NavGroupConfig[] = [
  {
    label: "Funil",
    items: [
      { label: "Radar", href: "/funil/radar", icon: "◎" },
      { label: "Watch topics", href: "/funil/watch-topics", icon: "W" },
      { label: "Manual", href: "/funil/manual", icon: "M" },
      { label: "Tendências", href: "/funil/trends", icon: "T" },
      { label: "Need clusters", href: "/funil/need-clusters", icon: "N" },
      { label: "Oportunidades", href: "/funil/opportunities", icon: "O" },
      { label: "Fonte/confiança", href: "/funil/source-confidence", icon: "S" },
    ],
  },
  {
    label: "Operação (legado)",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "D", legacy: true },
      { label: "Ranking", href: "/ranking", icon: "R", legacy: true },
      { label: "Filtradas", href: "/filtradas", icon: "F", legacy: true },
      { label: "Brief MVP", href: "/brief/latest", icon: "B", legacy: true },
    ],
  },
  {
    label: "Pipeline (legado)",
    items: [
      { label: "Sinais", href: "/sinais", icon: "S", legacy: true },
      { label: "Clusters", href: "/clusters", icon: "C", legacy: true },
      { label: "Execuções", href: "/runs", icon: "E" },
    ],
  },
  {
    label: "Configuração",
    items: [
      { label: "Fontes", href: "/fontes", icon: "Fo" },
      { label: "Pesos", href: "/pesos", icon: "P" },
      { label: "Blacklist", href: "/blacklist", icon: "Bl" },
      { label: "Prompts", href: "/prompts", icon: "Pr" },
    ],
  },
  {
    label: "Sistema",
    items: [
      { label: "Custos", href: "/custos", icon: "$" },
      { label: "Configurações", href: "/configuracoes", icon: "Co" },
    ],
  },
];
