# Instructions for the Replit agent

Sydney Occupational Services. Marketing site. Do not redesign it. Do not change ports, the Nitro preset, or the deploy commands below.

Repo: https://github.com/geoffrosamond/sosrehab
Branch: `main`
Commit to pull: `586cac9` or later.

## First action

```bash
git fetch origin
git checkout main
git pull --ff-only origin main
npm ci
```

If `package-lock.json` contains `package-firewall.replit.internal`, stop. That lockfile cannot install on Cloud Run. Use the lockfile from `main` at `586cac9` or later. Every `resolved` URL must be `https://registry.npmjs.org/`.

Set this before install:

```bash
export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
```

## What this app is

- TanStack Start + Vite + Nitro
- Production preset: `node-server` in `vite.config.ts`. Do not change it to `vercel`, `static`, or `node`.
- Dev server: `npm run dev` → `0.0.0.0:5000`. Do not move it to 8080.
- Production server: `npm start` → `node .output/server/index.mjs`
- `.output/` is gitignored. It does not exist until `npm run build`. Never deploy the git tree as if it were already built.
- No `DATABASE_URL` is required. Migrate skips, and PGLite is the fallback. Do not add a Replit database.

## Preview (Run button)

`.replit` is already correct. Do not rewrite the workflow.

- Command: `npm run dev`
- Wait for port **5000**
- Webview on port 5000

## Deploy (this is what failed twice)

Use **Autoscale / Cloud Run**. Not Static. Not Reserved VM. Not the Run button.

`.replit` must contain exactly:

```toml
[deployment]
deploymentTarget = "cloudrun"
build = ["npm", "run", "build"]
run = ["npm", "start"]
```

Do not delete those `build` or `run` lines. Do not set the deploy run command to `npm run dev`.

Then publish a new deployment from current `main`. Replit must run the build on the deploy VM. Expected build result:

- `.output/server/index.mjs` exists
- `npm run check:deployment` prints HTTP 200
- The process listens on `0.0.0.0` and the platform `PORT`

`npm start` is `node .output/server/index.mjs`. Do not wrap it in `vite preview`.

## Do not

- Do not force-push or rewrite history.
- Do not change `package.json` scripts `dev`, `build`, or `start`.
- Do not commit `.output/`, `node_modules/`, or `.env`.
- Do not add a new framework, static export, or `index.html` hosting.
- Do not install Playwright browsers.
