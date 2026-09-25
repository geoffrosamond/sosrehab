# Sydney Occupational Services

Redesign of [sosrehab.com.au](https://sosrehab.com.au) / [sydneyoccupationalservices.com.au](https://sydneyoccupationalservices.com.au).

SIRA-accredited workplace rehabilitation across Greater Sydney, the Hunter and Wollongong.

**GitHub:** https://github.com/geoffrosamond/sosrehab

## Stack

React 19, TanStack Start, Tailwind CSS v4. Node 20.19+.

## Run locally

```bash
npm install
npm run dev
```

Opens on port 5000 in Replit.

## Deploy on Replit

Cloud Run does not ship the git tree as a running server. The production app is built on deploy.

1. Import `https://github.com/geoffrosamond/sosrehab`
2. Deploy as **Autoscale / Cloud Run** (not Reserved VM, not Static)
3. Replit reads [`.replit`](.replit):
   - Build: `npm run build` (Nitro `node-server` → `.output/server/index.mjs`)
   - Run: `npm start`
4. The server listens on `0.0.0.0` and Replit’s `PORT`

Development preview stays on port 5000 (`npm run dev`). Do not deploy the dev server. The checked-in
development setting disables sign-in for the preview; production authentication
is controlled by the publishing environment.
