# AQUA AI Tools — progresso da candidate PWA em 2026-10-26

## Âmbito

Candidate local na branch `codex/trust-platform`, baseada no commit
`f5f94367a3096d775b3117deedd9e6e4dcd99a6b`. As verificações públicas
foram apenas de leitura. Nenhum deployment, migração, credencial ou configuração
de produção foi alterado nesta validação.

## Gate local

- Node.js 24.19.0, dentro do intervalo suportado pelo projeto.
- `npm ci`: 77 packages instalados a partir do lockfile.
- Vite atualizado no lockfile de 6.4.3 para 6.4.5 após uma auditoria ter
  identificado uma vulnerabilidade High; `npm audit --audit-level=high`
  terminou com zero vulnerabilidades.
- `npm run check`: 15 suites smoke, 11 testes Playwright, build Vite
  (105 módulos) e `release:check` passaram.
- Verificação PWA contra o build local: sete recursos esperados presentes e
  válidos. No Chromium, o service worker controlou a página e uma navegação
  sem rede abriu `Sem ligação | AQUA AI Tools`.
- Capturas desktop e mobile do build local foram inspecionadas. O proxy de API
  local não estava ativo; por isso, o catálogo apareceu indisponível nessa
  sessão visual. Isto não valida nem invalida o catálogo público.
- `release:config` na shell local assinalou as variáveis server-side ausentes;
  não é uma verificação das variáveis configuradas no host de produção.

## Estado público observado

- Release anunciada: `f5f94367a3096d775b3117deedd9e6e4dcd99a6b`.
- `release:verify:production`: liveness HTTP 200 e catálogo HTTP 200;
  readiness HTTP 503, com Commerce em `fail`. A Data Platform respondeu `ok`,
  mas excedeu o SLO de latência nesta amostra.
- `pwa:verify:production`: ícones, assinatura e manifest passaram. `/sw.js`
  respondeu HTTP 200 com `Content-Type: text/html` e sem o código esperado;
  `/offline.html` também respondeu HTTP 200 sem a assinatura esperada. O 200
  é compatível com a regra de fallback SPA, não com a presença dos ficheiros
  PWA da candidate.
- `catalog:quality:production -- --enforce`: `ready=false` para 4 344
  registos publicados, cinco problemas críticos e 13 369 lacunas editoriais.
  Falta descrição PT e preço em todos os 4 344 registos; o estado operacional
  também permanece desconhecido em todos eles.
- A ligação Shopify confirmou a AQUA Store, mas não forneceu prova de uma
  sessão Admin apta a criar as credenciais e registar os webhooks exigidos
  pelo Commerce.

## Diagnóstico adicional em 2026-10-26

- A listagem de nomes das variáveis Vercel confirmou que os projetos
  `aqua-os-commerce` e `aqua-os-commerce-staging` não têm
  `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_ACCESS_TOKEN` nem
  `SHOPIFY_WEBHOOK_SECRET` nos respetivos ambientes Production. Nenhum valor
  secreto foi lido ou copiado.
- O endpoint de readiness do Commerce staging respondeu HTTP 200, mas anunciou
  contratos `v1`/`v2`, enquanto o código atual exige o contrato Shopify. Esse
  200 corresponde a uma versão anterior e não valida a integração atual.
- A auditoria pública foi guardada em
  [2026-10-26-catalog-quality.json](2026-10-26-catalog-quality.json). As
  propostas por registo e a divergência Airtable → Data Platform estão em
  [2026-10-26-catalog-critical-remediation.md](2026-10-26-catalog-critical-remediation.md).
- Quatro registos de websites repetidos já estão despublicados no Airtable,
  mas permanecem publicados no catálogo público. O importador atual não
  oferece um modo pontual seguro para reconciliar esses estados; falta um
  destino Data Platform staging verificado.

## Seguimento local e público em 2026-10-26

- Com Node.js 24.20.0, as 15 suites smoke, o build de 105 módulos,
  `release:check` e `audit:security` passaram. O teste E2E de expiração de
  consentimento passou isoladamente após usar o relógio controlado do
  Playwright; a janela anterior de quatro segundos expirava antes de o browser
  carregar em execuções lentas.
- O E2E agregado **não está verde nesta execução**. A primeira tentativa teve
  10/11 testes aprovados; as seguintes sofreram timeouts intermitentes em
  operações básicas do browser, incluindo `page.evaluate`, `locator.count` e
  `page.goto`. Os traces ficaram em `test-results/`; `npm run check` não foi
  concluído com sucesso após a alteração do teste.
- A verificação pública voltou a confirmar release `f5f94367a3096d775b3117deedd9e6e4dcd99a6b`,
  liveness e catálogo HTTP 200, readiness HTTP 503 (`commerce: fail`), e
  `/sw.js` e `/offline.html` a responderem HTML em vez dos recursos PWA.
- A auditoria pública repetiu 4 344 publicados, cinco problemas críticos e
  13 369 lacunas editoriais. Commerce staging continua a anunciar `v1`/`v2`
  antigo; Commerce produção devolve 503. As variáveis Shopify requeridas
  continuam ausentes nos dois projetos Vercel verificados.
- Os testes locais do Commerce passaram (29/29). Uma reconciliação de
  despublicação limitada ao campo `status` foi adicionada à Data Platform no
  commit local `9ed46b7` e passou 12/12 testes. A listagem de projetos Vercel
  não mostrou um projeto Data Platform staging; nenhum comando de
  reconciliação foi executado contra uma base remota.

## Próximos gates

1. Configurar e validar Shopify/Commerce em staging e obter readiness HTTP 200
   no host canónico antes de considerar a promoção da candidate.
2. Reconciliar em staging os quatro estados de publicação divergentes, decidir
   o URL inválido na origem, fechar a revisão editorial e repetir a auditoria
   com `--enforce`.
3. Validar preview, dispositivos, Trust/CMP (ou manter publicidade suspensa),
   alertas, backup/restore, rollback e aprovações de release.
4. Depois de uma publicação aprovada, repetir os gates de readiness e PWA
   contra a release e o commit exatos.

Estado: **Review / NO-GO para nova publicação de produção**.
