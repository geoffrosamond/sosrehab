/** Public SEO metadata. Published builds use the same host as the SSR share-card injector. */
export function canonicalUrl(path: string): string | undefined {
  const publishedHost = import.meta.env.VITE_PUBLIC_HOSTNAME;
  const host = publishedHost || (typeof window !== "undefined" ? window.location.hostname : "");
  if (!host || !/^[a-z0-9.-]+$/i.test(host) || !host.includes(".") || host.endsWith(".vercel.app")) {
    return undefined;
  }
  const normalized = path === "/" ? "/" : path.replace(/\/+$/, "");
  return `https://${host}${normalized}`;
}

export function pageHead(title: string, description: string, path: string) {
  const canonical = canonicalUrl(path);
  return {
    meta: [{ title }, { name: "description", content: description }],
    links: canonical ? [{ rel: "canonical", href: canonical }] : [],
  };
}