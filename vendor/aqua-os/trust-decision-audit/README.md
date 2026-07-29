# AQUA Trust Decision Audit

Contrato e utilitário de minimização para decisões da Trust Platform.

O evento contém apenas produto, superfície, política/versionamento, ação, modo,
resultado, códigos de motivo e timestamp. O contrato rejeita chaves adicionais,
códigos livres e timestamps não canónicos.

O package não escolhe um destino nem transmite eventos. Cada produto liga o
evento validado a um sink autorizado, com retenção e acesso definidos pela
operação. Email, IP, conteúdo, escolha integral e string TCF não pertencem ao
contrato.

```js
import { createTrustDecisionEvent } from "@aqua-os/trust-decision-audit";

const event = createTrustDecisionEvent({
  productId: "aqua:ai-tools",
  surfaceId: "website",
  policyId: "aqua-advertising-authorization-v1",
  policyVersion: 1,
  decision,
});
```
