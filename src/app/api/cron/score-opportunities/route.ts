import { NextResponse, type NextRequest } from "next/server";
import { BudgetExceededError } from "@/ai/budget";
import { requireEnv } from "@/lib/env";
import { withRun } from "@/lib/runs";
import { runScoreOpportunitiesPipeline } from "@/motor/run-score-opportunities";

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

  const triggeredBy =
    (request.nextUrl.searchParams.get("triggeredBy") ?? "cron") === "manual" ? "manual" : "cron";
  const manualOverride = request.nextUrl.searchParams.get("manualOverride") === "true";

  try {
    const run = await withRun({ kind: "score_opportunities", triggeredBy }, async ({ runId }) => {
      const out = await runScoreOpportunitiesPipeline({
        runId,
        triggeredBy,
        manualOverride,
      });
      return {
        data: out,
        itemsIn: out.created,
        itemsOut: out.created,
        costUsd: out.costUsd,
      };
    });

    return NextResponse.json({
      ok: true,
      runId: run.runId,
      stats: run.data,
      costUsd: run.costUsd,
    });
  } catch (error: unknown) {
    if (error instanceof BudgetExceededError) {
      return NextResponse.json(
        { ok: false, error: error.message, status: error.status, ratio: error.ratio },
        { status: 429 },
      );
    }
    const message = error instanceof Error ? error.message : "score_opportunities_failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
