import { OpenAIProvider } from "@/ai/openai";

let provider: OpenAIProvider | null = null;

export function getAiProvider(): OpenAIProvider {
  if (!provider) {
    provider = new OpenAIProvider();
  }
  return provider;
}
