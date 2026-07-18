# AQUA API proxy local

O proxy local reutiliza o mesmo gateway `/v1` e as mesmas fachadas dos deployments Vercel/Cloudflare. Não persiste dados nem contém integração Airtable, Stripe ou Supabase direta.

Configurar `AQUA_OS_DATA_URL`, `AQUA_OS_COMMERCE_URL`, `AQUA_OS_PRODUCT_KEY`, `SUPABASE_URL` e `SUPABASE_ANON_KEY`; depois executar `npm run dev:proxy` ou `npm run dev`.

As rotas sem versão permanecem como aliases temporários para compatibilidade. Novos clientes usam exclusivamente `/v1`.
