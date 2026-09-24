import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { brotliCompressSync, gzipSync } from "node:zlib";
import {
  formatBudgetFailures,
  formatBundleReport,
  inspectBundle,
} from "./check-bundle-size.mjs";

function makeBuild({
  entryBytes = 100,
  sharedBytes = 30,
  routeBytes = 20,
  cssBytes = 40,
  cssContent = "x".repeat(cssBytes),
} = {}) {
  const root = mkdtempSync(join(tmpdir(), "bundle-size-"));
  const output = join(root, ".output/public");
  mkdirSync(join(output, ".vite"), { recursive: true });
  mkdirSync(join(output, "assets"), { recursive: true });
  writeFileSync(join(output, "assets/index.js"), "x".repeat(entryBytes));
  writeFileSync(join(output, "assets/shared.js"), "x".repeat(sharedBytes));
  writeFileSync(join(output, "assets/contact.js"), "x".repeat(routeBytes));
  writeFileSync(join(output, "assets/styles.css"), cssContent);
  writeFileSync(
    join(output, ".vite/manifest.json"),
    JSON.stringify({
      "src/client.tsx": {
        file: "assets/index.js",
        isEntry: true,
        imports: ["_shared.js"],
        assets: ["assets/styles.css"],
      },
      "src/styles.css": { file: "assets/styles.css" },
      "_shared.js": { file: "assets/shared.js" },
      "src/routes/contact.tsx": {
        file: "assets/contact.js",
        isDynamicEntry: true,
      },
    }),
  );
  return root;
}

test("reports the eager entry, generated CSS, and lazy route chunks", () => {
  const result = inspectBundle({
    root: makeBuild(),
    budgetBytes: 200,
    cssBudgetBytes: 50,
    cssGzipBudgetBytes: 50,
    cssBrotliBudgetBytes: 50,
  });
  assert.equal(result.entry.bytes, 100);
  assert.equal(result.eagerBytes, 130);
  assert.deepEqual(result.eagerChunks.map((chunk) => chunk.file).sort(), [
    "assets/index.js",
    "assets/shared.js",
  ]);
  assert.equal(result.cssBytes, 40);
  assert.equal(result.cssGzipBytes, gzipSync("x".repeat(40)).byteLength);
  assert.equal(result.cssBrotliBytes, brotliCompressSync("x".repeat(40)).byteLength);
  assert.deepEqual(result.routeChunks.map((chunk) => chunk.source), [
    "src/routes/contact.tsx",
  ]);
  assert.match(
    formatBundleReport(result).join("\n"),
    /eager client JavaScript.*entry plus static imports.*generated client CSS: 0\.0 KiB.*CSS \(gzip transfer\): 0\.0 KiB.*CSS \(Brotli transfer\): 0\.0 KiB.*lazy route chunks/s,
  );
});

test("fails clearly when generated client CSS exceeds its documented budget", () => {
  const result = inspectBundle({
    root: makeBuild({ cssBytes: 51 * 1024 }),
    budgetBytes: 200 * 1024,
    cssBudgetBytes: 50 * 1024,
    cssGzipBudgetBytes: 100 * 1024,
  });
  assert.deepEqual(formatBudgetFailures(result), [
    "[bundle-size] FAILED: generated client CSS exceeds its budget by 1.0 KiB. Check for accidental global CSS or expanded utility generation.",
  ]);
});

test("passes when generated client CSS stays within its gzip transfer budget", () => {
  const cssContent = "repetitive-css-rule{}".repeat(100);
  const gzipBytes = gzipSync(cssContent).byteLength;
  const result = inspectBundle({
    root: makeBuild({ cssContent }),
    budgetBytes: 200 * 1024,
    cssBudgetBytes: 50 * 1024,
    cssGzipBudgetBytes: gzipBytes,
  });
  assert.equal(result.cssGzipBytes, gzipBytes);
  assert.deepEqual(formatBudgetFailures(result), []);
});

test("fails clearly when generated client CSS exceeds its gzip transfer budget", () => {
  const cssContent = Array.from(
    { length: 512 },
    (_, index) => `.rule-${index}{value:${index * 7919}}`,
  ).join("");
  const gzipBytes = gzipSync(cssContent).byteLength;
  const result = inspectBundle({
    root: makeBuild({ cssContent }),
    budgetBytes: 200 * 1024,
    cssBudgetBytes: 50 * 1024,
    cssGzipBudgetBytes: gzipBytes - 1024,
  });
  assert.deepEqual(formatBudgetFailures(result), [
    "[bundle-size] FAILED: generated client CSS gzip transfer exceeds its budget by 1.0 KiB. Check for added CSS or content that compresses poorly.",
  ]);
});

test("passes when generated client CSS stays within its Brotli transfer budget", () => {
  const cssContent = "repetitive-css-rule{}".repeat(100);
  const brotliBytes = brotliCompressSync(cssContent).byteLength;
  const result = inspectBundle({
    root: makeBuild({ cssContent }),
    budgetBytes: 200 * 1024,
    cssBudgetBytes: 50 * 1024,
    cssGzipBudgetBytes: 50 * 1024,
    cssBrotliBudgetBytes: brotliBytes,
  });
  assert.equal(result.cssBrotliBytes, brotliBytes);
  assert.deepEqual(formatBudgetFailures(result), []);
});

test("fails clearly when generated client CSS exceeds its Brotli transfer budget", () => {
  const cssContent = Array.from(
    { length: 512 },
    (_, index) => `.rule-${index}{value:${index * 7919}}`,
  ).join("");
  const brotliBytes = brotliCompressSync(cssContent).byteLength;
  const result = inspectBundle({
    root: makeBuild({ cssContent }),
    budgetBytes: 200 * 1024,
    cssBudgetBytes: 50 * 1024,
    cssGzipBudgetBytes: 50 * 1024,
    cssBrotliBudgetBytes: brotliBytes - 1024,
  });
  assert.deepEqual(formatBudgetFailures(result), [
    "[bundle-size] FAILED: generated client CSS Brotli transfer exceeds its budget by 1.0 KiB. Check for added CSS or content that compresses poorly.",
  ]);
});

test("counts static imports when determining whether eager code is over budget", () => {
  const result = inspectBundle({
    root: makeBuild({ entryBytes: 171, sharedBytes: 30 }),
    budgetBytes: 200,
  });
  assert.equal(result.entry.bytes, 171);
  assert.ok(result.eagerBytes > result.budgetBytes);
});

test("explains that a production build is required", () => {
  const root = mkdtempSync(join(tmpdir(), "bundle-size-missing-"));
  assert.throws(
    () => inspectBundle({ root }),
    /production manifest not found.*run the production build first/,
  );
});