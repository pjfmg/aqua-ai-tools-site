# Primeira dobra da homepage mobile — 2026-07-24

| Propriedade | Valor |
|---|---|
| Superfície | `/` e `/en` |
| Viewports | 390×844 e 320×568 CSS px |
| Estado | Implementado |
| Evidência | `audit/home-mobile-fold-2026-07-24/` |

## Diagnóstico

Na versão publicada a 390 px, o hero media aproximadamente 1 454 px de altura. A faixa “Começa por aqui” ocupava cerca de 1 100 px porque os seis cards eram empilhados numa única coluna. A secção de categorias só começava perto dos 1 874 px.

## Alterações

- A faixa de ferramentas usa navegação horizontal com scroll snap no mobile.
- O card seguinte fica parcialmente visível para comunicar que existe mais conteúdo.
- Todos os destaques continuam disponíveis; nenhum é escondido para reduzir altura.
- CTAs principal e secundário partilham uma linha em ecrãs móveis.
- Padding, intervalos e metadados do hero foram compactados apenas na homepage.
- Categorias passam para duas colunas compactas em mobile.
- Outras páginas que usam `Hero` e `Section` mantêm o layout anterior.

## Resultado medido

| Indicador | Antes | Depois |
|---|---:|---:|
| Altura do hero a 390 px | 1 454 px | 440 px |
| Altura da faixa “Começa por aqui” | 1 100 px | 196 px |
| Início das categorias, relativo ao topo do hero | 1 478 px | 465 px |
| Largura do documento a 390 px | 390 px | 390 px |
| Largura do documento a 320 px | — | 320 px |

A redução da altura do hero é de aproximadamente 70%. A 390×844, o título das categorias entra na primeira dobra quando a escolha de privacidade já foi efetuada. No primeiro acesso, o banner de consentimento continua a ocupar espaço por necessidade legal, mas deixa de ser seguido por seis cards empilhados.

## Critérios

- Sem overflow horizontal do documento a 390 px e 320 px.
- Alvos interativos preservam altura útil.
- A faixa interna é navegável por toque e mantém foco nos links.
- Desktop não sofre alterações estruturais.
