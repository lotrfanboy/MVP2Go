import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { motorRuntimeState } from "@/db/schema";

export const SIGNAL_ADAPTER_CUTOFF_KEY = "signals_to_evidence_cutoff_iso";

export async function getMotorState(key: string): Promise<string | null> {
  const db = getDb();
  const [row] = await db
    .select({ value: motorRuntimeState.value })
    .from(motorRuntimeState)
    .where(eq(motorRuntimeState.key, key))
    .limit(1);
  return row?.value ?? null;
}

export async function setMotorState(key: string, value: string): Promise<void> {
  const db = getDb();
  await db
    .insert(motorRuntimeState)
    .values({ key, value })
    .onConflictDoUpdate({
      target: motorRuntimeState.key,
      set: { value, updatedAt: new Date() },
    });
}

/** First run sets cutoff to "now" → no historical backfill. */
export async function ensureSignalAdapterCutoff(): Promise<string> {
  const existing = await getMotorState(SIGNAL_ADAPTER_CUTOFF_KEY);
  if (existing) return existing;
  const iso = new Date().toISOString();
  await setMotorState(SIGNAL_ADAPTER_CUTOFF_KEY, iso);
  return iso;
}
