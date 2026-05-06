import { NextResponse, type NextRequest } from "next/server";
import { BudgetExceededError } from "@/ai/budget";
import { requireEnv } from "@/lib/env";
import { withRun } from "@/lib/runs";
import { runCluster } from "@/pipeline/cluster";
import { runIdeaGeneration } from "@/pipeline/ideaGen";
import { reapplyIdeasBlacklist } from "@/pipeline/ideas-blacklist";
import { runScoreIdeas } from "@/pipeline/score";

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

  try {
    const run = await withRun({ kind: "generate", triggeredBy }, async ({ runId }) => {
      const clustered = await runCluster({ runId, triggeredBy, manualOverride });
      const generated = await runIdeaGeneration({ runId, triggeredBy, manualOverride });
      const blacklist = await reapplyIdeasBlacklist();
      const scored = await runScoreIdeas();
      const costUsd = clustered.costUsd + generated.costUsd;

      return {
        data: { clustered, generated, blacklist, scored },
        itemsIn: clustered.assigned,
        itemsOut: generated.ideasInserted,
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
    const message = error instanceof Error ? error.message : "generate_failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
