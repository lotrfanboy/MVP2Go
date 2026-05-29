/** Stable slug for topic_key from a free-text title or phrase. */
export function toTopicKey(text: string): string {
  const base = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
  return base.length > 0 ? base : "topic";
}
