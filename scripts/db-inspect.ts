import "dotenv/config";
import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL missing");
  const sql = postgres(url, { prepare: false, max: 1 });

  const searchPath = await sql.unsafe(
    "select current_schema() as current_schema, current_setting('search_path') as search_path",
  );
  const tables = await sql.unsafe(
    "select table_schema, table_name from information_schema.tables where table_name in ('runs','ai_usage_logs','cost_budgets') order by table_schema, table_name",
  );
  const drizzleSchema = await sql.unsafe(
    "select schema_name from information_schema.schemata where schema_name='drizzle'",
  );
  const vectorExt = await sql.unsafe("select extname from pg_extension where extname='vector'");

  console.log("search_path:", searchPath[0]);
  console.log("tables:", tables);
  console.log("drizzle_schema_exists:", drizzleSchema.length > 0);
  console.log("pgvector_enabled:", vectorExt.length > 0);

  await sql.end({ timeout: 3 });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

