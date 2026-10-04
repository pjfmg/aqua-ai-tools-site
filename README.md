# AQUA AI Tools Site

Frontend em **Vite + React** que consome a API pública versionada **`/v1`** (segredos apenas no servidor).

A identidade utiliza **Supabase Auth**. Billing pertence ao **AQUA OS Commerce** e os dados operacionais à **AQUA OS Data Platform**; este produto contém apenas fachadas de integração.

## Requisitos

- Node.js 20+

## Dev (local)

Terminal 1 (proxy local para os serviços AQUA OS):

```bash
cd "/Volumes/AQUA SSD/04-AQUA Apps/APPS/Tech/AQUA AI Tools Site/Web"
export VITE_SUPABASE_URL="https://<project-ref>.supabase.co"
export VITE_SUPABASE_ANON_KEY="..."
export SUPABASE_URL="$VITE_SUPABASE_URL"
export SUPABASE_ANON_KEY="$VITE_SUPABASE_ANON_KEY"
export SUPABASE_SERVICE_ROLE_KEY="..." # apenas no servidor; rate limiting/auditoria duráveis
export AQUA_OS_COMMERCE_URL="http://localhost:3100"
export AQUA_OS_DATA_URL="http://localhost:3200"
export AQUA_OS_PRODUCT_KEY="..."
node proxy/server.mjs
```

Terminal 2 (Vite):

```bash
npm install
npm run dev
```

`npm run dev` arranca o frontend Vite e o proxy local ao mesmo tempo.
Se precisares de correr só um deles:

```bash
npm run dev:proxy
npm run dev:vite
```

O Vite encaminha `/v1/*` para `http://localhost:3001`. Diretório, submissões, ratings, imagens, previews, billing e entitlements usam exclusivamente contratos `/v1` no frontend.

## AQUA Weekly

A homepage inclui um convite persistente e uma janela de subscrição semanal, bilingue e acessível. A janela só aparece automaticamente depois de existir uma escolha de privacidade, fica suprimida durante 30 dias quando é fechada e deixa de aparecer após uma subscrição concluída.

O endpoint público `POST /v1/newsletter-subscriptions` valida email, temas e idioma, aplica rate limiting e encaminha a subscrição para `POST /v1/marketing/newsletter-subscriptions` na AQUA OS Data Platform. A automação semanal e o envio das edições pertencem ao serviço de marketing da plataforma; o frontend nunca recebe as respetivas credenciais.

## Deploy (Vercel)

- Para subscrição Pro: `AQUA_OS_COMMERCE_URL` e `AQUA_OS_PRODUCT_KEY`
- Para dados operacionais: `AQUA_OS_DATA_URL` e `AQUA_OS_PRODUCT_KEY`
- Para autenticação: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL` e `SUPABASE_ANON_KEY`
- Para rate limiting e auditoria duráveis: `SUPABASE_SERVICE_ROLE_KEY` apenas no runtime do servidor
- (Opcional) `VITE_ADSENSE_CLIENT` e `VITE_ADSENSE_SLOT` para trocar publisher/slot sem editar código
- `VITE_ADSENSE_TCF_READY=true` como interlock de deployment; isoladamente nunca autoriza publicidade
- `VITE_CMP_BOOTSTRAP_ENABLED=true` apenas depois de a mensagem europeia estar publicada
- `VITE_CMP_PROVIDER=google-privacy-messaging` para autorizar exclusivamente a CMP Google configurada
- `VITE_CMP_CERTIFIED=true` apenas com evidência atual de certificação da CMP
- `VITE_CMP_MESSAGE_PUBLISHED=true` depois de publicar a mensagem em AdSense → Privacy & messaging
- `VITE_GOOGLE_CMP_TAG_URL` com o URL HTTPS exato fornecido pela Google (`fundingchoicesmessages.google.com/i/...pub-...`)
- `VITE_TCF_VERSION=2.3` para declarar a versão TCF validada
- `VITE_ADSENSE_SITE_APPROVED=true` após aprovação do site pelo fornecedor
- `VITE_ADS_TXT_AUTHORIZED=true` após validação do vendedor em `ads.txt`
- `VITE_ADVERTISING_EMERGENCY_STOP=true` para suspender imediatamente os pedidos
- `VITE_ADVERTISING_REGION=unknown` quando não existe classificação regional fiável; aplica a regra mais restritiva
- O `vercel.json` encaminha `/v1/*` para o gateway governado. As rotas antigas continuam temporariamente disponíveis para compatibilidade.

## Deploy (Cloudflare Pages)

Este projeto pode correr em **Cloudflare Pages** através da Function catch-all `/v1/[[path]]`.

`/billing/portal` permanece publicado apenas como endpoint suspenso e responde com HTTP 503, sem contactar a Stripe.

### Build settings

- Build command: `npm run build`
- Output directory: `dist`

### Env vars (Cloudflare Pages → Settings → Environment variables)

- `AQUA_OS_COMMERCE_URL`
- `AQUA_OS_DATA_URL`
- `AQUA_OS_PRODUCT_KEY`
- `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no ambiente de build
- `SUPABASE_URL` e `SUPABASE_ANON_KEY` no ambiente runtime das Functions
- `SUPABASE_SERVICE_ROLE_KEY` no runtime das Functions, nunca no build do frontend
- (Opcional) `VITE_ADSENSE_CLIENT`
- (Opcional) `VITE_ADSENSE_SLOT`
- Flags da Trust Platform acima; todas as provas operacionais são explícitas e `false`/`unknown` por defeito

## Dados do diretório

O endpoint `/v1/tools` aceita `status`:

- `published` (default): `Published` ativo e exclui duplicados/inoperacionais
- `eligible`: exclui duplicados/inoperacionais, sem exigir `Published`
- `all`: devolve todos os registos acessíveis pela view/tabela configurada

A UI em `/ferramentas` permite alternar estes modos. O modo público por defeito continua a ser `published`.

Também aceita filtros server-side:

- `q`: pesquisa em `Nome`, `Site`, `Descrição` e `Funções`
- `number`: corresponde exatamente a `Número`
- `area`: pesquisa em `Área/Categoria`
- `price`: corresponde exatamente a `Preço`

Na UI estes filtros são enviados ao servidor com debounce, enquanto `Visitado` e `Favorito` continuam no cliente por serem listas pessoais.

Campos canónicos usados para controlo operacional:

- `Published`
- `Duplicated`
- `Site Status`
- `Operational Status`

O PostgreSQL/Supabase da AQUA Data Platform é a fonte oficial. O Airtable existe apenas como origem transitória do importador documentado em `AQUA OS/Services/DataPlatform`.

O frontend não inventa descrições para campos editoriais em falta e remove defensivamente ferramentas com o mesmo identificador ou website canónico. A auditoria, os limites e a remediação upstream estão em [`docs/catalog-quality.md`](docs/catalog-quality.md).

## AQUA OS Data Platform

As entidades `Tool`, `ToolSubmission` e `ToolRating`, respetivas migrations, RLS, retenção e importador idempotente pertencem a `AQUA OS/Services/DataPlatform`. O produto não contém credenciais Airtable nem acede diretamente ao PostgreSQL.

## Autenticação

- O registo e o login usam email e palavra-passe através do Supabase Auth.
- Se a confirmação de email estiver ativa no Supabase, o utilizador tem de confirmar o email antes de iniciar sessão.
- Checkout, confirmação de checkout, consulta de subscrição e gravação de ratings exigem `Authorization: Bearer <access_token>`.
- A submissão de ferramentas também exige sessão autenticada.
- Billing e autorização Pro são validados pelo AQUA OS Commerce; ratings continuam validados pela fachada do produto.
- O AQUA OS ignora qualquer email enviado no body ou query string e deriva a identidade do token Supabase.
- A `SUPABASE_SERVICE_ROLE_KEY` existe apenas nos runtimes server-side e permite rate limiting/auditoria persistentes. Nunca a prefixar com `VITE_`.

## API v1 e governação

A especificação está em [`docs/api-v1.openapi.yaml`](docs/api-v1.openapi.yaml). Todas as respostas JSON seguem `{ data, meta: { traceId }, errors }`; imagens e previews mantêm body binário. Cada operação publica `X-Trace-Id` e cabeçalhos `RateLimit-*`.

As políticas variam entre 5 submissões/hora e 120 leituras/minuto. Em produção são atómicas no Supabase através de `AQUA OS/Services/APIPlatform/migrations/001_api_governance.sql`; sem a migração/chave, o desenvolvimento usa limites por processo em memória. A auditoria guarda operação, hash do principal, estado e duração — nunca tokens, emails ou bodies.

As rotas sem versão (`/airtable`, `/submit`, `/rate`, `/ratings`, `/preview`, `/img` e `/billing/*`) estão depreciadas e destinam-se apenas a clientes antigos. Novos consumidores devem usar `/v1`; a remoção exige uma versão major e aviso prévio.

## Observabilidade e operação

- `/v1/health/live` confirma o runtime sem contactar dependências.
- `/v1/health/ready` valida configuração, Data Platform e Commerce, respondendo `503` quando o produto não está pronto.
- O gateway propaga `X-Trace-Id`, publica `Server-Timing` e produz eventos RED estruturados sem bodies, emails ou tokens.
- Leituras AQUA OS repetem uma vez falhas transitórias; escritas nunca são repetidas automaticamente. Cinco falhas abrem o circuit breaker durante 30 segundos.
- SLOs, alertas, diagnóstico e recuperação estão em [`docs/operations-runbook.md`](docs/operations-runbook.md).

## Ciclo de vida do consentimento

A escolha local usa o contrato v1 da AQUA OS Trust Platform e não contém
identidade. Expira após 180 dias, é invalidada quando a versão da política muda
e nunca é renovada automaticamente. A aplicação pede uma nova decisão com o
motivo adequado.

Uma revogação grava `revokedAt`, nega imediatamente analytics/publicidade,
remove scripts opcionais controlados pelo produto e apaga cookies de tracking
conhecidos. Uma escolha posterior cria um registo novo sem reutilizar a
revogação. Alterações em outro separador são propagadas pelo evento `storage`.

## Versão em inglês

O site suporta rotas em inglês com o prefixo `/en`, incluindo:

- `/en`
- `/en/tools`
- `/en/submit`
- `/en/pro`
- `/en/blog`
- `/en/about`
- `/en/contact`
- `/en/privacy`
- `/en/terms`

O seletor de idioma no topo alterna entre português e inglês e tenta manter o utilizador na página equivalente.

## Testes mínimos

```bash
npm run test:smoke
npm run test:e2e:privacy
npm run build
```

Na primeira execução dos testes E2E, instalar o Chromium gerido pelo Playwright:

```bash
npx playwright install chromium
```

A suíte de privacidade cobre aceitar, recusar, revogar, expirar,
reconsentimento, GPC/DNT, região desconhecida e CMP indisponível. Os fornecedores
opcionais são intercetados durante o teste, provando que não carregam antes de
autorização sem enviar tráfego real.

## Auditoria de decisões Trust

Cada alteração efetiva das decisões `bootstrap-consent` e `request-ad` produz um
evento local `aqua:trust-decision`, validado pelo contrato
`@aqua-os/trust-decision-audit`. O payload contém apenas produto, superfície,
política/versionamento, ação, modo, resultado, códigos de motivo e timestamp.

Não existe transmissão ou persistência central por defeito. Um sink operacional
futuro deve subscrever explicitamente o evento e aplicar acesso e retenção
aprovados. Email, IP, conteúdo, escolha integral e string TCF são rejeitados pelo
contrato.

## Versões dos packages Trust

Enquanto a release coordenada `1.0.0` estiver em estado `prepared`, o produto
consome snapshots `file:` reconciliados com o AQUA OS. O smoke test
`npm run test:trust-packages` verifica nomes, versões e modo de consumo.

Depois de uma publicação aprovada, o manifesto passa a `published` e as três
dependências devem usar versões registry exatas. Ranges `^`, `~`, tags e URLs
mutáveis não são aceites para produção.

Para executar o quality gate completo usado pela CI:

```bash
npm run check
```

Para validar a configuração do runtime sem expor valores:

```bash
npm run release:config
```

Depois de um deployment, validar liveness, readiness, release observada e catálogo:

```bash
npm run release:readiness -- --base-url https://aqua-aitools.com --expected-release <commit>
npm run catalog:quality:production
```

O procedimento completo e a evidência necessária estão em [`docs/release-gate.md`](docs/release-gate.md). Para guardar a auditoria do catálogo, acrescentar `--evidence audit/catalog-quality.json`; `--enforce` transforma critérios não cumpridos em falha do comando.

A arquitetura, matriz dos oito pontos, checklist de deployment, registo de dívida e release candidate estão em `docs/`. O estado atual é **Review**; a conclusão do código não autoriza publicação sem as ações e aprovações externas listadas.

Os smoke tests validam autenticação, envelopes, rate limiting, integrações AQUA OS Data Platform/Commerce, AdSense e `ads.txt`.

### AQUA OS Commerce

O serviço partilhado encontra-se em `AQUA OS/Services/Commerce`. Stripe, webhooks, persistência de subscrições e decisão de entitlement não pertencem a este repositório.

### SPA routing

Existe um `public/_redirects` com `/* /index.html 200` para suportar rotas do React Router.

## Troubleshooting

- `AQUA_OS_DATA_NOT_CONFIGURED`: confirmar `AQUA_OS_DATA_URL` e `AQUA_OS_PRODUCT_KEY` no runtime do produto.
- `DATA_PLATFORM_NOT_CONFIGURED`: confirmar `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` no serviço Data Platform.
- Diretório vazio após a migração: executar primeiro `migrations/001_catalog.sql`, depois o importador Airtable e validar a contagem de ferramentas publicadas.

## Legacy

A versão antiga em HTML/JS puro está em `legacy/`.
