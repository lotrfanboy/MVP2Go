import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/cron/health
 *
 * Lightweight cron-secret validation endpoint. Returns 401 without the bearer
 * header, 200 with `{ ok: true, ts }` when authorized. No DB hit.
 *
 * The Vercel Cron config in `vercel.json` is empty in F0; this endpoint exists
 * so the operator can validate `CRON_SECRET` end-to-end before F1 introduces
 * real cron jobs.
 */
export async function GET(request: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET not configured on the server." },
      { status: 500 },
    );
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${expected}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  return NextResponse.json({ ok: true, ts: new Date().toISOString() });
}
