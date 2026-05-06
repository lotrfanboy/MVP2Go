import "dotenv/config";
import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL missing");
  const db = postgres(url, { prepare: false, max: 1 });

  const rows = await db<{ signal_id: string; raw_item_id: string }[]>`
    select s.id as signal_id, s.raw_item_id
    from signals s
    join raw_items r on r.id = s.raw_item_id
    where r.is_candidate = true
    limit 1
  `;
  const row = rows[0];
  if (!row) {
    console.log(JSON.stringify({ deleted: false, reason: "no_candidate_signal" }));
    await db.end({ timeout: 3 });
    return;
  }

  await db`delete from signals where id = ${row.signal_id}`;
  console.log(
    JSON.stringify({
      deleted: true,
      signalId: row.signal_id,
      rawItemId: row.raw_item_id,
    }),
  );
  await db.end({ timeout: 3 });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
