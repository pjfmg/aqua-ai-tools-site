# AQUA Advertising Authorization

Avaliador `default-deny` da Trust Platform para publicidade em produtos AQUA.

O package distingue o carregamento da infraestrutura de consentimento de um
pedido publicitário:

```js
const bootstrap = evaluateAdvertisingAuthorization(policy, {
  action: "bootstrap-consent",
  provider: "google-adsense",
  productId: "aqua:ai-tools",
  surfaceId: "website",
  region: "eea",
  deployment: {
    consentBootstrapEnabled: true,
    tlsStatus: "valid",
  },
  cmp: {
    configured: true,
    certified: true,
  },
});
```

Esta decisão pode permitir a CMP sem permitir anúncios. Um pedido de anúncio
usa `action: "request-ad"` e exige, adicionalmente, readiness operacional,
consentimento compatível, ausência de privacy signals e prova TCF quando
aplicável. A evidência inclui `decidedAt`; escolhas futuras, expiradas ou
revogadas são recusadas. A presença explícita de GPC e DNT também é obrigatória,
para que ausência de sinal não seja interpretada como `false`.

## Princípios

- Booleanos de ambiente são interlocks, não consentimento.
- O produto nunca interpreta ausência de evidência como autorização.
- A string TCF completa não deve ser enviada para logs centrais.
- O adaptador do fornecedor executa a decisão; não redefine a política.
- Personalização e limited ads permanecem negados na política inicial.
