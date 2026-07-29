# AQUA Consent Policy

Avaliador local e `default-deny` das escolhas de consentimento Web da Trust
Platform.

O package valida a política transversal, calcula a expiração a partir de
`decidedAt` e nega categorias opcionais perante ausência, incompatibilidade,
expiração ou revogação. `necessary` permanece sempre ativo. GPC e DNT retiram a
autorização de publicidade sem transformar uma escolha válida numa escolha
inválida.

```js
const result = evaluateConsentChoice(policy, choice, {
  now: new Date(),
});

if (result.status === "valid" && result.grants.analytics) {
  loadAnalytics();
}
```

A escolha permanece no dispositivo do utilizador. Produtos não devem enviar
identificadores pessoais nem a string TCF completa para logs centrais.
