import { nav, services, team } from "./site.ts";

/** Only public marketing routes belong in the sitemap. */
export function sitemapPaths(): string[] {
  return [
    ...nav.map(({ to }) => to),
    ...services.map(({ slug }) => `/services/${encodeURIComponent(slug)}`),
    ...team.map(({ slug }) => `/team/${encodeURIComponent(slug)}`),
  ];
}

export function renderSitemap(host: string): string {
  const origin = `https://${host}`;
  const entries = sitemapPaths().map((path) => {
    const loc = new URL(path, origin).href.replaceAll("&", "&amp;").replaceAll("'", "&apos;");
    return `  <url><loc>${loc}</loc></url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;
}