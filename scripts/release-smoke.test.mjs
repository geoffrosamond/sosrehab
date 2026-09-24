import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { releaseSmokeSteps, releaseSmokeTimeout, remainingTimeout, run } from "./release-smoke.mjs";

const ROOT = join(fileURLToPath(new URL("..", import.meta.url)));
const PREVIEW_SCRIPT = join(ROOT, "scripts/preview.mjs");
const RELEASE_SCRIPT = join(ROOT, "scripts/release-smoke.mjs");
const BROWSER_SCRIPT = join(ROOT, "scripts/browser-smoke.mjs");

function canBindPreviewPort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(8081, "127.0.0.1", () => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });
}

function stopPreview() {
  return spawnSync(process.execPath, [PREVIEW_SCRIPT, "stop"], {
    cwd: ROOT,
    encoding: "utf8",
    timeout: 10_000,
  });
}

function cleanupFixture(fixture) {
  let pid = null;
  try {
    pid = Number(readFileSync(join(fixture, ".grok/preview.pid"), "utf8"));
  } catch (err) {
    if (err?.code !== "ENOENT") throw err;
  }
  try {
    stopPreview();
    // Reap the detached npm wrapper as well if it is still running.
    if (pid > 1) {
      try {
        const stat = readFileSync(`/proc/${pid}/stat`, "utf8");
        const pgid = Number(stat.slice(stat.lastIndexOf(") ") + 2).split(/\s+/)[2]);
        if (pgid === pid) process.kill(-pid, "SIGKILL");
      } catch (err) {
        if (err?.code !== "ENOENT" && err?.code !== "ESRCH") throw err;
      }
    }
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
}

test("release smoke has a documented two-minute default timeout", () => {
  assert.equal(releaseSmokeTimeout(undefined), 120_000);
  assert.equal(releaseSmokeTimeout("90000"), 90_000);
});

test("release smoke rejects invalid timeout overrides", () => {
  for (const value of ["0", "-1", "1.5", "nope"]) {
    assert.throws(() => releaseSmokeTimeout(value), /positive integer/);
  }
});

test("release smoke builds, checks, previews, then captures in a browser", () => {
  assert.deepEqual(releaseSmokeSteps(), [
    ["node", ["scripts/with-app-env.mjs", "vite", "build"]],
    ["npm", ["run", "check:bundle-size"]],
    ["node", ["scripts/preview.mjs", "restart"]],
    [
      "node",
      [
        "scripts/browser-smoke.mjs",
        "http://127.0.0.1:8081/",
        join(process.cwd(), "screenshots/release-smoke.png"),
      ],
    ],
  ]);
});

test("remaining timeout decreases and fails closed at the deadline", () => {
  assert.equal(remainingTimeout(500, 125), 375);
  assert.throws(() => remainingTimeout(500, 500), /timed out/);
});

test(
  "a timed-out phase force-stops descendants that ignore SIGTERM",
  { skip: process.platform !== "linux" },
  async () => {
    const dir = mkdtempSync(join(tmpdir(), "release-smoke-"));
    const pidFile = join(dir, "descendant.pid");
    const childScript = `
    const { writeFileSync } = require("node:fs");
    process.on("SIGTERM", () => {});
    writeFileSync(process.argv[1], String(process.pid));
    setInterval(() => {}, 1000);
  `;
    const parentScript = `
    const { spawn } = require("node:child_process");
    spawn(process.execPath, ["-e", ${JSON.stringify(childScript)}, process.argv[1]], { stdio: "ignore" });
    setInterval(() => {}, 1000);
  `;
    let pid;
    try {
      await assert.rejects(run(process.execPath, ["-e", parentScript, pidFile], 1000), /timed out/);
      pid = Number(readFileSync(pidFile, "utf8"));
      // A zombie has stopped executing but may not be reaped by the sandbox init.
      const state = () => {
        try {
          return readFileSync(`/proc/${pid}/stat`, "utf8").match(/\)\s+(\S)/)?.[1];
        } catch (err) {
          if (err.code === "ENOENT") return null;
          throw err;
        }
      };
      for (let i = 0; i < 20 && state() !== null && state() !== "Z"; i++) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      assert.ok(state() === null || state() === "Z", `descendant ${pid} is still running`);
    } finally {
      if (pid) {
        try {
          process.kill(pid, "SIGKILL");
        } catch {
          // The descendant may already have exited.
        }
      }
      rmSync(dir, { recursive: true, force: true });
    }
  },
);
test("failed browser smoke releases the isolated preview port", { timeout: 30_000 }, async () => {
  // Never stop another process's preview just to run this test.
  await canBindPreviewPort();
  const fixture = mkdtempSync(join(tmpdir(), "release-smoke-preview-"));
  try {
    // Run the real preview controller against a tiny, self-contained npm preview
    // fixture so the integration test does not depend on a prior production build.
    mkdirSync(join(fixture, "scripts"));
    copyFileSync(PREVIEW_SCRIPT, join(fixture, "scripts/preview.mjs"));
    writeFileSync(
      join(fixture, "package.json"),
      JSON.stringify({ private: true, scripts: { preview: "node server.mjs" } }),
    );
    writeFileSync(
      join(fixture, "server.mjs"),
      'import { createServer } from "node:http";\n' +
        'createServer((_, res) => res.end("fixture")).listen(8081, "127.0.0.1");\n',
    );
    const steps = [
      [process.execPath, [join(fixture, "scripts/preview.mjs"), "restart"]],
      [process.execPath, [BROWSER_SCRIPT, "--test-force-failure"]],
    ];
    const code = `import { main } from ${JSON.stringify(pathToFileURL(RELEASE_SCRIPT).href)}; try { await main(${JSON.stringify(steps)}); } catch (err) { console.error("[release-smoke] FAILED:", err.message); process.exitCode = 1; }`;
    const result = spawnSync(process.execPath, ["--input-type=module", "-e", code], {
      cwd: ROOT,
      env: { ...process.env, RELEASE_SMOKE_TIMEOUT_MS: "15000" },
      encoding: "utf8",
      timeout: 20_000,
    });
    assert.equal(result.error, undefined, result.stderr);
    assert.equal(result.status, 1, "browser failure must fail the release command");
    assert.match(result.stdout, /\[preview\] serving http:\/\/127\.0\.0\.1:8081\//, result.stderr);
    assert.match(result.stdout, /browser-smoke\.mjs --test-force-failure/);
    assert.match(result.stderr, /unknown flag: --test-force-failure/);
    assert.match(
      result.stderr,
      /\[release-smoke\] FAILED: .*browser-smoke\.mjs --test-force-failure exited with code 1/,
    );
    await canBindPreviewPort();
  } finally {
    // Also clean up if the subprocess times out or an assertion fails.
    cleanupFixture(fixture);
  }
});
