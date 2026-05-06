import { NextResponse, type NextRequest } from "next/server";
import { collectAlgoliaHn } from "@/collectors/algolia-hn";
import { withRun } from "@/lib/runs";
import { requireEnv } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest): boolean {
  const token = requireEnv("CRON_SECRET");
  return request.headers.get("authorization") === `Bearer ${token}`;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const lookbackHours = Number(request.nextUrl.searchParams.get("lookbackHours") ?? 96);

    const run = await withRun({ kind: "collect_hn", triggeredBy: "cron" }, async () => {
      const stats = await collectAlgoliaHn({ lookbackHours });
      return {
        data: stats,
        itemsIn: stats.processed,
        itemsOut: stats.inserted,
        costUsd: 0,
      };
    });

    return NextResponse.json({ ok: true, runId: run.runId, stats: run.data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "collect_hn_failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
