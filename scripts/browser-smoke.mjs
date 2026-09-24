#!/usr/bin/env node
import { mkdirSync, readFileSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { checkedOutputPath, checkedUrl } from "./browser-guard.mjs";
import { computeBrandWarnings } from "./brand-check.mjs";
import { inspectBundle } from "./check-bundle-size.mjs";
import {
  authInvariantWarnings,
  buildAuthEnabled,
  compareAuthInvariant,
  probeDevAuthEnabled,
} from "./check-auth-invariant.mjs";
import {
  baselineComparison,
  bodyTextPrefix,
  derivedPaths,
  exitCodeFor,
  normalizeBodyText,
  normalizedBodyTextHash,
  parseSmokeArgs,
  publicPathsFromSitemap,
  startupJavaScriptVerdict,
} from "./browser-smoke-verdict.mjs";

const args = parseSmokeArgs(process.argv.slice(2), process.env);
if (args.error) {
  console.error(JSON.stringify({ ok: false, error: args.error }, null, 2));
  process.exit(1);
}

const url = checkedUrl(args.url);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const allowedOutputDirs = ["/workspace", ROOT];
const outPng = checkedOutputPath(args.outPng, allowedOutputDirs);
const derived = derivedPaths(outPng);
const mobilePng = checkedOutputPath(derived.mobilePng, allowedOutputDirs);
const outJson = checkedOutputPath(derived.verdictJson, allowedOutputDirs, "verdict JSON");

const MAX_BASELINE_BYTES = 1024 * 1024;
const baselineRequested = Boolean(args.baseline);
let baselinePath = null;
let baselineResolveError = null;
if (baselineRequested) {
  try {
    baselinePath = checkedOutputPath(realpathSync(args.baseline), allowedOutputDirs, "baseline");
  } catch (err) {
    baselineResolveError = err?.code ?? "unresolvable path";
  }
  if (baselinePath === outJson) {
    console.error(
      JSON.stringify(
        {
          ok: false,
          error:
            `--baseline ${args.baseline} is this run's own verdict output; ` +
            "pass a distinct output PNG (e.g. app-builder-built.png) so the baseline is not overwritten",
        },
        null,
        2,
      ),
    );
    process.exit(1);
  }
}

const timeoutMs = Number(process.env.BROWSER_SMOKE_TIMEOUT_MS || 45000);

const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 800, screenshot: outPng },
  { name: "mobile", width: 390, height: 844, screenshot: mobilePng },
];

mkdirSync(dirname(outPng), { recursive: true });

async function captureRoute(browser, routeUrl, timeout, bundle, path) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const responses = [];
  const errors = { consoleErrors: [], pageErrors: [] };
  page.on("response", (response) => {
    if (response.request().resourceType() === "script" && response.ok()) responses.push(response);
  });
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.consoleErrors.push(msg.text());
  });
  page.on("pageerror", (error) => errors.pageErrors.push(String(error?.message || error)));
  try {
    const response = await page.goto(routeUrl, { waitUntil: "domcontentloaded", timeout });
    // Give hydration and route preloads a short, fixed window; a new page keeps
    // the browser cache and response listeners independent for every URL.
    await page.waitForTimeout(350);
    const requests = await Promise.all(
      responses.map(async (script) => ({
        file: new URL(script.url()).pathname,
        bytes: (await script.body()).byteLength,
      })),
    );
    return {
      status: response?.status() ?? 0,
      ...errors,
      startupJavaScript: startupJavaScriptVerdict(requests, bundle, undefined, path),
    };
  } catch (error) {
    throw new Error(`${path}: initial JavaScript capture failed: ${error?.message || error}`, {
      cause: error,
    });
  } finally {
    await page.close();
  }
}

function compareAgainstBaseline(verdict) {
  if (!baselinePath) {
    return {
      divergesFromBaseline: true,
      reasons: [`baseline unreadable: ${baselineResolveError ?? "unresolvable path"}`],
    };
  }
  try {
    if (statSync(baselinePath).size > MAX_BASELINE_BYTES) {
      return { divergesFromBaseline: true, reasons: ["baseline unreadable: too large"] };
    }
    return baselineComparison(verdict, readFileSync(baselinePath, "utf8"));
  } catch (err) {
    return {
      divergesFromBaseline: true,
      reasons: [`baseline unreadable: ${err?.code ?? "read error"}`],
    };
  }
}

let browser = null;
try {
  browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });

  const viewports = {};
  let startupRequests = [];
  for (const vp of VIEWPORTS) {
    const errors = { consoleErrors: [], pageErrors: [] };
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
    });
    const scriptResponses = [];
    if (vp.name === "desktop") {
      page.on("response", (response) => {
        if (response.request().resourceType() === "script" && response.ok()) {
          scriptResponses.push(response);
        }
      });
    }
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.pageErrors.push(String(err?.message || err)));
    // `domcontentloaded`, not `networkidle`: Vite keeps an HMR websocket open, so
    // networkidle never settles and would burn the whole timeout.
    const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: timeoutMs });
    const status = resp?.status() ?? 0;
    await page.waitForTimeout(1000);
    if (vp.name === "desktop") {
      startupRequests = await Promise.all(
        scriptResponses.map(async (response) => ({
          file: new URL(response.url()).pathname,
          bytes: (await response.body()).byteLength,
        })),
      );
    }

    const title = await page.title();
    const hasCanvas = (await page.locator("canvas").count()) > 0;
    const bodyText = await page
      .locator("body")
      .innerText()
      .catch(() => "");
    const horizontalOverflow = await page.evaluate(() => {
      const el = document.documentElement;
      return el.scrollWidth > el.clientWidth + 1;
    });
    await page.screenshot({ path: vp.screenshot, fullPage: false });
    await page.close();

    viewports[vp.name] = {
      width: vp.width,
      height: vp.height,
      status,
      title,
      hasCanvas,
      bodyTextLen: normalizeBodyText(bodyText).length,
      bodyTextHash: normalizedBodyTextHash(bodyText),
      bodyTextPrefix: bodyTextPrefix(bodyText),
      horizontalOverflow,
      consoleErrors: errors.consoleErrors,
      pageErrors: errors.pageErrors,
      screenshot: vp.screenshot,
    };
  }

  const brandWarnings = computeBrandWarnings({ hasCanvas: viewports.desktop.hasCanvas });
  const bundle = inspectBundle();
  const homePath = new URL(url).pathname;
  const startupJavaScript = startupJavaScriptVerdict(startupRequests, bundle, undefined, homePath);
  const sitemapUrl = new URL("/sitemap.xml", url);
  const sitemapResponse = await fetch(sitemapUrl, {
    // Preview rejects loopback hostnames for canonical links. This header is
    // only used for the sitemap response; route visits remain on loopback.
    headers: { "x-forwarded-host": "smoke.example.org" },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!sitemapResponse.ok)
    throw new Error(`sitemap ${sitemapUrl} returned HTTP ${sitemapResponse.status}`);
  const paths = publicPathsFromSitemap(await sitemapResponse.text(), url);
  if (!paths.includes(homePath))
    throw new Error(`smoke URL ${homePath} is not in the public sitemap`);
  const routes = {};
  for (const path of paths) {
    if (path === homePath) continue;
    routes[path] = await captureRoute(browser, new URL(path, url).href, timeoutMs, bundle, path);
  }
  // Only a dev server answers /__app-env, so smoking the built output reads as
  // indeterminate — report a divergence, never the absence of an observation.
  const authWarnings = authInvariantWarnings(
    compareAuthInvariant({
      devAuthEnabled: await probeDevAuthEnabled(url),
      buildAuthEnabled: buildAuthEnabled(),
    }),
  );
  const verdict = {
    url,
    viewports,
    startupJavaScript,
    routes,
    brandWarnings,
    authWarnings,
    verdictFile: outJson,
  };
  if (baselineRequested) {
    const { divergesFromBaseline, reasons } = compareAgainstBaseline(verdict);
    verdict.divergesFromBaseline = divergesFromBaseline;
    verdict.baselineReasons = reasons;
  }

  writeFileSync(outJson, JSON.stringify(verdict, null, 2));
  console.log(JSON.stringify(verdict, null, 2));
  for (const w of [...brandWarnings, ...authWarnings]) console.error(w);
  for (const failure of startupJavaScript.failures) {
    console.error(`[browser-smoke] FAILED: ${failure}`);
  }
  for (const [path, route] of Object.entries(routes)) {
    if (route.status < 200 || route.status >= 400) {
      console.error(`[browser-smoke] FAILED: ${path}: HTTP ${route.status}`);
    }
    for (const error of [...route.consoleErrors, ...route.pageErrors]) {
      console.error(`[browser-smoke] FAILED: ${path}: ${error}`);
    }
    for (const failure of route.startupJavaScript.failures) {
      console.error(`[browser-smoke] FAILED: ${failure}`);
    }
  }
  // Set the code rather than aborting the process so the `finally` browser
  // teardown always runs (agents typically smoke twice per turn; leaking
  // Chromium accumulates across retries).
  process.exitCode = exitCodeFor(viewports, startupJavaScript, routes);
} catch (err) {
  const failure = { ok: false, url, error: String(err?.message || err) };
  try {
    writeFileSync(outJson, JSON.stringify(failure, null, 2));
  } catch (writeErr) {
    failure.verdictWriteError = String(writeErr?.message || writeErr);
  }
  console.error(JSON.stringify(failure, null, 2));
  process.exitCode = 1;
} finally {
  await browser?.close();
}
