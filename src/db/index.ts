import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import dotenv from "dotenv";

type DrizzleClient = ReturnType<typeof drizzle<typeof schema>>;

type DbGlobal = {
  _gomvpClient?: ReturnType<typeof postgres>;
  _gomvpDb?: DrizzleClient;
};

const dbGlobal = globalThis as unknown as DbGlobal;

/**
 * Lazy database accessor. The Postgres connection is opened only on first
 * call. Importing this module has zero side effects, which keeps tests and
 * scripts that don't need the DB (e.g. `test:budget`) from requiring
 * `DATABASE_URL`.
 */
export function getDb(): DrizzleClient {
  if (dbGlobal._gomvpDb) return dbGlobal._gomvpDb;

  // In local dev, force-load `.env` so stale shell-level DATABASE_URL values
  // don't break the app with auth errors against the wrong database.
  if (process.env.NODE_ENV !== "production") {
    dotenv.config({ path: ".env", override: true });
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is required. See .env.example.");
  }
  // `prepare: false` is the safe default for both direct (port 5432) and
  // transaction-pooled (port 6543) Supabase connections.
  const client = postgres(url, { prepare: false, max: 1 });
  const db = drizzle(client, { schema, casing: "snake_case" });
  dbGlobal._gomvpClient = client;
  dbGlobal._gomvpDb = db;
  return db;
}

export type DbClient = DrizzleClient;
export { schema };
