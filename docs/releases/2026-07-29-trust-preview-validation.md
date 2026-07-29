# Trust Platform — validação do Preview

## Resultado

O deployment Vercel associado ao commit `fbbae4e` foi validado em
`2026-07-29`. O bundle contém a Trust Platform e os controlos de privacidade
funcionam em modo seguro, mas a readiness global permanece **bloqueada**.
Publicidade continua desativada e o emergency stop continua ativo.

## Controlos validados

- homepage por HTTPS com HTTP 200;
- HSTS de dois anos, CSP e proteção contra framing presentes;
- bundle `/assets/index-BqGKNtaY.js` contém os marcadores da Trust Platform;
- `ads.txt` responde HTTP 200 com o seller autorizado;
- nenhum pedido ou script opcional antes da escolha;
- rejeição mantém analytics, publicidade e CMP desligados;
- aceitar tudo autoriza apenas analytics neste Preview seguro;
- publicidade permanece desligada sem CMP/TCF;
- retirar consentimento remove imediatamente os scripts opcionais;
- escolha expirada e mudança de política exigem renovação;
- GPC e DNT mantêm publicidade negada.

Os pedidos aos fornecedores opcionais foram intercetados durante a automação.
Não foram guardados dados pessoais nem strings TCF.

## Bloqueios observados

- `/v1/health/ready` devolve HTTP 503;
- os checks `configuration` e `commerce` não estão ready;
- a identidade reportada por liveness é `0934f91`, anterior ao commit do
  deployment, pelo que `AQUA_RELEASE` precisa de ser alinhado;
- a CMP está deliberadamente bloqueada (`cmp.bootstrap-disabled`);
- `__tcfapi`, prova TCF e evento ready não existem enquanto o Ponto 4 depender
  da publicação e certificação no fornecedor.

Estes bloqueios são consistentes com default-deny. Não justificam ligar
publicidade.

## Evidência

- `2026-07-29-trust-preview-browser-evidence.json`;
- `2026-07-29-trust-preview-readiness.json`;
- `2026-07-29-trust-preview-configuration.json`.

Para repetir a recolha:

```bash
npm run trust:capture-preview -- \
  --base-url https://<preview> \
  --output /tmp/trust-preview-browser-evidence.json
```
