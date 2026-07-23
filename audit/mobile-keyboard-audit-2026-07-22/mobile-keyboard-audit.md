# AQUA AI Tools — auditoria mobile e teclado

Data: 22 julho 2026
Viewport principal: 390 × 844 CSS px
Reflow compacto: 320 × 568 CSS px

## Veredicto

A experiência mantém a identidade visual, os controlos principais têm áreas de toque confortáveis e o modal da newsletter funciona bem em mobile. Os maiores riscos estão no topo: a navegação horizontal esconde opções sem qualquer indicação e obriga o utilizador de teclado a atravessar quinze links antes de chegar à pesquisa.

## Passos

1. **Entrada mobile com consentimento — Atenção**
   - O banner é legível e os botões têm largura confortável.
   - Ocupa cerca de metade do viewport e cobre a ação principal da página.
   - Em ecrãs baixos, pode ocultar mais contexto do que o necessário.

2. **Homepage mobile — Atenção**
   - Hero, CTAs e cards refluem sem overflow horizontal do documento.
   - A navegação principal é uma faixa horizontal sem gradiente, seta ou texto que revele as opções escondidas.

3. **Diretório e filtros mobile — Bom com fricção**
   - Pesquisa, inputs e selects ficam numa coluna clara, com controlos altos e labels visíveis.
   - A lista completa de filtros cria uma primeira dobra longa; ações de ordenação e limpeza ficam muito abaixo.

4. **Ordem e visibilidade do foco — Atenção**
   - O foco visível tem contorno ciano forte e consistente.
   - A pesquisa é apenas o 16.º controlo focável: logo + autenticação + onze links de navegação vêm primeiro.
   - O teste automático de avanço repetido por Tab foi limitado pelo runtime; a ordem DOM foi confirmada diretamente.

5. **Newsletter a 390 px — Bom**
   - O conteúdo cabe no viewport, o email recebe foco inicial e o botão de fechar é claro.
   - Escape fecha o modal e devolve o foco a “Escolher temas”.

6. **Newsletter a 320 px — Bom com ressalva**
   - Não existe overflow horizontal.
   - O diálogo usa scroll interno: `530px` visíveis para `877px` de conteúdo.
   - Os temas e o consentimento ficam abaixo da dobra, mas permanecem alcançáveis e a barra de scroll aparece durante a deslocação.

## Prioridades

1. Adicionar um link “Saltar para o conteúdo” como primeiro elemento focável.
2. No mobile, substituir a faixa de onze links por um menu explícito ou acrescentar uma indicação visível de scroll horizontal.
3. Colocar filtros secundários numa área expansível, mantendo pesquisa, categoria e preço visíveis inicialmente.
4. Reduzir a altura inicial do banner de consentimento em ecrãs pequenos, sem reduzir os alvos de toque.

## Limites

Esta auditoria confirma reflow, ordem DOM, foco visível no logótipo, foco inicial do modal, Escape e retorno de foco. Não confirma leitor de ecrã, contraste calculado em todos os estados, zoom a 200/400%, navegação por hardware real em iOS/Android ou o ciclo completo de Tab, devido à limitação do runtime de automação.

## Implementação P0

Concluída em 22 julho 2026:

- “Saltar para o conteúdo” é agora o primeiro controlo focável e transfere o foco para `main-content`.
- A navegação mobile está fechada por defeito e é aberta pelo botão “Menu”. Os onze links deixam de integrar a sequência de Tab enquanto o menu está fechado.
- Escape fecha o menu e devolve o foco ao botão de abertura.
- Em desktop, a navegação continua visível e o botão mobile permanece oculto.
- Validação técnica concluída: build de produção, smoke tests e inspeção responsiva a 390 × 844 e 1280 px, sem erros de consola.

## Implementação P1

Concluída em 22 julho 2026:

- No mobile, categoria e preço permanecem visíveis; número, estado dos registos, visitado e favorito passaram para “Mais filtros”.
- O bloco expansível está fora da sequência de Tab quando fechado e indica quantos filtros secundários estão ativos.
- O banner de consentimento usa texto mais curto e três ações compactas no mobile, preservando alvos de toque de 44 px e os nomes acessíveis completos.
- Em desktop, todos os filtros continuam visíveis e o controlo expansível permanece oculto.
- Validação técnica concluída: build de produção, smoke tests, comportamento expandir/recolher a 390 × 844 e regressão desktop a 1280 px.
