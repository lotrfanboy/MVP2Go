export type AlgoliaHnTag = "story" | "ask_hn" | "show_hn";

export type AlgoliaHnHit = {
  objectID: string;
  title?: string | null;
  story_title?: string | null;
  story_text?: string | null;
  comment_text?: string | null;
  url?: string | null;
  story_url?: string | null;
  created_at_i: number;
  author?: string | null;
  points?: number | null;
  num_comments?: number | null;
};

export type RawPayloadNormalized = {
  title: string;
  body: string;
  combinedText: string;
  sourceUrl: string;
  externalUrl: string;
  hnObjectId: string;
  hnTag: AlgoliaHnTag;
  createdAtUnix: number;
  authorHandle: string | null;
  points: number | null;
  numComments: number | null;
};

export type NormalizedRawItem = {
  sourceExternalId: string;
  url: string;
  fetchedAt: Date;
  payload: RawPayloadNormalized;
};

function cleanText(input: string | null | undefined): string {
  return (input ?? "").replace(/\s+/g, " ").trim();
}

function buildSourceUrl(hitId: string): string {
  return `https://news.ycombinator.com/item?id=${encodeURIComponent(hitId)}`;
}

export function normalizeAlgoliaHit(hit: AlgoliaHnHit, tag: AlgoliaHnTag): NormalizedRawItem | null {
  const title = cleanText(hit.title ?? hit.story_title);
  const body = cleanText(hit.story_text ?? hit.comment_text);
  const externalUrl = cleanText(hit.url ?? hit.story_url);
  const sourceUrl = buildSourceUrl(hit.objectID);
  const combinedText = `${title} ${body}`.trim();

  if (!title && !body) {
    return null;
  }

  return {
    sourceExternalId: hit.objectID,
    url: externalUrl || sourceUrl,
    fetchedAt: new Date(),
    payload: {
      title,
      body,
      combinedText,
      sourceUrl,
      externalUrl: externalUrl || sourceUrl,
      hnObjectId: hit.objectID,
      hnTag: tag,
      createdAtUnix: hit.created_at_i,
      authorHandle: hit.author ?? null,
      points: hit.points ?? null,
      numComments: hit.num_comments ?? null,
    },
  };
}
