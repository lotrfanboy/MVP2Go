export const P_CLU_001 = {
  name: "P-CLU-001",
  version: "001",
  content: `Voce recebe N sinais agrupados por similaridade semantica (mistura de pt e en).
Resuma o que une o cluster, sem inventar. Responda em portugues.

Schema:
{
  "label": string (3-6 palavras),
  "summary": string (1-3 frases),
  "common_pain": string|null,
  "common_audience": string|null,
  "topic_tags": string[],
  "coherence_score": number 0..1
}

Sinais:
<<<LIST_OF_SIGNALS_WITH_QUOTES>>>

Devolva apenas o JSON.`,
} as const;
