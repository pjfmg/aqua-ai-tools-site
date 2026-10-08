# Checklist de Deployment

| Propriedade | Valor |
|---|---|
| Documento | Deployment Checklist |
| Categoria | Release |
| Responsável | AQUA Operations |
| Versão | 1.0.0 |
| Estado | Review |

Procedimento e formato de evidência: [`release-gate.md`](release-gate.md).

## Quality gate

- [ ] `npm ci` executado num ambiente limpo.
- [ ] `npm run check` concluído.
- [ ] Dependency audit sem vulnerabilidades High/Critical não aceites.
- [ ] `npm run catalog:quality:production -- --enforce` concluído e evidência anexada.
- [ ] Revisão de segurança e privacidade concluída.
- [ ] `npm run release:readiness` verde para a release esperada.

## Plataforma

- [ ] Migrations Commerce, API Platform, Data Platform e Observability aplicadas em staging.
- [ ] Importação Airtable executada e reconciliada.
- [ ] RLS e retenção verificadas com utilizador anon/authenticated/service_role.
- [ ] Shopify Storefront/webhooks e Supabase Auth configurados com URLs de produção.
- [ ] Snapshot dos packages/políticas da Trust Platform reconciliado com o AQUA OS.
- [ ] `VITE_CMP_CERTIFIED`, `VITE_TCF_VERSION`, aprovação do site e `ads.txt` sustentados por evidência atual.
- [ ] `__tcfapi` observado em produção com evento `tcloaded` ou `useractioncomplete` e string TCF presente.
- [ ] Pedido real de publicidade confirmado apenas após decisão `request-ad: allow`.
- [ ] Emergency stop testado; `VITE_ADSENSE_TCF_READY` confirmado apenas como interlock.
- [ ] Checklist `docs/google-cmp-production-checklist.md` concluída ou publicidade mantida suspensa.

## Operação

- [ ] Gate server-side executado no runtime Vercel canónico; Cloudflare tratado apenas como canary público enquanto não tiver configuração privada equivalente.
- [ ] `/v1/health/live` e `/v1/health/ready` verdes.
- [ ] Dashboard RED e alertas de burn rate ativos.
- [ ] Rollback testado para código e migrations.
- [ ] Backup/restore validado para dados operacionais.
- [ ] `AQUA_RELEASE` corresponde à versão publicada.

## Aprovação

- [ ] Architecture
- [ ] Engineering
- [ ] Product
- [ ] Security/Privacy
- [ ] Operations

Nenhum item marcado por suposição. Evidência e responsável devem acompanhar a aprovação.

## Evidência local mais recente

Em 2026-10-04, com Node.js 22.17.0, `npm ci`, `npm audit
--audit-level=high` e `npm run check` concluíram com sucesso. A execução incluiu
13 smoke suites, 11 testes Playwright, build Vite e validação dos 30 artefactos
da release candidate. Evidência: [`releases/2026-10-04-local-release-gate.md`](releases/2026-10-04-local-release-gate.md).

## Estado público observado

Em 2026-07-24, liveness estava verde mas readiness devolvia HTTP 503 devido a configuração e Commerce. Evidência: [`releases/2026-07-24-production-readiness.md`](releases/2026-07-24-production-readiness.md). Este estado bloqueia a release.

Na mesma data, a auditoria encontrou lacunas editoriais e operacionais nos 4 344 registos publicados. Evidência e decisão: [`releases/2026-07-24-catalog-quality.md`](releases/2026-07-24-catalog-quality.md).

Em 2026-07-29, HTTPS/headers, `ads.txt` e readiness estavam verdes, mas o bundle
Trust Platform e CMP/TCF não eram observáveis. A publicidade permanece
`default-deny`; a configuração conservadora foi preparada para o próximo
deployment. Evidência:
[`releases/2026-07-29-trust-platform-readiness.md`](releases/2026-07-29-trust-platform-readiness.md).

Em 2026-10-04, liveness e catálogo continuavam acessíveis, mas readiness
devolvia HTTP 503 porque a dependência Commerce estava em `fail`. A auditoria
do catálogo com enforcement encontrou cinco problemas críticos e 13 369
lacunas editoriais. A release pública observada não corresponde à candidate
local. Evidência: [`releases/2026-10-04-local-release-gate.md`](releases/2026-10-04-local-release-gate.md).
