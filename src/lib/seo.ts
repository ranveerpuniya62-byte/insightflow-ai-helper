export const SITE_URL = "https://aistudychat.lovable.app";

export interface SiteHeadInput {
  title: string;
  description: string;
  path: string;
  /** og:type for the page, e.g. "website" or "article" */
  type?: string;
}

/**
 * Standard head metadata for a public content route: title, description,
 * Open Graph / Twitter tags, og:url and a self-referencing canonical.
 * The site-wide og:image lives in __root.tsx and is inherited.
 */
export function siteHead({ title, description, path, type = "website" }: SiteHeadInput) {
  const url = `${SITE_URL}${path}`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: type },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
