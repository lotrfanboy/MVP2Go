export type NavItemConfig = {
  label: string;
  href: string;
  icon: string;
};

export type NavGroupConfig = {
  label: string;
  items: NavItemConfig[];
};

export const NAV_GROUPS: NavGroupConfig[] = [
  {
    label: "Operação",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "D" },
      { label: "Ranking", href: "/ranking", icon: "R" },
      { label: "Filtradas", href: "/filtradas", icon: "F" },
      { label: "Brief MVP", href: "/brief/latest", icon: "B" },
    ],
  },
  {
    label: "Pipeline",
    items: [
      { label: "Sinais", href: "/sinais", icon: "S" },
      { label: "Clusters", href: "/clusters", icon: "C" },
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
