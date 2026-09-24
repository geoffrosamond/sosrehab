#!/usr/bin/env node
/**
 * Complete, self-contained release smoke.
 *
 * The default 120-second timeout covers the production client build, bundle
 * check, preview startup, and browser request capture. Override it with
 * RELEASE_SMOKE_TIMEOUT_MS when a slower CI worker needs more time.
 *
 * This intentionally runs Vite directly instead of `npm run build`: the latter
 * also migrates the database, while this client smoke must not need an external
 * service.
 */
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PREVIEW_URL = "http://127.0.0.1:8081/";
const SCREENSHOT = join(ROOT, "screenshots/release-smoke.png");
const DEFAULT_TIMEOUT_MS = 120_000;
const SHUTDOWN_GRACE_MS = 500;

export function releaseSmokeTimeout(raw = process.env.RELEASE_SMOKE_TIMEOUT_MS) {
  if (raw === undefined || raw === "") return DEFAULT_TIMEOUT_MS;
  const timeout = Number(raw);
  if (!Number.isSafeInteger(timeout) || timeout <= 0) {
    throw new Error("RELEASE_SMOKE_TIMEOUT_MS must be a positive integer");
  }
  return timeout;
}

export function releaseSmokeSteps() {
  return [
    ["node", ["scripts/with-app-env.mjs", "vite", "build"]],
    ["npm", ["run", "check:bundle-size"]],
    ["node", ["scripts/preview.mjs", "restart"]],
    ["node", ["scripts/browser-smoke.mjs", PREVIEW_URL, SCREENSHOT]],
  ];
}

function signalGroup(pid, signal) {
  if (!pid) return;
  try {
    process.kill(-pid, signal);
  } catch (err) {
    if (err?.code !== "ESRCH") throw err;
  }
}

export async function run(command, args, timeout) {
  console.log(`[release-smoke] ${command} ${args.join(" ")}`);
  const child = spawn(command, args, {
    cwd: ROOT,
    env: process.env,
    stdio: "inherit",
    detached: true,
  });
  let spawnError;
  child.on("error", (err) => {
    spawnError = err;
  });
  const closed = new Promise((resolve) => {
    child.once("close", (code, signal) => resolve({ code, signal }));
  });
  let timer;
  const deadline = new Promise((resolve) => {
    timer = setTimeout(() => resolve(null), timeout);
  });
  const result = await Promise.race([closed, deadline]);
  clearTimeout(timer);
  if (result === null) {
    try {
      signalGroup(child.pid, "SIGTERM");
    } finally {
      // The leader can exit before its descendants do. Always signal the group
      // again after the grace period, even if the leader has already closed.
      await new Promise((resolve) => setTimeout(resolve, SHUTDOWN_GRACE_MS));
      signalGroup(child.pid, "SIGKILL");
      await Promise.race([
        closed,
        new Promise((resolve) => setTimeout(resolve, SHUTDOWN_GRACE_MS)),
      ]);
    }
    throw new Error(`${command} ${args.join(" ")} timed out after ${timeout}ms`);
  }
  if (spawnError) throw spawnError;
  if (result.signal) throw new Error(`${command} ended from signal ${result.signal}`);
  if (result.code !== 0)
    throw new Error(`${command} ${args.join(" ")} exited with code ${result.code}`);
}

export function remainingTimeout(deadline, now = Date.now()) {
  const remaining = deadline - now;
  if (remaining <= 0) throw new Error("release smoke timed out");
  return remaining;
}

export async function main(steps = releaseSmokeSteps()) {
  const timeout = releaseSmokeTimeout();
  const deadline = Date.now() + timeout;
  try {
    for (const [command, args] of steps) {
      await run(command, args, remainingTimeout(deadline));
    }
    console.log(`[release-smoke] passed within the ${timeout}ms timeout`);
  } finally {
    // Cleanup gets its own bounded window even when the release deadline was
    // exhausted, so a failed check cannot leave a stale preview behind.
    await run("node", ["scripts/preview.mjs", "stop"], 10_000);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await main();
  } catch (err) {
    console.error(`[release-smoke] FAILED: ${err?.message ?? err}`);
    process.exitCode = 1;
  }
}
