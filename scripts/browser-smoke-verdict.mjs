import { createHash } from "node:crypto";
import { STARTUP_CLIENT_BUDGET_BYTES } from "./check-bundle-size.mjs";
export function normalizeBodyText(text) {
  return String(text ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizedBodyTextHash(text) {
  return createHash("sha256").update(normalizeBodyText(text)).digest("hex");
}

const IDENTITY_PREFIX_LEN = 64;

export function bodyTextPrefix(text) {
  return normalizeBodyText(text).slice(0, IDENTITY_PREFIX_LEN);
}
export function parseSmokeArgs(argv, env = {}) {
  const positional = [];
  let baseline = env.BROWSER_SMOKE_BASELINE || "";
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--baseline") {
      const value = argv[++i];
      if (!value) return { error: "--baseline requires a path to a prior verdict JSON" };
      baseline = value;
    } else if (arg.startsWith("--baseline=")) {
      const value = arg.slice("--baseline=".length);
      if (!value) return { error: "--baseline requires a path to a prior verdict JSON" };
      baseline = value;
    } else if (arg.startsWith("--")) {
      return { error: `unknown flag: ${arg}` };
    } else {
      positional.push(arg);
    }
  }
  return {
    url: positional[0] || "http://127.0.0.1:8080/",
    outPng: positional[1] || "/workspace/screenshots/app-builder-preview.png",
    baseline,
  };
}
export function derivedPaths(outPng) {
  const base = outPng.replace(/\.png$/i, "");
  return { mobilePng: `${base}-mobile.png`, verdictJson: `${base}.json` };
}

export function publicPathsFromSitemap(xml, baseUrl) {
  const localOrigin = new URL(baseUrl).origin;
  let sitemapOrigin;
  const paths = new Set();
  for (const match of String(xml).matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g)) {
    const location = match[1].trim().replaceAll("&amp;", "&");
    const url = new URL(location);
    // The preview generates canonical HTTPS links for its public hostname,
    // even when the smoke itself navigates through a local HTTP port.
    sitemapOrigin ??= url.origin;
    if (
      (url.origin !== localOrigin && url.protocol !== "https:") ||
      url.origin !== sitemapOrigin ||
      url.search ||
      url.hash
    ) {
      throw new Error(`sitemap contains a non-public URL: ${location}`);
    }
    paths.add(url.pathname);
  }
  if (!paths.has("/")) throw new Error("sitemap must include the home page");
  return ["/", ...[...paths].filter((path) => path !== "/").sort()];
}

function formatKiB(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

function routeSourceMatchesPath(source, path) {
  const match = String(source).match(/\/routes\/(.+?)\.[cm]?[jt]sx?(?:\?|$)/);
  if (!match) return false;
  const route = match[1];
  if (route === "__root") return true;
  const segments = route === "index" ? [] : route.split(/[/.]/);
  const pathname = path.split("/").filter(Boolean);
  return (
    segments.length <= pathname.length &&
    segments.every((segment, index) => segment.startsWith("$") || segment === pathname[index])
  );
}

export function startupJavaScriptVerdict(
  requests,
  bundle,
  budgetBytes = STARTUP_CLIENT_BUDGET_BYTES,
  path = "/",
) {
  const routeFiles = new Map(
    (bundle?.routeChunks ?? []).map((chunk) => [chunk.file, chunk.source]),
  );
  const eagerFiles = new Set((bundle?.eagerChunks ?? []).map((chunk) => chunk.file));
  const javascript = [...(requests ?? [])]
    .map((request) => ({
      file: String(request.file ?? "").replace(/^\/+/, ""),
      bytes: Number(request.bytes) || 0,
    }))
    .filter((request) => request.file.endsWith(".js"))
    .sort((a, b) => a.file.localeCompare(b.file));
  const bytes = javascript.reduce((total, request) => total + request.bytes, 0);
  const unexpectedLazyRoutes = javascript
    .filter((request) => routeFiles.has(request.file) && !eagerFiles.has(request.file))
    .map((request) => ({ ...request, source: routeFiles.get(request.file) }))
    .filter(({ source }) => !routeSourceMatchesPath(source, path));
  const failures = [];
  if (bytes > budgetBytes) {
    failures.push(
      `${path}: startup JavaScript ${formatKiB(bytes)} exceeds ${formatKiB(budgetBytes)} budget`,
    );
  }
  if (unexpectedLazyRoutes.length > 0) {
    failures.push(
      `${path}: unexpected lazy route JavaScript requested on initial navigation: ${unexpectedLazyRoutes
        .map(({ source, file }) => `${source} (${file})`)
        .join(", ")}`,
    );
  }
  return { requests: javascript, bytes, budgetBytes, unexpectedLazyRoutes, failures };
}

const TRIVIAL_LEN_DELTA = 20;
const TRIVIAL_LEN_RATIO = 0.1;
const COLLAPSE_RATIO = 0.5;
export function compareToBaseline(current, baseline) {
  const entries = Object.entries(current?.viewports ?? {});
  if (entries.length === 0) {
    return {
      divergesFromBaseline: true,
      reasons: ["current verdict has no viewport data"],
    };
  }
  const reasons = [];
  const baseViewports = baseline?.viewports ?? {};
  for (const [name, cur] of entries) {
    const base = baseViewports[name];
    if (!base) {
      reasons.push(`${name}: no baseline data for this viewport`);
      continue;
    }
    if (cur.status !== base.status) {
      reasons.push(`${name}: HTTP status changed ${base.status} -> ${cur.status}`);
    }
    if (base.title !== undefined && cur.title !== undefined && cur.title !== base.title) {
      reasons.push(`${name}: title changed ("${base.title}" -> "${cur.title}")`);
    }
    if (base.hasCanvas && !cur.hasCanvas) {
      reasons.push(`${name}: canvas disappeared`);
    }
    if (cur.horizontalOverflow && !base.horizontalOverflow) {
      reasons.push(`${name}: horizontal overflow appeared`);
    }
    const baseErrs = (base.consoleErrors?.length ?? 0) + (base.pageErrors?.length ?? 0);
    const curErrs = (cur.consoleErrors?.length ?? 0) + (cur.pageErrors?.length ?? 0);
    if (curErrs > 0 && baseErrs === 0) {
      reasons.push(`${name}: console/page errors appeared (${curErrs})`);
    }
    const baseLen = base.bodyTextLen ?? 0;
    const curLen = cur.bodyTextLen ?? 0;
    if (baseLen > 0 && curLen < baseLen * COLLAPSE_RATIO) {
      reasons.push(`${name}: body text collapsed (${baseLen} -> ${curLen} chars)`);
    } else if (cur.bodyTextHash !== base.bodyTextHash) {
      if (Math.abs(curLen - baseLen) > Math.max(TRIVIAL_LEN_DELTA, baseLen * TRIVIAL_LEN_RATIO)) {
        reasons.push(`${name}: body text changed (${baseLen} -> ${curLen} chars, hash mismatch)`);
      } else if (
        base.bodyTextPrefix !== undefined &&
        cur.bodyTextPrefix !== undefined &&
        cur.bodyTextPrefix !== base.bodyTextPrefix
      ) {
        reasons.push(`${name}: body text replaced (similar length, page start changed)`);
      }
    }
  }
  return { divergesFromBaseline: reasons.length > 0, reasons };
}
export function baselineComparison(current, rawText) {
  let baseline;
  try {
    baseline = JSON.parse(rawText);
  } catch {
    return { divergesFromBaseline: true, reasons: ["baseline unreadable: invalid JSON"] };
  }
  if (
    baseline === null ||
    typeof baseline !== "object" ||
    Array.isArray(baseline) ||
    baseline.viewports === null ||
    typeof baseline.viewports !== "object" ||
    Array.isArray(baseline.viewports)
  ) {
    return { divergesFromBaseline: true, reasons: ["baseline unreadable: not a verdict object"] };
  }
  return compareToBaseline(current, baseline);
}
export function exitCodeFor(viewports, startupJavaScript, routes = {}) {
  const list = Object.values(viewports ?? {});
  if (list.length === 0) return 1;
  const all = [...list, ...Object.values(routes)];
  if (all.some((v) => (v.status ?? 0) >= 400 || (v.status ?? 0) === 0)) return 1;
  if (all.some((v) => (v.consoleErrors?.length ?? 0) > 0 || (v.pageErrors?.length ?? 0) > 0)) {
    return 2;
  }
  if (
    (startupJavaScript?.failures?.length ?? 0) > 0 ||
    Object.values(routes).some((route) => (route.startupJavaScript?.failures?.length ?? 0) > 0)
  )
    return 3;
  return 0;
}
