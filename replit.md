# Sydney Occupational Services

## Run on Replit

- Runtime: Node.js 22
- Development command: `npm run dev`
- The app listens on `0.0.0.0:5000` for the Replit web preview.
- The `Start application` workflow starts automatically.

## Deploy

- Target: Cloud Run (`deploymentTarget = "cloudrun"`)
- Build: `npm run build`
- Run: `npm start` → `node .output/server/index.mjs`
- `.output/` is not in git. A deploy with no build command has nothing to serve.

## Local data

- No external database is required for development preview.
- When `DATABASE_URL` is absent, the existing PGLite fallback is used.