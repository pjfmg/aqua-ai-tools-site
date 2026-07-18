# AQUA AI Tools — Runbook Operacional

## Objetivo

Recuperar o serviço com segurança, preservar evidência e reduzir o impacto. Nunca incluir tokens, emails, bodies ou segredos em logs ou tickets.

## SLOs

- Disponibilidade mensal da API pública: **99,5%**.
- Latência p95 por operação: **até 1 500 ms**.
- Taxa de respostas 5xx: **inferior a 0,5%** numa janela de 15 minutos.
- Readiness: todas as dependências críticas disponíveis.

Alertar quando o erro consumir 10% do budget mensal numa hora, p95 exceder 1 500 ms durante 15 minutos, 5xx exceder 2% durante 5 minutos, ou readiness falhar três vezes consecutivas.

## Diagnóstico

1. Consultar `/v1/health/live`. Se falhar, validar deployment/runtime.
2. Consultar `/v1/health/ready`. Um `503` identifica apenas a dependência afetada, sem expor configuração.
3. Pesquisar `traceId` nos logs estruturados e em `aqua_api_audit_events`.
4. Comparar taxa, erros e duração na view `aqua_api_red_metrics_5m`.
5. Confirmar a release (`AQUA_RELEASE`) e alterações recentes.

O readiness mantém o resultado durante cinco segundos para evitar amplificação de carga sobre as dependências.

## Recuperação

- Data Platform indisponível: manter billing isolado; recuperar Supabase/serviço de dados e validar leitura antes de reabrir escritas.
- Commerce indisponível: suspender checkout; não conceder Pro por fallback local.
- Erros 429: validar consumo e a store de rate limiting; não aumentar limites sem avaliar abuso.
- Aumento de 5xx após release: reverter para a última release saudável e preservar os trace IDs da janela afetada.
- Circuit breaker aberto: corrigir a dependência e aguardar 30 segundos; o runtime volta a testar automaticamente.

## Encerramento

Registar início/fim, impacto, causa, ações, responsável e prevenção. Incidentes severos exigem revisão pós-incidente sem culpa e atualização deste runbook.
