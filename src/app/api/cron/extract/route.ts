import { NextResponse, type NextRequest } from "next/server";
import { BudgetExceededError } from "@/ai/budget";
import { runEmbed } from "@/pipeline/embed";
import { runExtract } from "@/pipeline/extract";
import { requireEnv } from "@/lib/env";
import { withRun } from "@/lib/runs";

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

  const manualOverride = request.nextUrl.searchParams.get("manualOverride") === "true";
  const triggeredBy = (request.nextUrl.searchParams.get("triggeredBy") ?? "cron") === "manual" ? "manual" : "cron";
  const limitRaw = Number(request.nextUrl.searchParams.get("limit") ?? "20");
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(Math.floor(limitRaw), 1), 100) : 20;

  try {
    const run = await withRun({ kind: "extract", triggeredBy }, async ({ runId }) => {
      const extract = await runExtract({ runId, triggeredBy, manualOverride, limit });
      const embed = await runEmbed({ runId, triggeredBy, manualOverride });
      const costUsd = extract.costUsd + embed.costUsd;
      return {
        data: { extract, embed },
        itemsIn: extract.processed,
        itemsOut: embed.embedded,
        costUsd,
      };
    });

    return NextResponse.json({ ok: true, runId: run.runId, stats: run.data, costUsd: run.costUsd });
  } catch (error: unknown) {
    if (error instanceof BudgetExceededError) {
      return NextResponse.json(
        { ok: false, error: error.message, status: error.status, ratio: error.ratio },
        { status: 429 },
      );
    }
    const message = error instanceof Error ? error.message : "extract_failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
