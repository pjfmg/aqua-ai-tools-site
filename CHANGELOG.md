# Changelog

Todas as alterações relevantes deste produto são registadas neste documento. O formato segue Keep a Changelog e o versionamento segue SemVer.

## [Unreleased]

### Added

- Supabase Auth e identidade derivada de tokens assinados.
- Fachadas para AQUA OS Commerce e Data Platform.
- API pública `/v1` com envelopes, trace IDs, rate limiting e auditoria.
- Consentimento de analytics, Global Privacy Control e cabeçalhos de segurança.
- Liveness, readiness, métricas RED, circuit breaker, SLOs e runbook.
- Quality gate, CI e documentação de governação/release.

### Changed

- O catálogo deixou de usar Airtable como persistência runtime.
- Billing, dados, trust e observabilidade passaram a capacidades governadas pelo AQUA OS.
- Toolchain atualizado para Vite 6.4.3 e React Router 6.30.4 após dependency audit.

### Security

- Portal de billing e publicidade permanecem suspensos até cumprirem os respetivos controlos externos.
- Tokens, emails e bodies foram excluídos da telemetria operacional.
- Dependências auditadas sem vulnerabilidades conhecidas no momento da revisão.

## [0.1.0] - 2026-07-18

### Added

- Baseline do AQUA AI Tools Site submetida à revisão AQUA Foundation.

[Unreleased]: ./docs/releases/0.1.0-review.md
