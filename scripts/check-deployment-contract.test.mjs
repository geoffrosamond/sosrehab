import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  checkDeploymentContract,
  smokeProductionServer,
} from "./check-deployment-contract.mjs";

function makeProject({
  target = "cloudrun",
  preset = "node-server",
  start = "node .output/server/index.mjs",
  server = true,
  manifest = true,
} = {}) {
  const root = mkdtempSync(join(tmpdir(), "deployment-contract-"));
  writeFileSync(join(root, ".replit"), `[deployment]\ndeploymentTarget = "${target}"\n`);
  writeFileSync(join(root, "package.json"), JSON.stringify({ scripts: { start } }));
  writeFileSync(join(root, "vite.config.ts"), `nitro({ preset: "${preset}" })`);
  if (server) {
    mkdirSync(join(root, ".output/server"), { recursive: true });
    writeFileSync(join(root, ".output/server/index.mjs"), "");
  }
  if (manifest) {
    mkdirSync(join(root, ".output/public/.vite"), { recursive: true });
    writeFileSync(join(root, ".output/public/.vite/manifest.json"), "{}");
  }
  return root;
}

test("accepts a Cloud Run-compatible Nitro Node deployment", () => {
  assert.deepEqual(checkDeploymentContract(makeProject()), []);
});

test("reports every incompatible part of the deployment contract", () => {
  const errors = checkDeploymentContract(
    makeProject({
      target: "autoscale",
      preset: "vercel",
      start: "vite preview",
      server: false,
      manifest: false,
    }),
  );
  assert.equal(errors.length, 5);
  assert.match(errors.join("\n"), /cloudrun.*node-server.*start command.*Node server.*manifest/s);
});

function makeServerProject(source) {
  const root = mkdtempSync(join(tmpdir(), "production-server-smoke-"));
  mkdirSync(join(root, ".output/server"), { recursive: true });
  writeFileSync(
    join(root, "package.json"),
    JSON.stringify({ scripts: { start: "node .output/server/index.mjs" } }),
  );
  writeFileSync(join(root, ".output/server/index.mjs"), source);
  return root;
}

async function waitForFile(path, timeoutMs = 2_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      return readFileSync(path, "utf8");
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
  }
  throw new Error(`timed out waiting for ${path}`);
}

test("launches the package production command and verifies an HTTP response", async (t) => {
  const root = makeServerProject(`
    import { createServer } from "node:http";
    createServer((_request, response) => response.end("ready"))
      .listen(Number(process.env.PORT), process.env.HOST);
  `);
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const result = await smokeProductionServer(root, { timeoutMs: 5_000 });
  assert.equal(result.status, 200);
});

test("terminates the production process group when readiness times out", async (t) => {
  const marker = join(tmpdir(), `production-server-child-${process.pid}-${Date.now()}`);
  const root = makeServerProject(`
    import { spawn } from "node:child_process";
    import { writeFileSync } from "node:fs";
    const child = spawn(process.execPath, ["-e", "setInterval(() => {}, 1000)"]);
    writeFileSync(${JSON.stringify(marker)}, String(child.pid));
    setInterval(() => {}, 1000);
  `);
  t.after(() => {
    rmSync(root, { recursive: true, force: true });
    rmSync(marker, { force: true });
  });

  const smoke = smokeProductionServer(root, { timeoutMs: 3_000 });
  const childPid = Number(await waitForFile(marker));
  await assert.rejects(smoke, /did not become ready/);
  assert.throws(() => process.kill(childPid, 0), { code: "ESRCH" });
});