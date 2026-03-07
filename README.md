# AQUA AI Tools Site

Frontend em **Vite + React** que consome dados do Airtable via endpoint **`/airtable`** (segredos apenas no servidor).

## Requisitos

- Node.js 18+ (ideal 20+)

## Dev (local)

Terminal 1 (proxy local que fala com Airtable):

```bash
cd "/Users/paulogoncalves/Desktop/04-AQUA Apps/AQUA AI Tools Site"
export AIRTABLE_PAT="..."
export AIRTABLE_BASE_ID="app..."
export AIRTABLE_TABLE_ID="tbl... ou NomeDaTabela"
export AIRTABLE_RATINGS_TABLE_ID="tbl... ou NomeDaTabelaRatings"
export STRIPE_SECRET_KEY="sk_live_... ou sk_test_..."
export STRIPE_PRICE_ID_PRO="price_..."
export PUBLIC_SITE_URL="http://localhost:5173"
export AIRTABLE_BILLING_TABLE_ID="tbl... ou NomeDaTabelaBilling"
node proxy/server.mjs
```

Terminal 2 (Vite):

```bash
npm install
npm run dev
```

O Vite faz proxy de `/airtable` para `http://localhost:3001` (ver `vite.config.js`).
O formulário de submissão usa `POST /submit` (também via proxy local).
Os previews de sites usam `GET /preview` (também via proxy local).
O checkout Pro usa `POST /billing/checkout`, `GET /billing/session-status`, `GET /billing/subscription` e `POST /billing/portal`.

## Deploy (Vercel)

- Define env vars no projeto Vercel: `AIRTABLE_PAT`, `AIRTABLE_BASE_ID`, `AIRTABLE_TABLE_ID`
- (Opcional) `AIRTABLE_SUBMIT_TABLE_ID` para usar uma tabela separada para submissões
- (Opcional) `AIRTABLE_RATINGS_TABLE_ID` para gravar e computar avaliações (1–5 estrelas)
- Para subscrição Pro: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID_PRO`, `PUBLIC_SITE_URL` e `AIRTABLE_BILLING_TABLE_ID`
- (Opcional) `AIRTABLE_BILLING_BASE_ID` se as subscrições viverem noutra base
- O `vercel.json` faz rewrite de `/airtable` para `/api/airtable`
  e de `/submit` para `/api/submit` (e também `/rate`, `/ratings`, `/preview` e `/billing/*`)

## Deploy (Cloudflare Pages)

Este projeto pode correr em **Cloudflare Pages** com **Pages Functions** para manter:
`/airtable`, `/submit`, `/rate`, `/ratings`, `/preview`, `/billing/checkout`, `/billing/session-status`, `/billing/subscription`, `/billing/portal`.

### Build settings

- Build command: `npm run build`
- Output directory: `dist`

### Env vars (Cloudflare Pages → Settings → Environment variables)

- `AIRTABLE_PAT`
- `AIRTABLE_BASE_ID`
- `AIRTABLE_TABLE_ID`
- (Opcional) `AIRTABLE_SUBMIT_TABLE_ID`
- (Recomendado) `AIRTABLE_RATINGS_TABLE_ID`
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID_PRO`
- `PUBLIC_SITE_URL`
- `AIRTABLE_BILLING_TABLE_ID`
- (Opcional) `AIRTABLE_BILLING_BASE_ID`

### Tabela de billing no Airtable

Cria uma tabela para subscrições com estes campos:

- `Key` (single line text, usado para upsert; guardar o email em minúsculas)
- `UserEmail` (email ou single line text)
- `Plan` (single line text)
- `Status` (single line text)
- `CustomerId` (single line text)
- `CheckoutSessionId` (single line text)
- `CurrentPeriodEnd` (date/time ou texto ISO)
- `UpdatedAt` (date/time ou texto ISO)

### SPA routing

Existe um `public/_redirects` com `/* /index.html 200` para suportar rotas do React Router.

## Troubleshooting

- Se o `/airtable` devolver `{"error":"NOT_FOUND"}` do Airtable, confirma:
  - `AIRTABLE_BASE_ID` está correto (começa por `app...`)
  - `AIRTABLE_TABLE_ID` é **o id `tbl...`** ou o **nome da tabela** (evita colar nomes já URL-encoded tipo `Table%201`)
  - o `AIRTABLE_PAT` tem acesso à base e scope de leitura de records

## Legacy

A versão antiga em HTML/JS puro está em `legacy/`.
