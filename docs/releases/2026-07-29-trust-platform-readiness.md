# Trust Platform readiness — produção

## Resultado

| Propriedade | Valor |
|---|---|
| Alvo | `https://aqua-aitools.com` |
| Data | 2026-07-29 |
| Release observada | `0.1.0-20260726.1` |
| Estado | **Blocked / default-deny** |
| Evidência estruturada | `2026-07-29-trust-platform-readiness.json` |

O site está operacional, mas publicidade não está autorizada pela Trust
Platform. O deployment observado ainda não contém o novo bundle e não expõe uma
CMP/TCF verificável.

## Controlos verdes

- HTTPS ativo e HSTS `max-age=63072000`;
- CSP, framing, referrer e permissions policies presentes;
- nenhum script de analytics ou publicidade observado antes da escolha;
- `ads.txt` responde HTTP 200 e contém:
  `google.com, pub-8295677733502537, DIRECT, f08c47fec0942fa0`;
- `/v1/health/live` e `/v1/health/ready` verdes;
- release pública identificada.

## Bloqueios

- bundle público `/assets/index-zDUXnIj0.js` não contém os marcadores da Trust
  Platform;
- `window.__tcfapi` não está disponível;
- `window.googlefc` não está disponível;
- não existe estado CMP `loaded`;
- não existe prova redigida de string TCF presente;
- não existe evento `tcloaded` ou `useractioncomplete`;
- aprovação do site no fornecedor não é verificável publicamente.

## Configuração Vercel preparada

As variáveis de Production foram configuradas para o próximo deployment sem
afirmar evidência inexistente:

| Variável | Estado preparado |
|---|---|
| `VITE_ADSENSE_TCF_READY` | `false` |
| `VITE_ADVERTISING_EMERGENCY_STOP` | `true` |
| `VITE_CMP_CERTIFIED` | `false` |
| `VITE_TCF_VERSION` | `2.3` |
| `VITE_ADSENSE_SITE_APPROVED` | `false` |
| `VITE_ADS_TXT_AUTHORIZED` | `true` |
| `VITE_ADVERTISING_REGION` | `unknown` |

Estas variáveis só entram em vigor num novo deployment. Não foi realizado
deployment porque o repositório contém alterações não relacionadas ainda por
consolidar.

## Critério para desbloquear

1. Publicar uma CMP certificada que exponha `__tcfapi`.
2. Confirmar certificação e aprovação do site com evidência do fornecedor.
3. Publicar o bundle integrado da Trust Platform.
4. Recolher apenas o diagnóstico redigido:
   `configured`, `status`, `tcStringStatus` e `eventStatus`.
5. Executar:

```bash
npm run trust:readiness -- \
  --base-url https://aqua-aitools.com \
  --browser-evidence docs/releases/<data>-trust-browser-evidence.json \
  --evidence docs/releases/<data>-trust-platform-readiness.json
```

6. Alterar os gates para `true` apenas depois de todos os controlos passarem e
   testar o emergency stop num deployment separado.
