# Trust Platform — canary default-deny do Preview

## Resultado

O canary executado em `2026-07-29` passou os cinco gates. O Preview está
operacional e continua a impedir publicidade enquanto CMP, TCF e aprovação do
fornecedor não estiverem comprovados.

| Gate | Resultado |
|---|---|
| HTTPS e security headers | Pass |
| Bundle Trust Platform | Pass |
| `ads.txt` | Pass |
| Platform readiness | Pass |
| Cenários browser default-deny | Pass |

## Readiness

- `/v1/health/live`: HTTP 200, release
  `93097eab0e3233aa04d114fb3c61a9dd42c8e7ee`;
- `/v1/health/ready`: HTTP 200;
- configuração, Data Platform e Commerce: `ok`;
- o URL público não sensível do Commerce foi adicionado apenas ao ambiente
  Preview;
- os probes iniciais excederam o SLO de 1 500 ms, mas responderam 2xx antes do
  timeout de disponibilidade de cinco segundos.

`latencySlo: breached` deve alimentar alertas e investigação de cold starts,
sem produzir um falso `SERVICE_NOT_READY`.

## Segurança de rollout

- nenhum pedido opcional antes da escolha;
- nenhum script publicitário em qualquer cenário;
- rejeição, revogação, expiração e mudança de política mantêm providers
  desligados;
- GPC e DNT mantêm publicidade negada;
- pedidos de terceiros foram intercetados e a evidência não guarda strings TCF
  nem dados pessoais;
- emergency stop continua ativo.

O workflow manual `Trust Preview Canary` repete a recolha com Chromium, aplica
o gate e conserva a evidência minimizada durante 14 dias.

## Bloqueios que transitam

Produção e publicidade permanecem bloqueadas até existir mensagem CMP
publicada, CMP certificada, tag exato, `__tcfapi` TCF 2.3 verificável e aprovação
do site no fornecedor.
