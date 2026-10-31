# Ponto 8 — Diretório e páginas por ferramenta

Data: 2026-07-24

## Resultado

- Cada card abre uma rota bilingue e estável baseada no número e no nome da ferramenta.
- “Detalhes” na homepage abre o registo correto em vez da raiz do diretório.
- As categorias da homepage e das páginas de detalhe abrem o diretório já filtrado.
- A chave canónica da categoria é preservada separadamente do rótulo traduzido.
- A página própria mostra descrição, funções, categorias, modelo de preço, estado operacional e preview do website apenas quando esses dados existem.
- Campos em falta aparecem como “Em revisão” ou “Não verificado”.
- As alternativas são apresentadas como correspondência de categoria, não como ranking editorial.
- Registos inexistentes ou removidos recebem `noindex, follow`.

## Limite editorial assumido

O catálogo atual não fornece prós/contras editoriais, screenshots verificadas ou uma data de verificação individual para todos os registos. A interface não inventa estes campos. O preview técnico do website é identificado como mutável e a data apresentada refere-se explicitamente à auditoria global do catálogo.

## Validação

Executar:

```bash
npm run check
```

O teste `scripts/tool-detail-smoke.mjs` cobre slugs, rotas PT/EN, indexação, links, filtros canónicos e fallbacks editoriais.
