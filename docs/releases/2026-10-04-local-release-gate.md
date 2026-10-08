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

Uma tentativa com Node.js 26.4.0, fora do intervalo suportado pelo projeto,
terminou por timeout num teste de eventos de auditoria. Repetições posteriores
sob carga elevada do host também excederam o timeout durante a criação da página
ou navegação, sem falha nas asserções do contrato. A navegação passou a esperar
`domcontentloaded` e o orçamento da infraestrutura E2E foi aumentado para 60
segundos. Não foi alterado o contrato de privacidade.

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

## Preview da candidate

O primeiro preview Vercel do commit `9641540a6688022856f1950a71ebe3c697ded1e7`
foi publicado com HTTP 200, mas anunciou a release histórica `0934f91` porque
uma variável `AQUA_RELEASE` antiga tinha precedência sobre o SHA fornecido pelo
host. O gate rejeitou corretamente o preview. Foi preparada uma correção para
privilegiar `VERCEL_GIT_COMMIT_SHA` e `CF_PAGES_COMMIT_SHA`; a validação deve ser
repetida no preview seguinte.

O preview seguinte anunciou corretamente o commit
`e1042bb6537451110742a1568dacf7d0372434f4`. Liveness e catálogo passaram;
readiness continuou em HTTP 503 por Commerce. A recolha browser redigida provou
zero scripts de publicidade e analytics antes da escolha, mas não observou
`__tcfapi`, CMP carregada ou prova TCF. Evidência:
[`2026-10-04-preview-trust-browser-evidence.json`](2026-10-04-preview-trust-browser-evidence.json)
e [`2026-10-04-preview-trust-readiness.json`](2026-10-04-preview-trust-readiness.json).

Capturas completas em Chromium confirmaram renderização desktop e mobile sem
quebras estruturais aparentes. A abertura do preview no `iPhone 17 de Paulo`
foi tentada, mas o SpringBoard recusou o lançamento do Safari porque o aparelho
estava bloqueado. Isto não constitui prova de renderização no dispositivo.
