# Registo de Dívida Técnica

| Propriedade | Valor |
|---|---|
| Documento | Technical Debt Register |
| Categoria | Engineering Governance |
| Responsável | AQUA Engineering |
| Versão | 1.0.0 |
| Estado | Review |

| ID | Dívida/risco | Justificação temporária | Responsável | Prioridade | Plano de eliminação |
|---|---|---|---|---|---|
| TD-001 | Rotas API sem versão ainda publicadas | Compatibilidade com clientes antigos | API Platform | Alta | Medir utilização, anunciar sunset e remover numa versão major |
| TD-002 | Billing portal suspenso | Implementação anterior não garantia ownership seguro | Commerce | Alta | Implementar portal no serviço Commerce com token e customer derivado server-side |
| TD-004 | Migrations dos pontos 3–7 não aplicadas | A revisão não autoriza mutação da base de produção | Operations | Bloqueante | Aplicar por ordem em staging, validar rollback e promover com aprovação |
| TD-005 | Alertas externos não configurados | Requer acesso ao fornecedor de hosting/monitorização | Operations | Bloqueante | Ligar SLO/burn-rate alerts e testar uma notificação antes do release |

Cada item só pode ser removido com evidência verificável e entrada no changelog.
