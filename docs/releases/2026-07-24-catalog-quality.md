# Revisão da qualidade do catálogo — 2026-07-24

| Propriedade | Valor |
|---|---|
| Alvo | `https://aqua-aitools.com` |
| Registos publicados auditados | 4 344 |
| Estado | Bloqueado por qualidade de dados upstream |
| Evidência | `audit/platform-review-2026-07-24/catalog-quality.json` |

## Resultado observado

| Indicador | Resultado |
|---|---:|
| Nome válido | 100% |
| Website válido | 4 343 de 4 344 |
| Descrição PT | 0% |
| Descrição EN | 99,9% |
| Funções | 9,9% |
| Preço | 0% |
| Categoria | 92,2% |
| Logo de origem | 74,9% |
| Estado operacional verificado | 0% |

Foram ainda detetados 20 grupos com nomes repetidos e 4 grupos com o mesmo website canónico. A aplicação passou a ocultar duplicados exatos defensivamente, a localizar a taxonomia observada e a deixar de fabricar descrições portuguesas genéricas.

## Decisão

O código do produto está preparado para apresentar ausências de forma honesta e medir a qualidade automaticamente. O ponto 2 não pode ser considerado encerrado ao nível da plataforma enquanto a AQUA OS Data Platform não corrigir o website inválido, consolidar duplicados, verificar o estado operacional e completar os campos editoriais.

Os critérios e a ordem de remediação estão em [`../catalog-quality.md`](../catalog-quality.md).
