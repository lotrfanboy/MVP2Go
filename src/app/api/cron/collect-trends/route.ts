import { NextResponse, type NextRequest } from "next/server";
import { getDb } from "@/db";
import { requireEnv } from "@/lib/env";
import { withRun } from "@/lib/runs";
import { insertEvidence } from "@/motor/evidence-store";
import { collectGTrendsDiscovery } from "@/sources/gtrends/collector";
import { normalizeGTrendsEvidence } from "@/sources/gtrends/normalizer";
import type { GTrendsDiscoveryResult, GTrendsTableRunSummary } from "@/sources/gtrends/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest): boolean {
  const token = requireEnv("CRON_SECRET");
  return request.headers.get("authorization") === `Bearer ${token}`;
}

function parsePositiveInt(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
  return Math.floor(parsed);
}

type CollectTrendsStats = {
  status: GTrendsDiscoveryResult["status"];
  fetched: number;
  normalized: number;
  inserted: number;
  skipped: number;
  estimatedBytes: string | null;
  estimatedCostUsd: number | null;
  tables: GTrendsTableRunSummary[];
  errors: string[];
};

async function handleCollectTrends(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const dryRunOnly = searchParams.get("dryRun") === "true";
  const enabledParam = searchParams.get("enabled");
  const enabled =
    enabledParam === null ? undefined : enabledParam === "true" || enabledParam === "1";

  try {
    const run = await withRun<CollectTrendsStats>({ kind: "collect_trends", triggeredBy: "cron" }, async () => {
      const collected = await collectGTrendsDiscovery({
        enabled,
        countryCode: searchParams.get("countryCode") ?? undefined,
        regionName: searchParams.get("regionName") ?? undefined,
        refreshDate: searchParams.get("refreshDate") ?? undefined,
        maxRows: parsePositiveInt(searchParams.get("maxRows")),
        maximumBytesBilled: searchParams.get("maximumBytesBilled") ?? undefined,
        dryRunOnly,
      });

      if (collected.status !== "ok") {
        return {
          data: {
            status: collected.status,
            fetched: collected.fetched,
            normalized: 0,
            inserted: 0,
            skipped: 0,
            estimatedBytes: collected.estimatedBytes,
            estimatedCostUsd: collected.estimatedCostUsd,
            tables: collected.tables,
            errors: collected.errors,
          },
          itemsIn: collected.fetched,
          itemsOut: 0,
          costUsd: 0,
        };
      }

      const db = getDb();
      let normalized = 0;
      let inserted = 0;
      let skipped = 0;

      for (const payload of collected.payloads) {
        const evidence = normalizeGTrendsEvidence(payload);
        normalized += 1;
        const id = await insertEvidence(db, evidence);
        if (id) {
          inserted += 1;
        } else {
          skipped += 1;
        }
      }

      return {
        data: {
          status: collected.status,
          fetched: collected.fetched,
          normalized,
          inserted,
          skipped,
          estimatedBytes: collected.estimatedBytes,
          estimatedCostUsd: collected.estimatedCostUsd,
          tables: collected.tables,
          errors: collected.errors,
        },
        itemsIn: collected.fetched,
        itemsOut: inserted,
        costUsd: 0,
      };
    });

    return NextResponse.json({
      ok: true,
      runId: run.runId,
      stats: run.data,
      costUsd: run.costUsd,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "collect_trends_failed";
    return NextResponse.json({ ok: false, error: message.slice(0, 500) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return handleCollectTrends(request);
}

export async function GET(request: NextRequest) {
  return handleCollectTrends(request);
}
