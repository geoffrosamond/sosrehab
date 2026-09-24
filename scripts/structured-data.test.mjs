import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { test } from "node:test";

const hostname = "example-sos.grok.me";
const origin = `https://${hostname}`;
const slugs = [
  "workplace-rehabilitation",
  "workplace-assessment",
  "ergonomic-assessment",
  "work-capacity",
  "functional-capacity",
  "vocational-assessment",
  "pre-employment",
  "manual-handling",
];

async function freePort() {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  await new Promise((resolve) => server.close(resolve));
  return port;
}

function headData(html) {
  const head = html.split("</head>")[0];
  const canonical = head.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1];
  const blocks = [...head.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)]
    .map((match) => JSON.parse(match[1]));
  return { canonical, blocks };
}

test("SSR JSON-LD follows canonical origin with one breadcrumb trail per page", { timeout: 30_000 }, async () => {
  const port = await freePort();
  const child = spawn(
    process.execPath,
    ["node_modules/vite/bin/vite.js", "dev", "--host", "127.0.0.1", "--port", String(port), "--strictPort"],
    { env: { ...process.env, VITE_PUBLIC_HOSTNAME: hostname }, detached: true, stdio: ["ignore", "pipe", "pipe"] },
  );
  let output = "";
  child.stdout.on("data", (chunk) => (output += chunk));
  child.stderr.on("data", (chunk) => (output += chunk));

  const base = `http://127.0.0.1:${port}`;
  try {
    let ready = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      if (child.exitCode !== null) break;
      try {
        const response = await fetch(base, { signal: AbortSignal.timeout(1_000) });
        if (response.ok) {
          ready = true;
          break;
        }
      } catch {
        // Wait for the test server to start.
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    assert.ok(ready, `Vite did not start:\n${output}`);

    for (const path of ["/", "/services", "/locations", ...slugs.map((slug) => `/services/${slug}`)]) {
      const response = await fetch(base + path);
      assert.equal(response.status, 200, path);
      const html = await response.text();
      const { canonical, blocks } = headData(html);
      assert.equal(canonical, origin + path, path);
      const graphs = blocks.filter((block) => block["@graph"]);
      assert.equal(graphs.length, 1, `${path}: business identity`);
      const business = graphs[0]["@graph"].find((entity) => entity["@type"] === "LocalBusiness");
      assert.equal(business.url, `${origin}/`);
      assert.equal(business["@id"], `${origin}/#business`);
      assert.equal(
        blocks.filter((block) => block["@type"] === "BreadcrumbList").length,
        path === "/" ? 0 : 1,
        `${path}: breadcrumb count`,
      );

      const serviceBlocks = blocks.filter((block) => block["@type"] === "Service");
      assert.equal(serviceBlocks.length, path.startsWith("/services/") ? 1 : 0, path);
      if (serviceBlocks.length) {
        const service = serviceBlocks[0];
        assert.equal(service.url, canonical);
        assert.equal(service.provider["@id"], business["@id"]);
        assert.equal(
          blocks.find((block) => block["@type"] === "BreadcrumbList").itemListElement.at(-1).item,
          canonical,
        );
        assert.match(html, /<h1[^>]*>[^<]+<\/h1>/);
        assert.doesNotMatch(html, /Assessment, training and return to work\.<\/h1>/);
      }
    }
  } finally {
    if (child.exitCode === null) {
      process.kill(-child.pid, "SIGTERM");
      await Promise.race([
        new Promise((resolve) => child.once("exit", resolve)),
        new Promise((resolve) => setTimeout(resolve, 2_000)),
      ]);
      if (child.exitCode === null) process.kill(-child.pid, "SIGKILL");
    }
  }
});