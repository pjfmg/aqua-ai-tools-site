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

## Revalidação local em 2026-10-29

- A primeira execução de `npm run check` ficou bloqueada porque o executável Chromium esperado pela versão instalada do Playwright já não existia na cache local; não foi uma falha funcional da aplicação.
- Depois de instalar apenas o Chromium de teste correspondente, `npm run check` passou integralmente: 15 suites smoke, 11/11 testes Playwright, build Vite com 105 módulos e `release:check` com estado `candidate` e 44 artefactos.
- Não foi necessária qualquer alteração de código para fechar este gate.
- A configuração Shopify continua sem poder avançar porque o Mac permaneceu bloqueado durante a tentativa de retomar o Shopify Admin. Não foram criadas credenciais, scopes, webhooks ou alterações Vercel.

## Execução dos gates em 2026-10-29

- A ligação Shopify voltou a confirmar a loja `AQUA Store`, domínio público
  `www.aqua-store.eu`, plano Basic, moeda USD e país Portugal. Esta leitura não
  criou nem revelou credenciais.
- A tentativa de retomar o Shopify Admin no Safari voltou a ser bloqueada pelo
  ecrã bloqueado do Mac. A criação/instalação da app privada `AQUA OS Commerce`
  e a geração de acesso persistente continuam pendentes de sessão Admin
  autenticada e confirmação no momento da ação.
- O código Commerce continua a exigir `SHOPIFY_STORE_DOMAIN`,
  `SHOPIFY_STOREFRONT_ACCESS_TOKEN` e `SHOPIFY_WEBHOOK_SECRET`, e expõe os três
  destinos previstos: `orders-paid`, `orders-cancelled` e `refunds-create`.
- `release:verify:production` repetiu liveness e catálogo HTTP 200, mas
  readiness HTTP 503: Data Platform `ok` e Commerce `fail`. A release pública
  continua em `f5f94367a3096d775b3117deedd9e6e4dcd99a6b`.
- `pwa:verify:production` repetiu o resultado anterior: os ícones, assinatura
  e manifest coincidem, mas `/sw.js` e `/offline.html` continuam a responder
  `text/html` sem os marcadores da candidate.
- `catalog:quality:production -- --enforce` repetiu 4 344 registos, cinco
  problemas críticos e 13 369 lacunas editoriais; o gate continua vermelho.
- A Web App do iMac continua instalada em `~/Applications/AQUA AI Tools.app`,
  com nome, start URL e ícones do manifest esperados. A toolchain ativa é
  apenas Command Line Tools e não existe Xcode descoberto, pelo que
  `devicectl` não ficou disponível para repetir o inventário iPhone/iPad.

Estado após esta execução: **Review / NO-GO**. O primeiro desbloqueio necessário
continua a ser a sessão Shopify Admin; não houve deployment, alteração de
segredos, criação de webhooks ou promoção de produção.

## Shopify Admin desbloqueado em 2026-10-29

- O Safari abriu uma sessão autenticada em `admin.shopify.com/store/aquaticus`.
  A ligação Shopify confirmou novamente a loja `AQUA Store`. O bloqueio de
  acesso ao Admin registado acima deixou de se aplicar.
- No Dev Dashboard aberto a partir desta loja, a lista de apps mostrou apenas
  duas entradas `AQUA HMP Studio`; não apareceu `AQUA OS Commerce`. A lista de
  aplicações personalizadas legadas também não mostrou essa app. A página
  `Lojas` desse Dashboard indicou que ainda não havia lojas no portefólio;
  isto não prova ausência de lojas de teste noutras organizações.
- A lista de canais de vendas instalados da `AQUA Store` não incluiu
  `Headless`. O formulário atual de criação de app no Dev Dashboard foi apenas
  inspecionado, sem submissão.
- Segundo a [documentação Shopify de criação de apps](https://shopify.dev/docs/apps/build/dev-dashboard/create-apps-using-dev-dashboard),
  apps novas exigem versão, instalação e aprovação dos âmbitos. Para o
  Storefront API, o [canal Headless](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api)
  fornece tokens públicos ou privados; o Commerce atual usa o cabeçalho de
  token público `X-Shopify-Storefront-Access-Token`. Os tópicos
  `orders/paid`, `orders/cancelled` e `refunds/create` exigem pelo menos
  `read_orders` segundo a [referência dos webhooks](https://shopify.dev/docs/api/admin-graphql/latest/enums/WebhookSubscriptionTopic).
- Antes de instalar uma app com `read_orders` ou associar webhooks, confirmar
  uma loja de teste isolada e o destino staging atualizado. Usar a loja real
  para subscrições dirigidas a staging entregaria eventos reais de encomendas
  nesse ambiente. A criação/instalação da app e do canal Headless requerem
  autorização específica no momento da ação.
- O botão `Criar loja` do Dev Dashboard abriu um formulário identificado como
  `Create a dev store`, com plano `Basic` disponível e opção de gerar dados de
  teste com gateway fictício. A [documentação de dev stores](https://shopify.dev/docs/apps/build/stores/development-stores)
  confirma que não processam transações reais. O formulário ficou por
  submeter; a proposta para staging é `AQUA OS Commerce Staging`, plano
  `Basic`, com dados de teste, sujeito a aprovação específica antes da criação.

Nenhuma app, canal, token, âmbito, webhook ou variável Vercel foi criado ou
alterado nesta verificação. O estado de release permanece **Review / NO-GO**.

## Loja Shopify de desenvolvimento criada em 2026-10-29

- Após aprovação específica do utilizador, foi criada `AQUA OS Commerce
  Staging` na organização `AQUA Store`, com plano de teste `Basic`, a opção
  `Generate test data for store` ativada e nenhuma feature preview ativada.
- O Admin abriu em `admin.shopify.com/store/aqua-os-commerce-staging`. A página
  Geral identificou-a como `Loja em desenvolvimento`; a página Plano mostrou
  `Basic`; Domínios mostrou `aqua-os-commerce-staging.myshopify.com` como
  domínio principal ligado. Produtos mostrou 17 itens fictícios na primeira
  página, incluindo snowboards de exemplo. Em Pagamentos, o `Gateway de
  pagamento de teste` apresentou estado `Ativo`; isto não prova ainda o
  ciclo checkout/webhook do Commerce.
- Esta loja é isolada da `aquaticus.myshopify.com`. Nenhuma app Commerce,
  canal Headless, token, webhook, variável Vercel ou migration foi criada ou
  alterada. A próxima integração deve apontar primeiro para esta loja e para
  um serviço Commerce staging atualizado; os acessos à loja real continuam
  pendentes de decisão própria.

Estado: **staging Shopify isolado disponível; release continua Review / NO-GO**.

## Pré-verificação Commerce em 2026-10-29

- O checkout `AQUA OS Console Readiness` está na revisão `dab9662`. Em
  `Services/Commerce`, a única diferença face a `origin/main` são duas entradas
  de exemplo (`AQUA_SALES_URL` e `AQUA_SALES_COMMERCE_KEY`); não há alterações
  de trabalho nesse serviço. Uma cópia temporária dos ficheiros versionados de
  `HEAD` compilou com Node.js 24 e passou os 29 testes Commerce. As alterações
  preexistentes noutros módulos do Console ficaram intactas.
- O projeto local `Services/Commerce/.vercel/project.json` identifica
  `aqua-os-commerce-staging`; a resposta pública atual de
  `/v1/health/ready` continua HTTP 200 com `contracts: {v1: false, v2: true}`.
  É uma versão anterior: o código candidato anuncia `contracts.shopify` e
  exige catálogo, chaves de produto, domínio, token Storefront e segredo de
  webhook para readiness HTTP 200.
- A auditoria local de migrations encontrou 82 ficheiros de serviço e 59 no
  agregado. Para Commerce, `001_aqua_subscriptions.sql`,
  `002_portfolio_commerce.sql` e `005_store_pilot_correlation.sql` não tiveram
  correspondência exata normalizada no agregado. Isto exige reconciliação com
  o ledger e o schema do destino; a auditoria assinala ambos, bem como
  backup/restore, como `UNKNOWN` e decide `NO_APPLY`.
- Os relatórios anteriores do Console registam que previews Commerce e Data
  Platform partilharam referências Supabase de produção. Essa observação
  histórica não prova a configuração atual do projeto staging. A inspeção do
  Dashboard ficou indisponível porque o Mac estava bloqueado; a sessão CLI
  local também não forneceu autenticação verificável. Antes de qualquer
  migration ou teste que escreva dados, confirmar a referência Supabase
  efetiva, o isolamento de produção, o ledger, o backup e um restauro de prova.
- O `Services/Commerce/README.md` descrevia checkout Stripe e apenas as
  migrations 001–002, enquanto o código atual exige Shopify e tem migrations
  001–008. O README foi atualizado no commit local `370603d` para Shopify e
  para a reconciliação da cadeia 001–008; ainda não é prova de deployment.

Nenhuma migration, configuração Vercel, credencial Shopify ou deployment foi
alterado nesta pré-verificação. **Commerce staging ainda não está validado para
o contrato Shopify; o estado de release permanece Review / NO-GO**.

## Consulta Vercel e cadeia SQL em 2026-10-29

- A sessão CLI Vercel existente confirmou acesso em leitura aos projetos
  `aqua-os-commerce-staging` e `aqua-os-commerce`. No ambiente Production do
  projeto staging há 12 nomes de variáveis; no projeto de produção, 10. Em
  ambos faltam `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_ACCESS_TOKEN` e
  `SHOPIFY_WEBHOOK_SECRET`. Nenhuma variável foi alterada.
- `SUPABASE_URL` está marcada como Secret nos dois projetos. O comando de
  exportação devolveu apenas o marcador `[SENSITIVE]`, pelo que **não foi
  possível comparar as referências Supabase** nem confirmar que staging está
  isolado. Os ficheiros temporários da tentativa foram apagados. O valor de
  `AQUA_RELEASE` também não ficou verificável por esta via.
- O agregado `Supabase/migrations/` contém as alterações Shopify posteriores,
  mas não contém a criação das tabelas base `aqua_commerce_orders` e
  `aqua_subscriptions`. A migration Shopify agregada usa
  `aqua_commerce_orders`; portanto, uma base vazia exige a reconciliação das
  migrations Commerce 001–002 antes dessa etapa. A migration Commerce 005
  também não tem correspondência integral no agregado; a tabela
  `aqua_application_usage_events` não aparece nesse conjunto. Isto é uma
  análise do código, não uma afirmação sobre o schema remoto.

Próximo gate: obter por via administrativa a referência Supabase efetiva do
runtime staging e o ledger/schema do destino, sem expor chaves; demonstrar
isolamento, backup, restauro e ordem SQL antes de aplicar migrations. **NO_APPLY
e Review / NO-GO mantidos**.

## Smoke SQL descartável em 2026-10-29

- O Mac continuou bloqueado, pelo que a referência Supabase efetiva de
  Commerce staging não pôde ser confirmada no painel.
- Uma instância PostgreSQL 17 local e descartável recebeu um stub mínimo de
  `auth.users` sem utilizadores, a migration IdentityAccess 001, as migrations
  Commerce 001–002 e depois a migration Shopify agregada
  `20260821100023_phase2_shopify_primary_checkout.sql`. Todas executaram sem
  erro. A consulta de metadados confirmou `aqua_commerce_orders`,
  `aqua_subscriptions`, `aqua_commerce_webhook_events`, as colunas
  `checkout_provider`/`shopify_order_id` e a chave primária de webhooks por
  `(provider, provider_event_id)`.
- O teste confirma apenas esta ordem mínima num schema vazio simulado.
  Migrations Commerce 004–008, dependências CRM/Finance, ledger remoto,
  backup/restauro e isolamento staging continuam sem validação. A instância
  local foi encerrada e apagada; nenhuma base remota foi alterada.

Estado: **bootstrap mínimo local PASS; aplicação remota NO_APPLY; release
Review / NO-GO**.

## Supabase staging: preflight remoto de leitura em 2026-10-30

- A conta Supabase acessível confirmou `afgdmshizxlvswvojthf` (staging
  histórico do Console) e `rjtzmdxdrfumcifztyvr` (produção histórica), ambos
  `ACTIVE_HEALTHY`. Isto confirma dois projetos distintos na conta, **não**
  qual deles está configurado em `aqua-os-commerce-staging` na Vercel: o valor
  de `SUPABASE_URL` nesse runtime permanece oculto como Secret.
- O ledger do projeto staging contém 73 versões remotas. O agregado local
  `Supabase/migrations/` contém 59 versões: `202610080001` existe só no
  agregado local e 15 versões existem só no ledger remoto (`20260823193000`,
  `202608280001`, `20260828100000`, `20260828110000`, `20260828120000`,
  `20260828131000`, `20260828132000`, `20260828133000`, `20260828140000`,
  `202610030001`–`202610030004`, `202610180001` e `202610190001`). A
  proveniência dessas versões tem de ser reconciliada antes de nova aplicação.
- A inspeção remota de metadados confirmou a presença das tabelas
  `aqua_identities`, `aqua_organizations`, `aqua_subscriptions`,
  `aqua_commerce_orders`, `aqua_commerce_webhook_events`,
  `aqua_application_usage_events`, `aqua_commerce_payments`,
  `crm_opportunities` e `finance_transactions`. A geração de tipos confirmou
  `checkout_provider`, `shopify_order_id`, `provider_checkout_id` e
  `provider_order_id` em orders; `provider` e `provider_event_id` no inbox;
  `application_registry_id` e `source_entity_id` em usage events. Isto não
  verifica constraints, triggers, dados nem a proveniência das migrations.
- A listagem de backups mostra oito backups, sendo o mais recente físico e
  `COMPLETED` em `2026-10-30T01:06:30.840Z`; WAL-G está ativo e PITR está
  desativado. Não houve restauro de prova. Nenhuma migration ou dado de negócio
  foi alterado nesta consulta.

Estado: **schema base staging observado e backup disponível; ligação Vercel,
restauro e reconciliação do ledger pendentes; NO_APPLY / Review / NO-GO**.

### Proveniência local de parte do ledger

O histórico Git do Console contém seis ficheiros agregados de `20260828`
cujo conteúdo é exatamente igual às migrations de serviço atuais: registry
v2 (`PortfolioPlatform/008`), operational state (`PortfolioPlatform/009`),
official health monitor (`Observability/005`), registry entity metrics
(`PortfolioPlatform/010`), auditable portfolio valuation
(`PortfolioPlatform/011`) e store pilot correlation (`Commerce/005`). O
ficheiro histórico `20260828133000_store_pilot_correlation.sql` coincide por
SHA-256 com `Services/Commerce/migrations/005_store_pilot_correlation.sql` e
a sua versão aparece no ledger remoto. A versão no ledger, por si só, não
prova o hash do SQL executado; faltam ainda as outras proveniências e a
verificação da configuração Vercel.

Uma procura adicional encontrou `20260823193000_product_cost_control.sql` e
as sete migrations `20260828` nas pastas `Web`, `iOS` e `macOS` de outro
checkout AQUA OS; as três cópias de cada versão são idênticas. Essas pastas
estão **não versionadas** nesse checkout e, por isso, não bastam como fonte
canónica. O histórico Git do Console contém também
`20260828140000_application_audits.sql`, mas não há migration de serviço
atual com conteúdo exatamente igual. As versões `202610030001`–`004`,
`202610180001` e `202610190001` ainda não foram localizadas nas migrations
dos checkouts Tech inspecionados. Nenhum desses achados autoriza aplicar SQL
remoto sem reconciliar fonte, ledger e schema.

## Proteção de destino Commerce em 2026-10-30

- O Commerce passou a exigir `AQUA_EXPECTED_SUPABASE_PROJECT_REF` em
  deployments. Se estiver ausente ou não coincidir com o host de
  `SUPABASE_URL`, as rotas além de liveness devolvem 503 antes de qualquer
  acesso à base. O código, teste e runbook ficaram no commit local `02cdaa2`;
  `npm test` passou 31/31, incluindo um pedido de staging com referências
  sintéticas diferentes e zero pedidos de rede.
- No projeto Vercel `aqua-os-commerce-staging`, ambiente Production desse
  projeto, foi adicionada como Config a referência esperada
  `afgdmshizxlvswvojthf`. A CLI confirmou a adição e a listagem confirmou o
  nome; não foi feito deployment. `SUPABASE_URL` e as chaves existentes não
  foram alteradas. O projeto `aqua-os-commerce` de produção não foi alterado.
- Uma tentativa de confirmar o valor por exportação de variáveis foi recusada
  pela revisão automática porque esse comando exportaria também credenciais
  Secret. Não se contornou a recusa e não se descarregaram segredos. Assim, a
  listagem confirma a presença da nova variável, mas não é leitura
  independente do seu valor nem prova da referência efetiva de
  `SUPABASE_URL`.

Estado: **proteção local PASS e variável esperada preparada em staging;
associação efetiva da base, restauro e deployment pendentes; Review / NO-GO**.

## Proveniência adicional do ledger staging em 2026-10-30

- Foram localizados os seis ficheiros `202610030001`–`004`, `202610180001`
  e `202610190001` em `AQUA Raffles/supabase/migrations/` no checkout
  Documents. Os SHA-256 locais, pela mesma ordem, são
  `409719d389f19710a8d4c3539193946f70997affb6c39e5f3c153033a0423b11`,
  `d53d6ac9bceedddd6b54d9c61a3895c3250c212c7961243cea877ad20cd11215`,
  `6bfdaf52cda0bb6e55839fcde2481d6803f92bd35c10cb2d5395ebe800d6188e`,
  `74aea641fc56ce7c0139717606542d48d16a951c48d542e4f6301d6d72b346f0`,
  `21d693f8b67bb3891cfce5d39ce0724f5b20dc3b1364d476a669327531815201`
  e `8f5654ddda6412235ee664f9eb1317d4c6090f1f5eb9dfcac738bec1039ffd74`.
- A versão `202608280001` existe em três produtos diferentes: Raffles
  (`raffles_campaign_governance.sql`), World (`world_foundations.sql`) e
  Experiences (`rent_hold_hardening.sql`). A geração de tipos do projeto
  staging para `public,raffles` encontrou `campaign_governance_records`,
  `campaign_governance_documents` e `campaign_governance_revisions`, que a
  migration Raffles define. Não encontrou `world_zones`, `hotspots`,
  `land_parcels`, `development_slots` nem `rent_reservations`, os objetos
  indicativos das outras duas fontes. Isto favorece a atribuição da versão
  remota a Raffles, mas não prova qual SQL exato foi executado. O SHA-256 da
  cópia Raffles é
  `8ca31153ef735f28747d2de57da7e0e598c21f675d77948381a493cb2ef2`.
- Assim, há agora uma fonte local candidata para cada uma das 15 versões que
  existem apenas no ledger remoto relativamente ao agregado do Console:
  oito cópias já localizadas em AQUA OS, seis migrations Raffles de outubro
  e a migration Raffles de agosto inferida pelo esquema. A listagem simples
  do ledger devolve apenas números de versão. A reconciliação do SQL
  efetivamente aplicado continuava **pendente** nesta etapa.

Nenhum SQL remoto foi aplicado. A referência Supabase efetiva da Vercel
staging, o restauro de prova e o deployment Commerce continuam pendentes;
**NO_APPLY / Review / NO-GO**.

## Leitura dos ficheiros do histórico remoto em 2026-10-30

- `supabase migration fetch --project-ref afgdmshizxlvswvojthf` recuperou 73
  nomes de ficheiros numa pasta temporária protegida, apagada após a
  comparação. Os nomes das 15 versões ausentes do agregado do Console
  coincidem com as fontes locais candidatas. Em particular,
  `202608280001` é `raffles_campaign_governance`, e as seis versões de outubro
  têm os nomes correspondentes de AQUA Raffles. A colisão de número com World
  e Experiences fica resolvida **quanto ao nome registado**.
- Para `20260823193000` e as sete versões `20260828` seguintes, o SQL
  recuperado tem o mesmo conteúdo das cópias em `AQUA OS/Web/Supabase/migrations/`
  quando se ignoram apenas quebras de linha adicionais nas cópias locais.
  Uma dessas oito (`20260828131000`) coincide também byte a byte. Esta
  comparação verifica o texto guardado no histórico para essas oito versões;
  não substitui uma inspeção do esquema resultante nem um restauro.
- Para `202608280001` e as seis versões de outubro, cada ficheiro recuperado
  contém apenas `;` e uma quebra de linha. O histórico confirma os nomes,
  mas **não disponibiliza o SQL** dessas sete migrations para comparação com
  as fontes Raffles. Não se deve interpretar o placeholder como uma migration
  vazia: o esquema staging mostra objetos Raffles. Continua por comprovar a
  equivalência exata do SQL executado nessas sete versões.

Resultado: **oito textos históricos reconciliados, sete nomes confirmados com
SQL não recuperável**. A identidade efetiva de `SUPABASE_URL` na Vercel
staging, o restauro de prova e o deployment Commerce permanecem pendentes;
nenhum SQL ou dado remoto foi alterado. **NO_APPLY / Review / NO-GO**.

### Comparação das 58 versões comuns ao agregado

O mesmo `migration fetch` permitiu comparar as 58 versões presentes tanto no
histórico staging como em `AQUA OS Console Readiness/Supabase/migrations/`:
18 ficheiros são idênticos byte a byte, 39 diferem apenas em quebras de linha
e um tem uma alteração deliberada de função. Nesta última versão,
`20260813040000_verify_funding_platform.sql`, o histórico remoto contém o
SQL de verificação Funding (7 143 bytes); o agregado atual contém um marcador
que encaminha esse teste para
`Services/FundingPlatform/tests/verify_funding_platform.sql`. O texto remoto
e esse ficheiro de teste são iguais após remover apenas quebras de linha.
Não se deve voltar a executar o teste como migration: ele exige um
administrador de organização existente, como explica o marcador local.

Assim, as 66 versões do histórico com SQL recuperável têm uma fonte local
correspondente, incluindo o teste Funding arquivado. As sete versões Raffles
com placeholders continuam sem comparação de SQL. Isto é reconciliação do
histórico, **não** prova de restauro, de equivalência integral do esquema ou
de identidade da base usada pelo runtime Vercel. **NO_APPLY** mantido.

## Âmbito Raffles e prova de restauro existente em 2026-10-30

- A geração de tipos **atual** do esquema `raffles` no projeto staging
  `afgdmshizxlvswvojthf` encontrou as dez tabelas `raffles` criadas pelas
  sete fontes locais cujo histórico remoto só conserva `;` e quebra de
  linha. Isto confirma presença de objetos, não equivalência de funções,
  policies, triggers ou do SQL que os criou.
- O dossier AQUA Raffles contém um recibo de 2026-10-23 para esse mesmo
  projeto: backup concluído, restauro verificado num PostgreSQL 17 local
  isolado, 25 tabelas sem linhas, 64 funções/ACLs correspondentes, sete
  verificadores SQL e 13 cenários de capacidade aprovados. O âmbito do
  backup foi `raffles`, o ledger de migrations e funções públicas Raffles.
  Evidência em `docs/operations/evidence/STAGING_CAPACITY_BACKUP_2026-10-23.json`,
  `STAGING_CAPACITY_RESTORE_2026-10-23.json` e
  `STAGING_CAPACITY_PROMOTION_2026-10-23.json` no checkout AQUA Raffles.
  Auth/Identity real, cron e o domínio Commerce não fizeram parte dessa
  cópia; portanto, **não é um restauro integral atual de Commerce**.
- Uma tentativa de dump somente do esquema `raffles` pela CLI Supabase
  falhou porque Docker não está disponível. O `pg_dump` direto pela ligação
  PostgreSQL local confirmou a referência staging na configuração, mas
  recusou a ligação por falta de palavra-passe nesta sessão. Nenhum segredo
  foi fornecido, extraído ou gravado; não houve dump nem escrita remota.

Estado: proveniência de nomes e presença das dez tabelas Raffles **PASS**;
SQL exato das sete versões e restauro Commerce atual **pendentes**. A
confirmação das três variáveis Supabase da Vercel staging continua a ser o
primeiro bloqueio operacional. **NO_APPLY / Review / NO-GO**.

### Funções declaradas nas sete fontes Raffles

Uma comparação somente de leitura entre as sete fontes locais e os tipos
gerados **agora** de `public,raffles` no staging encontrou 30 nomes distintos
de funções declaradas. Vinte e seis aparecem nos tipos remotos. Os quatro
nomes que não aparecem (`protect_closed_eligibility`,
`protect_confirmed_draw_regulatory_evidence`,
`protect_started_campaign_capacity` e
`reject_regulatory_evidence_mutation`) são funções `returns trigger` nas
fontes SQL; a geração de tipos não comprova a presença ou ausência dessas
funções internas. As 26 correspondências verificam nomes expostos, não
assinaturas completas, corpos, grants, policies ou triggers atuais.

As dez tabelas e as 26 funções visíveis reforçam a correspondência de
esquema com as fontes Raffles, mas não reconstituem o SQL que falta no
histórico. **NO_APPLY** mantém-se até confirmar o destino Vercel e o plano
de backup/restauro Commerce.
