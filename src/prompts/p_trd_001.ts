import { z } from "zod";

export const PtrdResultSchema = z.object({
  topic_key: z.string(),
  topic_label: z.string(),
  summary: z.string().max(3000),
  why_now: z.string().max(1500),
  top_evidence_ids: z.array(z.string()).max(32),
});

export const P_TRD_001 = {
  name: "P-TRD-001",
  version: "001",
  content: `Summarize momentum for a topic from evidence summaries (same topic_key, one time window). JSON only.

Fields:
- topic_key, topic_label
- summary: why this topic is moving in this window
- why_now: 2-4 sentences
- top_evidence_ids: array of evidence UUIDs you consider strongest (from the list)

Evidence list:
<<<EVIDENCE_BLOBS>>>`,
} as const;
