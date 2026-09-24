#!/usr/bin/env node
/**
 * Assert that the eagerly loaded production client assets stay reasonably small.
 *
 * The current entry and its static imports total about 437 KiB. A 505 KiB limit
 * leaves roughly 15% headroom while catching routes that become eagerly bundled.
 * The generated client stylesheet is about 43 KiB uncompressed, 8 KiB gzipped,
 * and 7 KiB Brotli-compressed. Limits of 45 KiB, 9 KiB, and 8 KiB respectively
 * leave headroom while catching meaningful global CSS, utility expansion, or
 * content that compresses poorly.
 */
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { brotliCompressSync, gzipSync } from "node:zlib";
import { isMainModule, projectRoot } from "./with-app-env.mjs";

export const EAGER_CLIENT_BUDGET_BYTES = 505 * 1024;
// Browser startup includes the eager graph plus the route matched by the first
// navigation. Keep a little more headroom than the manifest-only budget.
export const STARTUP_CLIENT_BUDGET_BYTES = 550 * 1024;
export const CLIENT_CSS_BUDGET_BYTES = 45 * 1024;
export const CLIENT_CSS_GZIP_BUDGET_BYTES = 9 * 1024;
export const CLIENT_CSS_BROTLI_BUDGET_BYTES = 8 * 1024;
const CLIENT_OUTPUT_REL_PATH = ".output/public";
const MANIFEST_REL_PATH = `${CLIENT_OUTPUT_REL_PATH}/.vite/manifest.json`;

function formatKiB(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

export function inspectBundle({
  root = projectRoot(),
  budgetBytes = EAGER_CLIENT_BUDGET_BYTES,
  cssBudgetBytes = CLIENT_CSS_BUDGET_BYTES,
  cssGzipBudgetBytes = CLIENT_CSS_GZIP_BUDGET_BYTES,
  cssBrotliBudgetBytes = CLIENT_CSS_BROTLI_BUDGET_BYTES,
} = {}) {
  const manifestPath = join(root, MANIFEST_REL_PATH);
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch (error) {
    throw new Error(
      `production manifest not found at ${MANIFEST_REL_PATH}; run the production build first`,
      { cause: error },
    );
  }

  const chunks = Object.entries(manifest)
    .filter(([, item]) => item.file?.endsWith(".js"))
    .map(([source, item]) => ({
      source,
      file: item.file,
      isEntry: item.isEntry === true,
      isDynamicEntry: item.isDynamicEntry === true,
      imports: item.imports ?? [],
      bytes: statSync(join(root, CLIENT_OUTPUT_REL_PATH, item.file)).size,
    }));
  const stylesheets = [
    ...new Map(
      Object.entries(manifest)
        .filter(([, item]) => item.file?.endsWith(".css"))
        .map(([source, item]) => {
          const path = join(root, CLIENT_OUTPUT_REL_PATH, item.file);
          const content = readFileSync(path);
          return [
            item.file,
            {
              source,
              file: item.file,
              bytes: content.byteLength,
              gzipBytes: gzipSync(content).byteLength,
              brotliBytes: brotliCompressSync(content).byteLength,
            },
          ];
        }),
    ).values(),
  ];
  const entries = chunks.filter((chunk) => chunk.isEntry);
  if (entries.length !== 1) {
    throw new Error(`expected one production client entry, found ${entries.length}`);
  }

  const chunksBySource = new Map(chunks.map((chunk) => [chunk.source, chunk]));
  const eagerChunks = [];
  const pending = [entries[0]];
  const visited = new Set();
  while (pending.length > 0) {
    const chunk = pending.pop();
    if (visited.has(chunk.source)) continue;
    visited.add(chunk.source);
    eagerChunks.push(chunk);
    for (const importedSource of chunk.imports) {
      const importedChunk = chunksBySource.get(importedSource);
      if (importedChunk) pending.push(importedChunk);
    }
  }

  return {
    entry: entries[0],
    eagerChunks,
    eagerBytes: eagerChunks.reduce((total, chunk) => total + chunk.bytes, 0),
    cssBytes: stylesheets.reduce((total, stylesheet) => total + stylesheet.bytes, 0),
    cssGzipBytes: stylesheets.reduce(
      (total, stylesheet) => total + stylesheet.gzipBytes,
      0,
    ),
    cssBrotliBytes: stylesheets.reduce(
      (total, stylesheet) => total + stylesheet.brotliBytes,
      0,
    ),
    stylesheets,
    routeChunks: chunks
      .filter((chunk) => chunk.isDynamicEntry && chunk.source.includes("/routes/"))
      .sort((a, b) => a.source.localeCompare(b.source)),
    budgetBytes,
    cssBudgetBytes,
    cssGzipBudgetBytes,
    cssBrotliBudgetBytes,
  };
}

export function formatBundleReport(result) {
  const routes =
    result.routeChunks.length === 0
      ? "none"
      : result.routeChunks
          .map((chunk) => `${chunk.source}: ${formatKiB(chunk.bytes)}`)
          .join(", ");
  return [
    `[bundle-size] eager client JavaScript: ${formatKiB(result.eagerBytes)} / ${formatKiB(result.budgetBytes)} budget (entry plus static imports)`,
    `[bundle-size] generated client CSS: ${formatKiB(result.cssBytes)} / ${formatKiB(result.cssBudgetBytes)} budget`,
    `[bundle-size] generated client CSS (gzip transfer): ${formatKiB(result.cssGzipBytes)} / ${formatKiB(result.cssGzipBudgetBytes)} budget`,
    `[bundle-size] generated client CSS (Brotli transfer): ${formatKiB(result.cssBrotliBytes)} / ${formatKiB(result.cssBrotliBudgetBytes)} budget`,
    `[bundle-size] lazy route chunks: ${routes}`,
  ];
}

export function formatBudgetFailures(result) {
  const failures = [];
  if (result.eagerBytes > result.budgetBytes) {
    failures.push(
      `[bundle-size] FAILED: eager client JavaScript exceeds its budget by ${formatKiB(
        result.eagerBytes - result.budgetBytes,
      )}. Check for route code or large dependencies that are no longer lazy-loaded.`,
    );
  }
  if (result.cssBytes > result.cssBudgetBytes) {
    failures.push(
      `[bundle-size] FAILED: generated client CSS exceeds its budget by ${formatKiB(
        result.cssBytes - result.cssBudgetBytes,
      )}. Check for accidental global CSS or expanded utility generation.`,
    );
  }
  if (result.cssGzipBytes > result.cssGzipBudgetBytes) {
    failures.push(
      `[bundle-size] FAILED: generated client CSS gzip transfer exceeds its budget by ${formatKiB(
        result.cssGzipBytes - result.cssGzipBudgetBytes,
      )}. Check for added CSS or content that compresses poorly.`,
    );
  }
  if (result.cssBrotliBytes > result.cssBrotliBudgetBytes) {
    failures.push(
      `[bundle-size] FAILED: generated client CSS Brotli transfer exceeds its budget by ${formatKiB(
        result.cssBrotliBytes - result.cssBrotliBudgetBytes,
      )}. Check for added CSS or content that compresses poorly.`,
    );
  }
  return failures;
}

function main() {
  try {
    const result = inspectBundle();
    for (const line of formatBundleReport(result)) console.log(line);
    const failures = formatBudgetFailures(result);
    for (const failure of failures) console.error(failure);
    return failures.length === 0 ? 0 : 1;
  } catch (error) {
    console.error(`[bundle-size] ${error.message}`);
    return 2;
  }
}

if (isMainModule(import.meta.url)) {
  process.exitCode = main();
}