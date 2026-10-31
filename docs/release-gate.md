# AQUA AI Tools — Release Gate

## Objetivo

Impedir que uma versão seja tratada como pronta apenas porque o build terminou. Uma release exige evidência de código, configuração, dependências, dados, operação e aprovação.

## 1. Gate do código

Executar num checkout limpo:

```bash
npm ci
npx playwright install chromium
npm run check
npm audit --audit-level=high
```

O `npm run check` valida contratos, privacidade, operações, readiness, build de produção e artefactos de release.
A suíte Playwright interceta Analytics, Clarity e AdSense, valida o seu bloqueio
antes de autorização e não contacta fornecedores reais.
Também confirma que os eventos `aqua:trust-decision` respeitam o contrato
minimizado e não contêm escolha, identidade, conteúdo, IP ou string TCF.

## 2. Gate de configuração

No ambiente de deployment, executar:

```bash
npm run release:config
```

O comando apenas publica os nomes de configurações ausentes ou inválidas; nunca publica valores. São obrigatórios:

- `AQUA_OS_DATA_URL`
- `AQUA_OS_COMMERCE_URL`
- `AQUA_OS_PRODUCT_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VERCEL_GIT_COMMIT_SHA`, `CF_PAGES_COMMIT_SHA` ou `AQUA_RELEASE`

Os identificadores imutáveis fornecidos pelo host têm precedência sobre um
`AQUA_RELEASE` configurado manualmente, evitando que uma variável antiga faça
uma nova publicação anunciar a release errada.

URLs externas têm de usar HTTPS. HTTP é permitido apenas para serviços locais.

## 3. Gate público do deployment

Depois do deployment:

```bash
npm run release:readiness -- \
  --base-url https://aqua-aitools.com \
  --expected-release <commit-ou-release> \
  --evidence /caminho/seguro/release-readiness.json
```

O runtime Vercel é o alvo canónico para os gates server-side de preview e
produção, porque recebe a configuração privada das dependências. O deployment
Cloudflare Pages é um canary público de frontend, headers e comportamento
default-deny; enquanto não tiver a mesma configuração privada, um `503` nesse
host é esperado e não pode ser usado como prova de readiness nem como motivo
para ignorar o resultado do Vercel. A evidência deve registar sempre o URL e o
commit exatos que foram medidos.

O gate exige:

- `/v1/health/live` com HTTP 200, identidade correta e release não-development;
- `/v1/health/ready` com HTTP 200 e todas as dependências `ok`;
- `/v1/tools?pageSize=1` com HTTP 200 e pelo menos um registo publicado;
- envelopes JSON e `X-Trace-Id` coerente;
- health checks com `Cache-Control: no-store`.

### Trust Platform

Publicidade tem um gate próprio e não herda o resultado do readiness geral:

```bash
npm run trust:readiness -- \
  --base-url https://aqua-aitools.com \
  --browser-evidence /caminho/seguro/trust-browser-evidence.json \
  --evidence /caminho/seguro/trust-readiness.json
```

O gate exige HTTPS/HSTS/CSP, `ads.txt`, bundle integrado, plataforma ready,
`__tcfapi`, CMP carregada, presença de prova TCF e evento
`tcloaded`/`useractioncomplete`. A evidência de browser contém apenas estados;
a string TCF nunca é gravada.

## 4. Gate de dados e fornecedores

Cada ação exige evidência própria, sem copiar segredos:

| Controlo | Evidência mínima |
|---|---|
| Migrations | versão/hash, ambiente, ordem aplicada, resultado e responsável |
| Importação | contagem origem/destino, duplicados, rejeitados e reconciliação |
| RLS/retenção | casos anon/authenticated/service_role e resultado |
| Supabase Auth | redirect URLs, confirmação de email e login/logout testados |
| Shopify | webhook assinado, evento de teste, idempotência e entitlement resultante |
| Backup/restore | backup identificado, restore isolado e validação de integridade |
| Trust Platform | versão de política, bundle, CMP/certificação, TCF redigido, `ads.txt`, site approval e emergency stop |

Migrations e restore são sempre executados primeiro em staging. Ações destrutivas ou de produção exigem aprovação explícita.

## 5. Gate operacional

- `live` e `ready` verdes.
- Dashboard RED com dados da release.
- Alertas de burn rate configurados e uma notificação de teste recebida.
- Rollback de código testado.
- Rollback de migrations documentado e testado quando reversível.
- Backup/restore validado.
- `AQUA_RELEASE` corresponde ao deployment observado.

## 6. Aprovação

Architecture, Engineering, Product, Security/Privacy e Operations registam responsável, data e ligação para a evidência. Sem as cinco aprovações, o estado permanece `Review`.

## Resultado

Uma release só está pronta quando todos os gates aplicáveis estão verdes. Catálogo funcional ou liveness verde não substituem readiness.
