import "dotenv/config";
import type { Config } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is required. Copy .env.example to .env.local and fill it in.",
  );
}

export default {
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: { url: databaseUrl },
  verbose: true,
  strict: true,
  casing: "snake_case",
} satisfies Config;
