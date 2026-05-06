import { createHash } from "node:crypto";

const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "that",
  "the",
  "this",
  "to",
  "with",
  "de",
  "da",
  "do",
  "das",
  "dos",
  "e",
  "em",
  "na",
  "no",
  "para",
  "por",
  "que",
  "um",
  "uma",
  "o",
  "os",
  "a",
  "as",
]);

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function canonicalizeUrl(input: string): string {
  const fallback = input.trim().toLowerCase();
  try {
    const parsed = new URL(input);
    parsed.hash = "";
    parsed.protocol = parsed.protocol.toLowerCase();
    parsed.hostname = parsed.hostname.toLowerCase();
    parsed.pathname = parsed.pathname.replace(/\/+$/, "") || "/";
    const kept = [...parsed.searchParams.entries()].filter(([key]) => !/^utm_/i.test(key));
    parsed.search = "";
    kept.sort(([a], [b]) => a.localeCompare(b));
    for (const [key, value] of kept) {
      parsed.searchParams.append(key, value);
    }
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return fallback.replace(/\/+$/, "");
  }
}

export function normalizeTextForHash(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .filter((token) => !STOPWORDS.has(token))
    .join(" ");
}

export function computeHashes(url: string, combinedText: string): {
  canonicalUrl: string;
  hashUrl: string;
  textNorm: string;
  hashTextNorm: string;
} {
  const canonicalUrl = canonicalizeUrl(url);
  const textNorm = normalizeTextForHash(combinedText);
  return {
    canonicalUrl,
    hashUrl: sha256(canonicalUrl),
    textNorm,
    hashTextNorm: sha256(textNorm || canonicalUrl),
  };
}
