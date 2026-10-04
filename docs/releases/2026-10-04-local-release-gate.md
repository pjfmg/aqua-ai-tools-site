# AQUA AI Tools — Gate local e estado público de 2026-10-04

## Âmbito

Validação da candidate local em `codex/trust-platform` e leitura não mutável do
deployment público. Esta evidência não representa aprovação organizacional nem
autoriza promoção para produção.

## Gate local

- Runtime: Node.js 22.17.0 e npm 10.9.2.
- `npm ci`: concluído, 81 packages auditados.
- `npm audit --audit-level=high`: zero vulnerabilidades.
- `npm run check`: concluído.
- Smoke: todas as 13 suites passaram.
- Playwright: 11 de 11 testes passaram em Chromium.
- Build: 103 módulos transformados.
- Release check: estado `candidate`, 30 artefactos validados.

Uma tentativa anterior com Node.js 26.4.0, fora do intervalo suportado pelo
projeto, terminou por timeout num teste de eventos de auditoria. O teste passou
isoladamente e voltou a passar na suite completa sob Node.js 22. Não foi
necessária uma alteração ao contrato de privacidade.

## Estado público observado

- Release observada: `6869b2aa85012a4e62903efd2228bc21fe647c8f`.
- Liveness: HTTP 200.
- Readiness: HTTP 503; configuração e Data Platform `ok`, Commerce `fail`.
- Catálogo: HTTP 200.
- Auditoria com enforcement: `ready=false`, 4 344 registos, 5 problemas
  críticos e 13 369 lacunas editoriais.
- Trust readiness: não repetido sem nova evidência de browser CMP/TCF; o gate
  exige `--browser-evidence` e não aceita inferência a partir de configuração.

## Decisão

Gate local verde. Promoção para produção permanece bloqueada por Commerce,
qualidade do catálogo, evidência Trust atual, controlos operacionais e
aprovações formais.
