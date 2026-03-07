# Airtable proxy (local)

This folder runs a small local proxy so the static frontend can call Airtable without exposing credentials.

## Setup

Create a `.env` file (example in the repo root `.env.example`):

- `AIRTABLE_PAT`
- `AIRTABLE_BASE_ID`
- `AIRTABLE_TABLE_ID` (table id or table name)
- `AIRTABLE_RATINGS_TABLE_ID` (table id or table name, for 1–5 star ratings)
- `STRIPE_SECRET_KEY` (for checkout + billing portal)
- `STRIPE_PRICE_ID_PRO` (subscription price id)
- `PUBLIC_SITE_URL` (recommended; example `http://localhost:5173`)
- `AIRTABLE_BILLING_TABLE_ID` (subscription records)
- `AIRTABLE_BILLING_BASE_ID` (optional; falls back to `AIRTABLE_BASE_ID`)

## Run

```bash
cd "/Users/paulogoncalves/Desktop/04-AQUA Apps/AQUA AI Tools Site"
# Option A: use a local `.env` file (recommended)
# cp .env.example .env
# and fill the values
#
# Option B: export env vars manually
# export AIRTABLE_PAT="..."
# export AIRTABLE_BASE_ID="app..."
# export AIRTABLE_TABLE_ID="tbl... or TableName"
node proxy/server.mjs
```

Depois arranca o frontend (Vite). O `vite.config.js` faz proxy de `/airtable` para `http://localhost:3001`.
O preview de sites usa `GET /preview` (também via proxy).
O billing local usa `/billing/checkout`, `/billing/session-status`, `/billing/subscription` e `/billing/portal`.
O estado de subscrição é lido/escrito em `AIRTABLE_BILLING_TABLE_ID`.
