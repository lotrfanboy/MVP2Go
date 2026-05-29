import { z } from "zod";

/** P-EVI-001 — extração estruturada para camada de evidências (F4A). */
export const PeviResultSchema = z.object({
  evidence_type: z.enum([
    "discussion_signal",
    "repeated_pain",
    "workaround_signal",
    "alternative_request",
  ]),
  summary: z.string().max(2000),
  pain_text: z.string().nullable(),
  desire_text: z.string().nullable(),
  audience_hint: z.string().nullable(),
  quote_excerpt: z.string().nullable(),
  strength: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1),
  axes_json: z.record(z.unknown()).optional(),
  language: z.enum(["pt", "en", "other"]),
});

export const P_EVI_001 = {
  name: "P-EVI-001",
  version: "001",
  content: `You extract atomic evidence from a public discussion (e.g. HN). Output strict JSON only.

Return fields:
- evidence_type: one of discussion_signal | repeated_pain | workaround_signal | alternative_request
- summary: 1-3 sentences in the item language
- pain_text: explicit pain/complaint if any, else null
- desire_text: desired outcome/alternative if any, else null
- audience_hint: who suffers (short), else null
- quote_excerpt: short literal quote if useful, else null
- strength: 0-1 signal strength
- confidence: 0-1 in your extraction
- axes_json: optional small object with partial axis hints
- language: pt | en | other

Context:
<<<SOURCE_KEY>>> <<<SOURCE_REF>>>
<<<RAW_TEXT>>>`,
} as const;
