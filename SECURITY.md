# Política de Segurança

| Propriedade | Valor |
|---|---|
| Documento | Security Policy |
| Categoria | Security |
| Responsável | AQUA Engineering |
| Versão | 1.0.0 |
| Estado | Published |

## Reportar uma vulnerabilidade

Enviar uma descrição privada para `aquaticus@mail.telepac.pt`, com o componente afetado, impacto provável e passos mínimos de reprodução. Não incluir dados pessoais reais, tokens ou credenciais.

Não publicar a vulnerabilidade antes de existir uma correção ou uma decisão coordenada de divulgação. O objetivo operacional é acusar receção em três dias úteis e comunicar o plano de tratamento após triagem; estes prazos não constituem garantia contratual.

## Âmbito suportado

Apenas a versão atualmente publicada recebe correções. Código em `legacy/` existe para referência e não deve ser usado em novos deployments.

## Princípios

- Não conceder acesso, Pro ou billing através de fallback local.
- Revogar e rodar imediatamente qualquer segredo exposto.
- Preservar trace IDs e evidência operacional sem copiar conteúdo sensível.
- Alterações de segurança exigem testes, changelog e revisão proporcional ao risco.
