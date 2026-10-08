# Trust Platform — release Production

## Resultado

A fundação Trust Platform e o consumidor AQUA AI Tools foram integrados em
`main` em `2026-07-29`. A release está operacional em
`https://aqua-aitools.com` com publicidade suspensa por default-deny.

| Propriedade | Valor |
|---|---|
| Release consumidor | `4352e540abf2f20fbfaafef1a88724c68681aada` |
| Merge AQUA OS | `af0f2726b5c8026c108338ed981d0e6b256956b6` |
| Quality Gate | Pass |
| Vercel | Pass |
| Cloudflare Pages | Pass |
| Production canary | Pass, 5/5 |
| Publicidade autorizada | Não |

## Produção

- homepage, liveness, readiness e `ads.txt`: HTTP 200;
- configuration, Data Platform e Commerce: `ok`;
- Data Platform: 1 433 ms, `latencySlo: ok`;
- Commerce: 192 ms, `latencySlo: ok`;
- HSTS e CSP presentes;
- bundle publicado contém os marcadores da Trust Platform;
- seller Google autorizado em `ads.txt`.

## Privacidade

O browser canary validou:

- zero pedidos e scripts opcionais antes da escolha;
- rejeição sem providers;
- aceitação autoriza analytics, mas não publicidade;
- revogação remove providers e regista `revokedAt`;
- expiração e mudança de política exigem renovação;
- GPC e DNT mantêm publicidade negada;
- zero scripts AdSense em todos os cenários.

Os pedidos de terceiros foram intercetados. A evidência não contém strings TCF,
identidade, IP, conteúdo funcional ou outros dados pessoais.

## Interlocks

Production foi explicitamente configurada com:

- CMP bootstrap: desligado;
- mensagem CMP publicada: falso;
- CMP certificada: falso;
- TCF: `2.3`, sem prova live;
- aprovação AdSense do site: falso;
- AdSense/TCF ready: falso;
- emergency stop: ativo;
- região: `unknown`;
- tag CMP: intencionalmente ausente.

## Estado final

A Trust Platform está em produção e protege o consumidor. A monetização não
está autorizada.

Ligar publicidade exige uma mudança separada, com mensagem CMP publicada,
certificação verificável, tag exato, `__tcfapi` live, prova TCF 2.3, aprovação
do site e novo canary. A ausência de qualquer uma destas provas mantém
default-deny.
