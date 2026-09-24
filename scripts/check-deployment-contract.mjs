#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createServer } from "node:net";
import { join } from "node:path";
import { isMainModule, projectRoot } from "./with-app-env.mjs";

const START_COMMAND = "node .output/server/index.mjs";
const DEFAULT_STARTUP_TIMEOUT_MS = 15_000;
const POLL_INTERVAL_MS = 100;

export function checkDeploymentContract(root = projectRoot()) {
  const errors = [];
  const replitConfig = readFileSync(join(root, ".replit"), "utf8");
  const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  const viteConfig = readFileSync(join(root, "vite.config.ts"), "utf8");

  if (!/deploymentTarget\s*=\s*"cloudrun"/.test(replitConfig)) {
    errors.push('.replit must set deploymentTarget = "cloudrun"');
  }
  if (!/preset:\s*"node-server"/.test(viteConfig)) {
    errors.push('Nitro must use the "node-server" preset');
  }
  if (packageJson.scripts?.start !== START_COMMAND) {
    errors.push(`package start command must be "${START_COMMAND}"`);
  }
  if (!existsSync(join(root, ".output/server/index.mjs"))) {
    errors.push("generated Node server is missing at .output/server/index.mjs");
  }
  if (!existsSync(join(root, ".output/public/.vite/manifest.json"))) {
    errors.push("generated client manifest is missing at .output/public/.vite/manifest.json");
  }

  return errors;
}

async function availablePort() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const { port } = server.address();
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  return port;
}

function stopProcessGroup(child) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  try {
    process.kill(-child.pid, "SIGTERM");
  } catch (error) {
    if (error.code !== "ESRCH") {
      console.error(`[deployment-contract] failed to terminate production server: ${error.message}`);
    }
  }
}

export async function smokeProductionServer(
  root = projectRoot(),
  { timeoutMs = DEFAULT_STARTUP_TIMEOUT_MS, fetchImpl = fetch } = {},
) {
  const port = await availablePort();
  const url = `http://127.0.0.1:${port}/`;
  const child = spawn("npm", ["start"], {
    cwd: root,
    detached: true,
    env: { ...process.env, HOST: "127.0.0.1", PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  child.stdout.on("data", (chunk) => (output += chunk));
  child.stderr.on("data", (chunk) => (output += chunk));
  const exited = new Promise((resolve) => child.once("exit", (code, signal) => resolve({ code, signal })));
  const deadline = Date.now() + timeoutMs;

  try {
    while (Date.now() < deadline) {
      const exit = await Promise.race([
        exited,
        new Promise((resolve) => setTimeout(() => resolve(null), POLL_INTERVAL_MS)),
      ]);
      if (exit) {
        throw new Error(
          `production server exited before readiness (${exit.signal ?? `code ${exit.code}`})${output ? `\n${output.trim()}` : ""}`,
        );
      }
      try {
        const response = await fetchImpl(url, { signal: AbortSignal.timeout(1_000) });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return { url, status: response.status };
      } catch {
        // Startup can briefly refuse connections; retry until the shared deadline.
      }
    }
    throw new Error(`production server did not become ready within ${timeoutMs}ms`);
  } finally {
    stopProcessGroup(child);
    await Promise.race([exited, new Promise((resolve) => setTimeout(resolve, 2_000))]);
    if (child.exitCode === null && child.signalCode === null) {
      try {
        process.kill(-child.pid, "SIGKILL");
      } catch (error) {
        if (error.code !== "ESRCH") {
          console.error(`[deployment-contract] failed to kill production server: ${error.message}`);
        }
      }
      await exited;
    }
  }
}

async function main() {
  try {
    const errors = checkDeploymentContract();
    for (const error of errors) console.error(`[deployment-contract] ${error}`);
    if (errors.length > 0) return 1;
    const result = await smokeProductionServer();
    console.log(
      `[deployment-contract] Cloud Run and Nitro Node server output agree; production server returned HTTP ${result.status}.`,
    );
    return 0;
  } catch (error) {
    console.error(`[deployment-contract] ${error.message}`);
    return 2;
  }
}

if (isMainModule(import.meta.url)) {
  process.exitCode = await main();
}