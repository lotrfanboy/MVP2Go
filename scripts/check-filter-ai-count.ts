import "dotenv/config";
import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL missing");
  const db = postgres(url, { prepare: false, max: 1 });
  const rows = await db<{ c: number }[]>`
    select count(1)::int as c
    from ai_usage_logs
    where operation = 'filter_ai'
  `;
  console.log(JSON.stringify({ filterAiCount: rows[0]?.c ?? 0 }));
  await db.end({ timeout: 3 });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
