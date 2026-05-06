import OpenAI from "openai";
import type {
  AIProvider,
  CompleteRequest,
  CompleteResponse,
  EmbedRequest,
  EmbedResponse,
} from "./provider";

/**
 * Default LLM and embedding models. Both can be overridden by env vars:
 * - `OPENAI_LLM_MODEL`
 * - `OPENAI_EMBEDDING_MODEL`
 *
 * Per PRD D-02. F0 does not invoke these in runtime.
 */
const DEFAULT_LLM = "gpt-4o-mini";
const DEFAULT_EMBEDDING = "text-embedding-3-small";

/**
 * Cost tables in USD per 1M tokens. Defensive defaults if model unknown.
 * Source: https://openai.com/api/pricing — keep in sync periodically.
 */
const CHAT_PRICES_PER_1M: Record<string, { in: number; out: number }> = {
  "gpt-4o-mini": { in: 0.15, out: 0.6 },
  "gpt-4o": { in: 2.5, out: 10 },
  "gpt-4.1-mini": { in: 0.4, out: 1.6 },
  "gpt-4.1": { in: 2.0, out: 8.0 },
};

const EMBED_PRICES_PER_1M: Record<string, number> = {
  "text-embedding-3-small": 0.02,
  "text-embedding-3-large": 0.13,
};

export class OpenAIProvider implements AIProvider {
  private readonly client: OpenAI;
  private readonly llmModel: string;
  private readonly embeddingModel: string;

  constructor(opts?: { apiKey?: string; llmModel?: string; embeddingModel?: string }) {
    const apiKey = opts?.apiKey ?? process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY is required to instantiate OpenAIProvider. See .env.example.",
      );
    }
    this.client = new OpenAI({ apiKey });
    this.llmModel = opts?.llmModel ?? process.env.OPENAI_LLM_MODEL ?? DEFAULT_LLM;
    this.embeddingModel =
      opts?.embeddingModel ?? process.env.OPENAI_EMBEDDING_MODEL ?? DEFAULT_EMBEDDING;
  }

  async embed(req: EmbedRequest): Promise<EmbedResponse> {
    assertPaidAiEnabled();
    const model = req.model ?? this.embeddingModel;
    const response = await this.client.embeddings.create({
      model,
      input: req.inputs,
    });

    const embeddings = response.data.map((d) => d.embedding);
    const tokens = response.usage?.total_tokens ?? 0;

    return {
      embeddings,
      model,
      tokens,
      estimatedCostUsd: estimateEmbeddingCost(model, tokens),
    };
  }

  async complete<T>(req: CompleteRequest<T>): Promise<CompleteResponse<T>> {
    assertPaidAiEnabled();
    const model = req.model ?? this.llmModel;
    const start = Date.now();

    const response = await this.client.chat.completions.create({
      model,
      temperature: req.temperature ?? 0,
      max_tokens: req.maxOutputTokens,
      response_format: { type: "json_object" },
      messages: [
        ...(req.system ? [{ role: "system" as const, content: req.system }] : []),
        { role: "user" as const, content: req.prompt },
      ],
    });

    const latencyMs = Date.now() - start;
    const raw = response.choices[0]?.message?.content ?? "";

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error(
        `OpenAIProvider.complete: response is not valid JSON. Raw: ${raw.slice(0, 500)}`,
      );
    }

    const data = req.schema.parse(parsed);

    const tokensIn = response.usage?.prompt_tokens ?? 0;
    const tokensOut = response.usage?.completion_tokens ?? 0;

    return {
      data,
      raw,
      model,
      tokensIn,
      tokensOut,
      estimatedCostUsd: estimateChatCost(model, tokensIn, tokensOut),
      latencyMs,
    };
  }
}

function assertPaidAiEnabled(): void {
  if (process.env.ALLOW_PAID_AI !== "true") {
    throw new Error(
      "Paid AI calls are disabled (ALLOW_PAID_AI=false). No external AI request was sent.",
    );
  }
}

export function estimateChatCost(model: string, tokensIn: number, tokensOut: number): number {
  const price = CHAT_PRICES_PER_1M[model] ?? CHAT_PRICES_PER_1M[DEFAULT_LLM];
  if (!price) return 0;
  return (tokensIn * price.in + tokensOut * price.out) / 1_000_000;
}

export function estimateEmbeddingCost(model: string, tokens: number): number {
  const price = EMBED_PRICES_PER_1M[model] ?? EMBED_PRICES_PER_1M[DEFAULT_EMBEDDING];
  if (price === undefined) return 0;
  return (tokens * price) / 1_000_000;
}
