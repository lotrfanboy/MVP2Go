const BLOCKED_TERMS = [
  "buy now",
  "limited time offer",
  "earn money fast",
  "click here",
  "casino bonus",
  "free crypto",
];

export type Language = "pt" | "en" | "other";

export type FilterResult = {
  language: Language;
  isFilteredOut: boolean;
  reason: string | null;
};

function detectLanguage(text: string): Language {
  const lower = text.toLowerCase();
  const ptMarkers = /\b(nao|você|voce|para|com|uma|seu|sua|como|mais|menos|dados|ferramenta)\b/;
  const enMarkers = /\b(the|and|with|from|that|this|build|tool|users|problem|need)\b/;
  const ptScore = Number(ptMarkers.test(lower)) + Number(/[ãõçáéíóúâêô]/i.test(lower));
  const enScore = Number(enMarkers.test(lower));

  if (ptScore > enScore && ptScore > 0) return "pt";
  if (enScore > ptScore && enScore > 0) return "en";
  return "other";
}

export function applyDeterministicFilter(input: string, minChars = 40): FilterResult {
  const text = input.trim();
  const language = detectLanguage(text);

  if (text.length < minChars) {
    return { language, isFilteredOut: true, reason: "min_length" };
  }

  if (language === "other") {
    return { language, isFilteredOut: true, reason: "language_other" };
  }

  const lower = text.toLowerCase();
  const blocked = BLOCKED_TERMS.find((term) => lower.includes(term));
  if (blocked) {
    return { language, isFilteredOut: true, reason: "blocked_keyword" };
  }

  return { language, isFilteredOut: false, reason: null };
}
