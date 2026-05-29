import { and, gte, isNotNull } from "drizzle-orm";
import { getDb } from "@/db";
import { evidences, trendCandidates } from "@/db/schema";
import { clamp01, loadF4Weights } from "@/motor/f4-weights";

const WINDOWS: { kind: "24h" | "7d" | "14d" | "30d"; ms: number }[] = [
  { kind: "24h", ms: 24 * 3600 * 1000 },
  { kind: "7d", ms: 7 * 24 * 3600 * 1000 },
  { kind: "14d", ms: 14 * 24 * 3600 * 1000 },
  { kind: "30d", ms: 30 * 24 * 3600 * 1000 },
];

const EXTERNAL_KEYS = new Set(["hn", "gtrends", "ph", "reddit", "youtube", "reviews"]);

/**
 * Recomputes `trend_candidates` from `evidences` (rolling windows from now).
 */
export async function runTrendEngine(): Promise<{ rows: number }> {
  const db = getDb();
  const w = await loadF4Weights();
  const now = Date.now();

  const oldestMs = WINDOWS[WINDOWS.length - 1]?.ms ?? 30 * 24 * 3600 * 1000;
  const evRows = await db
    .select({
      topicKey: evidences.topicKey,
      topicLabel: evidences.topicLabel,
      market: evidences.market,
      language: evidences.language,
      observedAt: evidences.observedAt,
      sourceKey: evidences.sourceKey,
    })
    .from(evidences)
    .where(and(isNotNull(evidences.topicKey), gte(evidences.observedAt, new Date(now - oldestMs))));

  const groups = new Map<
    string,
    { topicKey: string; topicLabel: string; market: string; language: string; items: typeof evRows }
  >();
  for (const r of evRows) {
    const tk = r.topicKey ?? "unknown";
    const key = `${tk}::${r.market}`;
    const g = groups.get(key);
    const label = r.topicLabel ?? tk;
    if (g) {
      g.items.push(r);
      if (g.topicLabel.length < label.length) g.topicLabel = label;
    } else {
      groups.set(key, {
        topicKey: tk,
        topicLabel: label,
        market: r.market,
        language: r.language,
        items: [r],
      });
    }
  }

  await db.delete(trendCandidates);

  let rows = 0;
  for (const g of groups.values()) {
    for (const win of WINDOWS) {
      const start = new Date(now - win.ms);
      const slice = g.items.filter((i) => i.observedAt.getTime() >= start.getTime());
      if (slice.length === 0) continue;

      const count = slice.length;
      const latest = Math.max(...slice.map((i) => i.observedAt.getTime()));
      const recency = clamp01(1 - (now - latest) / win.ms);
      const frequency = clamp01(count / 24);
      const extSources = new Set(slice.map((s) => s.sourceKey).filter((k) => EXTERNAL_KEYS.has(k)));
      const sourceDiversity = clamp01(extSources.size / 5);

      let acceleration = 0.3;
      if (win.kind === "24h") {
        const longer = g.items.filter((i) => i.observedAt.getTime() >= now - 7 * 24 * 3600 * 1000).length;
        acceleration = clamp01(count / Math.max(1, longer / 7));
      }

      let persistence = 0;
      for (const wn of WINDOWS) {
        const st = new Date(now - wn.ms);
        if (g.items.some((i) => i.observedAt.getTime() >= st.getTime())) persistence += 0.25;
      }

      const trendScore = clamp01(
        w.f4_trend_recency_w * recency +
          w.f4_trend_frequency_w * frequency +
          w.f4_trend_acceleration_w * acceleration +
          w.f4_trend_persistence_w * persistence +
          w.f4_trend_diversity_w * sourceDiversity,
      );

      await db.insert(trendCandidates).values({
        topicKey: g.topicKey,
        topicLabel: g.topicLabel,
        market: g.market,
        language: g.language,
        windowKind: win.kind,
        trendScore: String(trendScore),
        recency: String(recency),
        frequency: String(frequency),
        acceleration: String(acceleration),
        persistence: String(persistence),
        sourceDiversity: String(sourceDiversity),
        evidenceCount: count,
        computedAt: new Date(),
      });
      rows += 1;
    }
  }

  return { rows };
}
