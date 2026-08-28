# Qualidade do catálogo

O catálogo público é auditado com métricas objetivas antes de cada release. A fonte oficial continua a ser a AQUA OS Data Platform; este produto não corrige nem inventa conteúdo editorial em runtime.

## Regras de apresentação

- Uma descrição portuguesa só é mostrada quando existe conteúdo português ou uma tradução curta explicitamente validada.
- Conteúdo em falta aparece como “Descrição editorial em revisão”.
- Categorias conhecidas são apresentadas no idioma da interface.
- Registos com o mesmo identificador ou o mesmo website canónico são mostrados apenas uma vez.
- A deduplicação no frontend é uma proteção; a remoção definitiva deve acontecer na Data Platform.

## Auditoria

Executar localmente ou contra um deployment:

```bash
npm run catalog:quality -- --base-url http://localhost:3001
npm run catalog:quality:production
```

Para guardar evidência:

```bash
npm run catalog:quality:production -- --evidence audit/catalog-quality.json
```

O comando percorre todas as páginas publicadas de `/v1/tools` e mede:

- nomes e websites válidos;
- descrições PT/EN e descrições genéricas;
- funções, preço, categorias e logos;
- estado operacional verificado;
- nomes e websites duplicados;
- categorias fora da taxonomia conhecida.

Usar `--enforce` para devolver um exit code diferente de zero quando o catálogo não cumpre os limites mínimos. A ausência de conteúdo português, preço ou estado operacional é um problema de dados upstream, não deve ser escondida com texto sintético.

## Ordem de remediação na Data Platform

1. Corrigir websites inválidos e consolidar duplicados exatos.
2. Verificar estado operacional e retirar ferramentas inativas.
3. Preencher descrições portuguesas editoriais, com revisão humana.
4. Preencher categorias canónicas, funções e modelos de preço.
5. Completar logos de origem estável.
6. Repetir a auditoria com `--enforce` e anexar a evidência à release.
