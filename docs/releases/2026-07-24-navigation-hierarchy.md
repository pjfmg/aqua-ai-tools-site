# Hierarquia da navegação — 2026-07-24

| Propriedade | Valor |
|---|---|
| Superfície | Header global PT/EN |
| Breakpoints | Desktop, tablet e mobile |
| Estado | Implementado |
| Evidência | `audit/navigation-hierarchy-2026-07-24/` |

## Diagnóstico

A 1 024 px, a navegação dispunha de 465 px mas os 12 links exigiam 896 px. O último destino terminava atrás da área de autenticação e só era alcançável através de scroll horizontal sem indicação visível.

## Alterações

- Seis destinos de descoberta permanecem sempre visíveis: Home, Pro, Ferramentas, Destaques, Surpreende-me e Blog.
- Áreas pessoais e operacionais passaram para o disclosure `Mais`.
- O disclosure expõe `aria-expanded` e `aria-controls`.
- Escape fecha `Mais` e devolve o foco ao botão.
- Um clique fora fecha o disclosure.
- A mudança de rota fecha os menus desktop e mobile.
- No mobile, o botão `Menu` continua a apresentar os 12 destinos diretamente, sem criar um segundo nível.

## Resultado medido

| Indicador a 1 024 px | Antes | Depois |
|---|---:|---:|
| Links no primeiro nível | 12 | 6 + `Mais` |
| Conteúdo exigido pela navegação | 896 px | 480 px |
| Último controlo visível | terminava em 1 149 px | `Mais` termina em 732 px |
| Início da autenticação | 740 px | 740 px |
| Largura do documento | 1 024 px | 1 024 px |

O disclosure abre sem deslocar o layout, Escape fecha-o e devolve o foco a `Mais`. Ao navegar para `/definicoes`, o menu fecha e `Mais` mantém o estado ativo. A 390 px, os 12 links continuam diretamente visíveis no menu mobile e o documento mantém 390 px de largura.

## Critérios

- Nenhum destino é removido.
- O destino secundário atual mantém indicação ativa através de `Mais`.
- A navegação desktop deixa de depender de scroll horizontal.
- A sequência de teclado não inclui links secundários quando o disclosure desktop está fechado.
- O menu mobile continua bilingue e totalmente navegável.
