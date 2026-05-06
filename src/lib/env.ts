import { z } from "zod";

const schema = z.object({
  // Postgres / Supabase
  DATABASE_URL: z.string().min(1).optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // OpenAI (D-02 — modelos via ENV; em F0 nada é chamado em runtime)
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_LLM_MODEL: z.string().min(1).default("gpt-4o-mini"),
  OPENAI_EMBEDDING_MODEL: z.string().min(1).default("text-embedding-3-small"),
  ALLOW_PAID_AI: z.enum(["true", "false"]).default("false"),
  AI_MONTHLY_BUDGET_USD: z.coerce.number().positive().default(50),

  // App
  APP_BASE_URL: z.string().url().default("http://localhost:3000"),
  CRON_SECRET: z.string().min(1).optional(),
});

const parsed = schema.parse(process.env);

export type EnvKey = keyof typeof parsed;

export const env = parsed;

/**
 * Use when a specific env var must be present at runtime. Throws an explanatory
 * error referencing `.env.example` when missing. Lazy on purpose: the boot
 * itself does not require every var, only the code paths that need them do.
 */
export function requireEnv<K extends EnvKey>(name: K): NonNullable<(typeof parsed)[K]> {
  const value = parsed[name];
  if (value === undefined || value === null || (typeof value === "string" && value.length === 0)) {
    throw new Error(`Missing required environment variable: ${String(name)}. See .env.example.`);
  }
  return value as NonNullable<(typeof parsed)[K]>;
}
