# Preview gates — 2026-10-08

## Âmbito

- Branch: `codex/trust-platform`
- Release observada: `0a04b060cfb299cd89aa885f5efef5b28a9a953a`
- Preview público: `https://codex-trust-platform.aqua-ai-tools.pages.dev`
- Produção não foi alterada.

## Resultado factual

- Liveness: HTTP 200 e identidade da release correta.
- HTTPS/HSTS, CSP, bundle Trust Platform e `ads.txt`: aprovados.
- Cenários browser default-deny: aprovados; zero scripts de publicidade e CMP antes da escolha.
- Aceitar tudo com CMP indisponível: analytics pode iniciar, publicidade permanece negada.
- GPC, DNT, retirada, expiração e mudança de política: aprovados.
- Readiness: HTTP 503 porque o Cloudflare Preview não tem a configuração privada de Data Platform e Commerce.
- Catálogo: indisponível nesse preview pelo mesmo bloqueio de configuração.
- CMP/TCF: não configurada; `__tcfapi` não foi observada e a publicidade permanece suspensa.

## Decisão

O preview é seguro em modo default-deny, mas não está pronto para promoção. A
ativação de publicidade e a publicação de produção continuam bloqueadas até
existirem readiness HTTP 200, CMP certificada publicada e evidência TCF
redigida. Não foram registados valores de configuração, segredos ou strings TCF.

## Evidência

- `2026-10-08-preview-release-readiness.json`
- `2026-10-08-preview-trust-browser.json`
- `2026-10-08-preview-default-deny-canary.json`
