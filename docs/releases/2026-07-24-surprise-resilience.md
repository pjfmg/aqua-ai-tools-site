# Resiliência de “Surpreende-me” — 2026-07-24

| Propriedade | Valor |
|---|---|
| Superfícies | `/surpreende-me` e `/en/surprise-me` |
| Estado | Implementado |
| Risco corrigido | Código `LOAD_FAILED` visível e ausência de recuperação |

## Alterações

- Códigos técnicos deixaram de ser apresentados ao utilizador.
- Falhas iniciais mostram uma explicação bilingue, `Tentar novamente` e acesso direto ao diretório.
- Um catálogo vazio tem estado próprio e ações de recuperação.
- Resultados parciais preservam a descoberta e usam um aviso controlado.
- A ação “Outra descoberta” evita repetir imediatamente a mesma ferramenta quando existem alternativas.
- O card passou a ter uma segunda ação clara para explorar o diretório completo.

## Critérios verificados

- Estados loading, erro, vazio, aviso e sucesso são mutuamente claros.
- A região dinâmica usa `aria-live` e expõe `aria-busy` durante a escolha inicial.
- O retry reutiliza a invalidação de cache já governada pelo hook do catálogo.
- O algoritmo aleatório tem testes determinísticos para zero, um e vários resultados.
