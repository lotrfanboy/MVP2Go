import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { manualInputs } from "@/db/schema";
import { processManualInputRow } from "@/sources/manual/normalizer";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  input_kind: z.enum(["topic", "text", "url"]),
  payload: z.string().min(3).max(20000),
  source_url: z.string().url().nullable().optional(),
  language: z.enum(["pt", "en", "other"]).default("other"),
  watch_topic_id: z.string().uuid().nullable().optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const db = getDb();
  const [row] = await db
    .insert(manualInputs)
    .values({
      inputKind: parsed.data.input_kind,
      payload: parsed.data.payload,
      sourceUrl: parsed.data.source_url ?? null,
      language: parsed.data.language,
      watchTopicId: parsed.data.watch_topic_id ?? null,
      status: "pending",
    })
    .returning({ id: manualInputs.id });

  if (!row) {
    return NextResponse.json({ ok: false, error: "insert_failed" }, { status: 500 });
  }

  const { evidenceId } = await processManualInputRow(row.id);

  return NextResponse.json({
    ok: true,
    manualInputId: row.id,
    evidenceId,
  });
}
