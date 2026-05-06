import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is required. See .env.example.");
  }

  const client = postgres(url, { max: 1, prepare: false });
  const db = drizzle(client, { casing: "snake_case" });

  console.log("[migrate] applying pending migrations from src/db/migrations ...");
  await migrate(db, { migrationsFolder: "./src/db/migrations" });
  await client.end({ timeout: 5 });
  console.log("[migrate] done.");
}

main().catch((error) => {
  console.error("[migrate] FAILED:", error);
  process.exit(1);
});
