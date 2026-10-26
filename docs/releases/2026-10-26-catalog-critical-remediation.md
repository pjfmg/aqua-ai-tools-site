# Catálogo AQUA AI Tools — reconciliação crítica em 2026-10-26

Evidência integral da auditoria pública: [2026-10-26-catalog-quality.json](2026-10-26-catalog-quality.json).
As consultas ao Airtable e à Data Platform foram apenas de leitura; nenhum
registo ou estado de publicação foi alterado.

## Cinco problemas críticos na publicação atual

| Problema | Números públicos | Origem Airtable e decisão |
|---|---|---|
| URL inválido | AI Form Roast `196` | `recluABTwwMlEjss6` está publicado e tem `roastmyform.workhack.ai/` sem esquema. A variante HTTPS não resolveu DNS nesta verificação. Confirmar URL oficial e estado operacional; corrigir a origem com URL validado ou despublicar após decisão editorial. Não acrescentar `https://` por suposição. |
| Website duplicado | ByteCap `1163`, `1164` | `1163` está publicado; `1164` (`rec3BWLzz4Z6BZrXh`) já está **despublicado** na origem. Data Platform ainda expõe ambos. Reconciliar o estado de `1164`. |
| Website duplicado | Melies `4422`, `4423` | `4422` está publicado; `4423` (`recTPV7ys7p7xu1Vm`) já está **despublicado** na origem. Data Platform ainda expõe ambos. Preservar as diferenças de descrição para revisão editorial separada. |
| Website duplicado | Artificial Printer `611`, `612` | `611` está publicado; `612` (`recjLNBPjJmT5CqTo`) já está **despublicado** na origem. As descrições tratam de produtos diferentes; investigar sem fundir os registos ou mudar o URL por inferência. Reconciliar o estado de `612`. |
| Website duplicado | Talktotables `7068`, `7069` | `7068` está publicado; `7069` (`recMxWWHAexffq1zH`) já está **despublicado** na origem. Data Platform ainda expõe ambos. Reconciliar o estado de `7069`. |

Os quatro registos despublicados têm `Needs Review` marcado no Airtable. O
campo `Duplicated` está vazio; não é necessário inventar uma classificação de
duplicado para respeitar a decisão atual de publicação. Os oito registos dos
quatro pares continuam publicados no catálogo público nesta leitura.

## Reconciliação limitada dos quatro estados

O mapeamento do importador traduz `Published=false` para `status=draft` por
`source_record_id`. Antes de alterar qualquer destino, confirmar no ambiente
de staging que os quatro IDs da tabela acima correspondem aos números e nomes
esperados, que cada linha tem `source=airtable_import`, e registar IDs,
`status`, `logo_url`, contagem pública e dependências de ratings. Aplicar em
staging apenas `status=draft` às quatro linhas correspondentes, preservar os
demais campos e voltar a consultar cada linha. Repetir a auditoria pública
contra o endpoint de staging e verificar que os quatro pares deixam de aparecer.
Preparar rollback dos quatro estados originais antes de qualquer promoção.

O importador atual não é um mecanismo seguro para esta correção pontual:

- `--published-only` omite os rascunhos e não despublica linhas antigas.
- `--publish-eligible` pode republicar rascunhos considerados elegíveis;
  a elegibilidade não consulta `Published`.
- `--skip-logos` grava `logo_url=null` nas linhas selecionadas.
- A sincronização completa atual faz upsert amplo, migração de logótipos e
  eventual importação de ratings. Exige validação separada em staging.

Não existe nesta sessão um destino Data Platform staging configurado e
verificado com URL Supabase. Por isso, a reconciliação não foi executada e o
catálogo público permanece **NO-GO**. Uma alteração isolada na base também
tem de ser incorporada num mecanismo de sincronização que mantenha o estado
da origem, para não regressar a uma divergência.

## Dimensão editorial

A auditoria contabilizou 4 344 registos publicados, cinco problemas críticos
e 13 369 lacunas editoriais. Não existe descrição portuguesa nem preço em
nenhum dos 4 344 registos, e o estado operacional é `unknown` em todos eles.
Mesmo após despublicar os quatro registos acima, a regra atual de `ready`
exige descrição PT em pelo menos 90% dos restantes. Com 4 340 registos, seriam
necessárias **3 906** descrições portuguesas validadas; o número final deve
ser recalculado após cada reconciliação. O frontend não deve inventar conteúdo
nem marcar verificações editoriais sem revisão.

## Gates pendentes

1. Disponibilizar e verificar um staging isolado da Data Platform, com backup,
   consulta prévia das quatro linhas e rollback documentado.
2. Reconciliar os quatro estados em staging e repetir a auditoria; depois
   decidir o URL e a publicação de `196` na origem.
3. Corrigir o processo de sincronização para refletir futuras despublicações
   sem apagar logótipos ou republicar rascunhos, e validar ratings/referências.
4. Executar a revisão editorial portuguesa e repetir `--enforce`; promover
   somente após fechar os gates técnicos, editoriais e de release.
