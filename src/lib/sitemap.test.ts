import assert from "node:assert/strict";
import test from "node:test";
import { nav, services, team } from "./site.ts";
import { renderSitemap, sitemapPaths } from "./sitemap.ts";

test("sitemap lists every public section, service and team detail once", () => {
  const paths = sitemapPaths();
  assert.equal(paths.length, nav.length + services.length + team.length);
  assert.equal(new Set(paths).size, paths.length);
  assert.deepEqual(paths.slice(0, nav.length), nav.map(({ to }) => to));
  for (const service of services) assert.ok(paths.includes(`/services/${service.slug}`));
  for (const person of team) assert.ok(paths.includes(`/team/${person.slug}`));
});

test("sitemap uses absolute HTTPS URLs without query strings or invented modification dates", () => {
  const xml = renderSitemap("example.org");
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>/);
  assert.match(xml, /<urlset xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">/);
  assert.deepEqual(urls, sitemapPaths().map((path) => new URL(path, "https://example.org").href));
  assert.ok(!xml.includes("<lastmod>"));
});