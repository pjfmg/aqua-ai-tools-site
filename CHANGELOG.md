# Changelog

Todas as alterações relevantes deste produto são registadas neste documento. O formato segue Keep a Changelog e o versionamento segue SemVer.

## [Unreleased]

### Added

- Gate automático de readiness para deployments, com evidência JSON redigida.
- Validação de configuração de produção sem exposição de valores ou segredos.
- Auditoria paginada da qualidade do catálogo, com evidência JSON e modo de enforcement.
- Supabase Auth e identidade derivada de tokens assinados.
- Fachadas para AQUA OS Commerce e Data Platform.
- API pública `/v1` com envelopes, trace IDs, rate limiting e auditoria.
- Consentimento de analytics, Global Privacy Control e cabeçalhos de segurança.
- Liveness, readiness, métricas RED, circuit breaker, SLOs e runbook.
- Quality gate, CI e documentação de governação/release.

### Changed

- O catálogo deixou de usar Airtable como persistência runtime.
- Billing, dados, trust e observabilidade passaram a capacidades governadas pelo AQUA OS.
- Toolchain atualizado para Vite 6.4.3 e React Router 7.18.1 após dependency audit.
- Descrições editoriais ausentes deixaram de ser substituídas por texto genérico; taxonomia bilingue e deduplicação por website foram reforçadas.
- A página Pro passou a comunicar shortlist, memória de pesquisa e avaliação pessoal como um fluxo, separando a subscrição dos serviços Creator e Business.
- “Surpreende-me” passou a ocultar códigos internos, oferecer retry e alternativas, e evitar repetições imediatas.
- A homepage mobile passou a usar destaques horizontais e categorias compactas, reduzindo substancialmente a altura da primeira experiência.
- A navegação global passou a separar destinos principais de áreas secundárias através de um disclosure acessível em desktop.
- A publicação passou a ter metadados por rota, canonical/hreflang, sitemap, robots e evidência editorial datada na homepage.
- O diretório passou a oferecer páginas bilingues próprias por ferramenta, links de detalhe estáveis, categorias pré-filtradas e alternativas por correspondência taxonómica.
- Publicidade AdSense ativada após confirmação da CMP Google certificada e publicada para `aqua-aitools.com`.
- Domínio raiz corrigido para o alojamento atual, com certificado válido e `ads.txt` acessível ao AdSense.

### Security

- O portal de billing permanece suspenso até cumprir os respetivos controlos externos.
- A publicidade respeita consentimento, Global Privacy Control e um interruptor explícito de suspensão.
- Tokens, emails e bodies foram excluídos da telemetria operacional.
- Dependências auditadas sem vulnerabilidades conhecidas no momento da revisão.
- Exceção temporária documentada para `GHSA-qwww-vcr4-c8h2`: a aplicação não usa RSC e aguarda uma versão corrigida publicada no npm.

## [0.1.0] - 2026-07-18

### Added

- Baseline do AQUA AI Tools Site submetida à revisão AQUA Foundation.

[Unreleased]: ./docs/releases/0.1.0-review.md
