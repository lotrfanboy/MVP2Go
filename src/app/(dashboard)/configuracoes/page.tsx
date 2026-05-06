import { readFile } from "node:fs/promises";
import path from "node:path";

export default async function ConfiguracoesPage() {
  let version = "unknown";
  try {
    const packageJsonPath = path.join(process.cwd(), "package.json");
    const packageJson = JSON.parse(await readFile(packageJsonPath, "utf-8")) as { version?: string };
    version = packageJson.version ?? version;
  } catch {
    // no-op
  }

  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground">Informações de conta e ambiente (read-only).</p>
      </header>
      <section className="rounded-xl border bg-card p-4">
        <h2 className="text-lg font-medium">Ambiente</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <strong>APP_BASE_URL:</strong> {process.env.APP_BASE_URL ?? "não definido"}
          </li>
          <li>
            <strong>OPENAI_LLM_MODEL:</strong> {process.env.OPENAI_LLM_MODEL ?? "não definido"}
          </li>
          <li>
            <strong>OPENAI_EMBEDDING_MODEL:</strong> {process.env.OPENAI_EMBEDDING_MODEL ?? "não definido"}
          </li>
          <li>
            <strong>AI_MONTHLY_BUDGET_USD:</strong> {process.env.AI_MONTHLY_BUDGET_USD ?? "não definido"}
          </li>
        </ul>
      </section>
      <section className="rounded-xl border bg-card p-4">
        <h2 className="text-lg font-medium">Sobre</h2>
        <p className="mt-2 text-sm text-muted-foreground">Versão do projeto: {version}</p>
      </section>
    </main>
  );
}
