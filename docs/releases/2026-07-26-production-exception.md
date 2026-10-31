# Exceção temporária de publicação — 2026-07-26

## Decisão

A publicação foi instruída apesar de dois gates não verdes:

1. o catálogo upstream mantém lacunas editoriais e cinco problemas críticos medidos;
2. `npm audit` assinala `GHSA-qwww-vcr4-c8h2` no React Router 7.18.1.

## Mitigações

- A interface apresenta campos ausentes como “Em revisão” ou “Não verificado” e não inventa descrições, preços ou verificações.
- A aplicação usa `BrowserRouter` como SPA e não utiliza as APIs RSC instáveis identificadas pelo advisory.
- A versão corrigida indicada pelo advisory, 8.3.0, ainda não estava publicada no npm no momento da decisão.
- A tentativa de recuar para 7.11.0 foi rejeitada porque essa versão acumulava um conjunto maior de advisories High.
- `AQUA_OS_COMMERCE_URL` foi configurada com o serviço Commerce cujo readiness devolveu HTTP 200.

## Acompanhamento obrigatório

- Atualizar React Router para a primeira versão publicada que corrija o advisory e seja compatível com a aplicação.
- Remover esta exceção depois de `npm audit --audit-level=high` passar.
- Corrigir o website inválido e consolidar os quatro grupos de websites duplicados no catálogo.
- Registar formalmente as aprovações de Architecture, Engineering, Product, Security/Privacy e Operations.

Esta exceção permite o deployment solicitado, mas não transforma os restantes gates em aprovados.
