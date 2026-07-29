# AQUA OS Trust Platform snapshot

Este diretório contém o snapshot versionado usado pelo AQUA AI Tools enquanto
os packages da Trust Platform ainda não são publicados num registry.

Fontes canónicas:

- `AQUA OS/Packages/ConsentPolicy`
- `AQUA OS/Packages/AdvertisingAuthorization`
- `AQUA OS/Packages/TrustDecisionAudit`
- `AQUA OS/Services/TrustPlatform/*.json`

O produto importa os packages através de dependências `file:`. Alterações ao
snapshot exigem executar os validadores e testes canónicos no AQUA OS, copiar os
artefactos sem alterações e voltar a executar `npm run check` neste produto.

`trust-platform/package-release.json` define as versões e compatibilidade. Com
estado `prepared`, o smoke test exige dependências `file:` coerentes. Depois de
uma publicação aprovada e do estado `published`, exige versões registry exatas e
rejeita `^`, `~` ou tags mutáveis.
