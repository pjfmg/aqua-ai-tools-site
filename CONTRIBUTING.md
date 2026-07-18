# Contribuir

| Propriedade | Valor |
|---|---|
| Documento | Contribution Guide |
| Categoria | Engineering |
| Responsável | AQUA Engineering |
| Versão | 1.0.0 |
| Estado | Published |

## Fluxo

1. Definir o problema e confirmar se a capacidade pertence ao produto ou ao AQUA OS.
2. Criar ADR no AQUA OS para decisões estruturais permanentes.
3. Implementar a menor alteração compatível e atualizar contratos/documentação.
4. Executar `npm run check` antes de revisão.
5. Registar alterações relevantes no `CHANGELOG.md`.

## Regras obrigatórias

- Nunca adicionar `.env`, credenciais, tokens, dados pessoais ou snapshots de produção.
- Novos consumidores usam exclusivamente `/v1`.
- Escritas externas não têm retry automático sem idempotency key.
- Alterações incompatíveis exigem versão major, plano de migração e rollback.
- Não editar migrations já aplicadas; criar uma migration seguinte.
- Preservar compatibilidade PT/EN, navegação por teclado e reduced motion.

Uma alteração só está concluída quando código, testes, documentação e operação descrevem o mesmo comportamento.
