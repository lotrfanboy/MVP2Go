import { z } from "zod";

export const PoppResultSchema = z.object({
  launchability_score: z.number().min(0).max(1),
  risk_penalty: z.number().min(0).max(1),
  axis_notes: z.object({
    trend: z.string().optional(),
    pain: z.string().optional(),
    audience: z.string().optional(),
    source: z.string().optional(),
    launch: z.string().optional(),
  }),
  // Advisory only; the deterministic state machine still decides the gate.
  suggested_gate_hint: z
    .enum([
      "trend_only",
      "weak_signal",
      "pain_candidate",
      "opportunity_candidate",
      "qualified_opportunity",
    ])
    .optional()
    .catch(undefined),
});

export const P_OPP_001 = {
  name: "P-OPP-001",
  version: "001",
  content: `You evaluate a B2C microproduct opportunity for a solo/web-first operator. JSON only.

Constraints (IndieLab-style):
- Prefer narrow web utilities, calculators, light AI tools
- Penalize marketplaces, social networks, heavy integrations, enterprise, legal/med/fin risk, high support

Input:
<<<OPPORTUNITY_CONTEXT>>>

Return:
- launchability_score: 0..1
- risk_penalty: 0..1 (regulatory, support, integration, saturation)
- axis_notes: short strings per axis if relevant
- suggested_gate_hint: optional coarse gate suggestion`,
} as const;
