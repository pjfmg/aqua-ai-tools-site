# Checklist de Deployment

| Propriedade | Valor |
|---|---|
| Documento | Deployment Checklist |
| Categoria | Release |
| Responsável | AQUA Operations |
| Versão | 1.0.0 |
| Estado | Review |

## Quality gate

- [ ] `npm ci` executado num ambiente limpo.
- [ ] `npm run check` concluído.
- [ ] Dependency audit sem vulnerabilidades High/Critical não aceites.
- [ ] Revisão de segurança e privacidade concluída.

## Plataforma

- [ ] Migrations Commerce, API Platform, Data Platform e Observability aplicadas em staging.
- [ ] Importação Airtable executada e reconciliada.
- [ ] RLS e retenção verificadas com utilizador anon/authenticated/service_role.
- [ ] Stripe webhook e Supabase Auth configurados com URLs de produção.
- [ ] Checklist `docs/google-cmp-production-checklist.md` concluída ou publicidade mantida suspensa.

## Operação

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
