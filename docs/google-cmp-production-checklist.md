# Google CMP — configuração de produção

## Estado seguro

A integração está preparada para a CMP certificada **Google Privacy & messaging**,
mas permanece bloqueada por defeito. O tag CMP é independente do tag AdSense:
autorizar o bootstrap da mensagem nunca autoriza um pedido de anúncio.

O tag só pode ser inserido quando todos estes controlos forem explícitos:

- `VITE_CMP_BOOTSTRAP_ENABLED=true`;
- `VITE_CMP_PROVIDER=google-privacy-messaging`;
- `VITE_GOOGLE_CMP_TAG_URL` contém o tag exato copiado do AdSense e usa
  `https://fundingchoicesmessages.google.com/i/pub-…`;
- `VITE_CMP_MESSAGE_PUBLISHED=true`;
- `VITE_CMP_CERTIFIED=true`.

As rotas `/privacidade` e `/en/privacy` nunca carregam o tag CMP. A publicidade
continua bloqueada enquanto `VITE_ADSENSE_TCF_READY=false` ou
`VITE_ADVERTISING_EMERGENCY_STOP=true`.

## Configuração no AdSense

1. Confirmar que `aqua-aitools.com` pertence à conta
   `pub-8295677733502537` e está aprovado em **Sites**.
2. Abrir **Privacy & messaging → European regulations → Create message**.
3. Selecionar o site e a política `https://aqua-aitools.com/privacidade`.
4. Ativar uma escolha **Do not consent** clara na primeira página.
5. Manter todos os propósitos e vendors baseados em consentimento desligados
   por defeito.
6. Incluir Português (Portugal) e Inglês e rever o texto em ambos.
7. Confirmar Google Advertising Products (vendor ID 755), propósitos usados e
   disclosed vendors exigidos pelo TCF v2.3.
8. Publicar a mensagem e copiar o tag exato fornecido pela consola.
9. Testar em staging com `?fc=alwaysshow&fctype=gdpr`.

Referências oficiais:

- https://support.google.com/adsense/answer/13554116
- https://support.google.com/adsense/answer/9804260
- https://support.google.com/adsense/answer/10960768
- https://support.google.com/adsense/answer/9999955

## Sequência dos interlocks

Primeiro deployment de staging:

```text
VITE_CMP_BOOTSTRAP_ENABLED=true
VITE_CMP_PROVIDER=google-privacy-messaging
VITE_GOOGLE_CMP_TAG_URL=<tag exato copiado do AdSense>
VITE_CMP_MESSAGE_PUBLISHED=true
VITE_CMP_CERTIFIED=true
VITE_TCF_VERSION=2.3
VITE_ADSENSE_TCF_READY=false
VITE_ADVERTISING_EMERGENCY_STOP=true
```

Validar `window.__tcfapi`, estado `loaded`, evento `tcloaded` ou
`useractioncomplete` e apenas a presença — nunca o conteúdo — da TC string.

Só num deployment posterior, depois de site aprovado, `ads.txt` confirmado e
readiness verde:

```text
VITE_ADSENSE_SITE_APPROVED=true
VITE_ADS_TXT_AUTHORIZED=true
VITE_ADSENSE_TCF_READY=true
VITE_ADVERTISING_EMERGENCY_STOP=false
```

Se qualquer controlo regredir, reativar imediatamente o emergency stop.
