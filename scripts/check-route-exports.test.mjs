import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  checkRouteExports,
  findRouteExportViolations,
  formatRouteExportViolation,
} from "./check-route-exports.mjs";

function makeRoutesRoot(files) {
  const root = mkdtempSync(join(tmpdir(), "route-exports-"));
  const routesDir = join(root, "src", "routes");
  mkdirSync(routesDir, { recursive: true });
  for (const [fileName, source] of Object.entries(files)) {
    writeFileSync(join(routesDir, fileName), source);
  }
  return root;
}

test("allows the Route export and ignores export-like text", () => {
  const violations = findRouteExportViolations(
    `
      const example = "export const NotAnExport = true";
      // export const AlsoNotAnExport = true;
      export const Route = createFileRoute("/")({});
    `,
    "index.tsx",
  );
  assert.deepEqual(violations, []);
});

test("finds named, default, aliased, and wildcard exports", () => {
  const violations = findRouteExportViolations(
    `
      export const Route = {};
      export const Page = {};
      export default Page;
      export { Page as ReusablePage };
      export * from "./shared";
    `,
    "index.tsx",
  );
  assert.deepEqual(
    violations.map(({ exportName }) => exportName),
    ["Page", "default", "ReusablePage", "*"],
  );
});

test("checks every route module and reports its path and line", () => {
  const root = makeRoutesRoot({
    "index.tsx": "export const Route = {};\n",
    "services.$slug.tsx": "export const Route = {};\nexport const Page = {};\n",
    "nested.ts": "export const Helper = {};\n",
  });
  const result = checkRouteExports(root);
  assert.equal(result.files.length, 3);
  assert.deepEqual(result.violations, [
    {
      filePath: "src/routes/nested.ts",
      exportName: "Helper",
      line: 1,
    },
    {
      filePath: "src/routes/services.$slug.tsx",
      exportName: "Page",
      line: 2,
    },
  ]);
});

test("formats a clear route and export failure", () => {
  assert.match(
    formatRouteExportViolation({
      filePath: "src/routes/services.tsx",
      exportName: "ServicesPage",
      line: 4,
    }),
    /src\/routes\/services\.tsx:4 exports "ServicesPage".*only export "Route"/,
  );
});

test("the CLI exits nonzero and identifies the offending route", () => {
  const root = makeRoutesRoot({
    "broken.tsx": "export const Route = {};\nexport const Page = {};\n",
  });
  const script = fileURLToPath(new URL("./check-route-exports.mjs", import.meta.url));
  assert.throws(
    () =>
      execFileSync(process.execPath, [script, "--root", root], {
        encoding: "utf8",
        stdio: "pipe",
      }),
    (error) => {
      assert.equal(error.status, 1);
      assert.match(error.stderr, /src\/routes\/broken\.tsx:2 exports "Page"/);
      return true;
    },
  );
});

test("the current route tree passes the check", () => {
  assert.deepEqual(checkRouteExports().violations, []);
});
