#!/usr/bin/env bash
set -euo pipefail

# The dev workflow stays live through merge setup and Vite writes under
# node_modules/.vite. npm ci removes node_modules wholesale, racing that cache.
# Install incrementally from the committed lockfile instead.
npm install --no-audit --no-fund --prefer-offline
npx playwright install chromium
npm run db:migrate