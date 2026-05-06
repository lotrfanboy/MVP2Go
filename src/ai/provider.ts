import type { ZodType } from "zod";

/**
 * Camada `AIProvider` — única abstração obrigatória do sistema (PRD §11).
 *
 * O sistema nunca chama OpenAI/Anthropic/etc diretamente: sempre via essa
 * interface. Em F0 o `OpenAIProvider` está implementado mas não é exercitado em
 * runtime — a infraestrutura está pronta para F2+, onde toda chamada deve
 * passar antes por `assertBudget()` e gerar uma linha em `ai_usage_logs`.
 */

export type EmbedRequest = {
  inputs: string[];
  model?: string;
};

export type EmbedResponse = {
  embeddings: number[][];
  model: string;
  tokens: number;
  estimatedCostUsd: number;
};

export type CompleteRequest<T> = {
  /** Optional system prompt. */
  system?: string;
  /** User prompt body. */
  prompt: string;
  /** Schema Zod usado para parsear/validar a resposta JSON. */
  schema: ZodType<T>;
  /** Versão do prompt (PRD RF-16). Salva em `ai_usage_logs.prompt_version`. */
  promptVersion: string;
  model?: string;
  /** Default 0 (deterministic). */
  temperature?: number;
  maxOutputTokens?: number;
};

export type CompleteResponse<T> = {
  data: T;
  raw: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  estimatedCostUsd: number;
  latencyMs: number;
};

export interface AIProvider {
  embed(req: EmbedRequest): Promise<EmbedResponse>;
  complete<T>(req: CompleteRequest<T>): Promise<CompleteResponse<T>>;
}
