export const P_BRF_001 = {
  name: "P-BRF-001",
  version: "001",
  content: `Voce e arquiteto de microprodutos B2C web-first.
Gere um brief de MVP para a ideia aprovada. Mantenha simplicidade, baixo suporte e LGPD.
Responda no idioma da ideia (pt ou en) sinalizado em "language".

Restricoes:
- 1 a 5 telas no MVP.
- Stack default: Next.js + Supabase + Tailwind + shadcn.
- Monetizacao compativel com baixo suporte.
- Sem dependencias instaveis. Sem scraping.

Ideia aprovada:
<<<IDEA_JSON>>>

Schema de saida JSON estrito:
{
  "language": "pt|en|other",
  "objective": string,
  "hypothesis": string,
  "audience": string,
  "promise": string,
  "screens": string[],
  "features": string[],
  "stack": {"frontend": string, "backend": string, "data": string, "ai": string|null},
  "landing_copy": {"hero": string, "subhero": string, "bullets": string[], "cta": string},
  "test_channels": string[],
  "metrics": {"north_star": string, "secondary": string[], "guardrails": string[]},
  "decision_criteria": {"kill": string, "iterate": string, "scale": string},
  "tech_risks": string[],
  "api_costs": string,
  "limitations": string[],
  "lgpd_notes": string
}

Devolva apenas o JSON.`,
} as const;
