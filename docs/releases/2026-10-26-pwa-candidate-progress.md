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

## Próximos gates

1. Configurar e validar Shopify/Commerce em staging e obter readiness HTTP 200
   no host canónico antes de considerar a promoção da candidate.
2. Corrigir os dados críticos do catálogo na Data Platform e repetir a
   auditoria com `--enforce`.
3. Validar preview, dispositivos, Trust/CMP (ou manter publicidade suspensa),
   alertas, backup/restore, rollback e aprovações de release.
4. Depois de uma publicação aprovada, repetir os gates de readiness e PWA
   contra a release e o commit exatos.

Estado: **Review / NO-GO para nova publicação de produção**.
