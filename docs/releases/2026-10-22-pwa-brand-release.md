# AQUA AI Tools — PWA brand release candidate

Date: 2026-10-22

Current follow-up: [2026-10-26-pwa-candidate-progress.md](2026-10-26-pwa-candidate-progress.md).

## Decision

Ship the current product as a standards-based Web App/PWA. Do not describe it as a native iOS or macOS application: this repository contains no Xcode project, SwiftUI target, provisioning configuration, or App Store distribution pipeline.

A native application should become a separate, explicitly approved project only when App Store distribution, native background execution, platform integrations, or native-only capabilities justify the additional release surface.

## Included

- Mature AQUA AI Tools board on the entry experience.
- ONDA + AQUA + AI TOOLS signatures for light and dark surfaces.
- Favicon, Apple touch icons, manifest icons, Safari Web App and desktop installation assets.
- Installable PWA manifest and responsive entry assets.
- Service worker with same-origin static caching, API exclusion and branded offline fallback.
- Automated local and production PWA asset verification.

## Evidence required before deployment

1. `npm run test:smoke`
2. `npm run test:e2e`
3. `npm run build`
4. `npm run release:check`
5. `npm run release:verify:production` must be green before and after deployment.
6. `npm run pwa:verify:production` must be green after deployment.

## Device boundaries

- iMac: Safari Web App installation and launch can be verified locally.
- iPhone/iPad: opening the production URL is distinct from installing it on the Home Screen. Home Screen installation requires an unlocked, user-operated device.
- iPad6,11 currently exposes pairing state `unsupported`; do not claim installation until the device is trusted and the installed Web App is opened.

## Current release gate

Production liveness and catalogue checks pass, but readiness is blocked by the Commerce dependency. Keep this candidate undeployed until `/v1/health/ready` returns HTTP 200 with every dependency at `ok`.

Production diagnosis on 2026-10-23:

- `AQUA_OS_COMMERCE_URL` points to the official production service at `https://aqua-os-commerce.vercel.app/`.
- The Commerce deployment is live, but its own `/v1/health/ready` endpoint returns HTTP 503 (`SERVICE_NOT_READY`).
- The production and staging Commerce projects have no configuration entries for `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_ACCESS_TOKEN`, or `SHOPIFY_WEBHOOK_SECRET`.
- Do not weaken the readiness contract or deploy this candidate merely to bypass the missing Shopify configuration. Supply the approved Shopify production configuration, or record an explicit architecture decision for a supported Shopify-disabled mode before changing the contract.
- Product decision on 2026-10-23: Shopify remains the production commerce authority. The connected shop was verified as AQUA Store (`aquaticus.myshopify.com`); credential creation, webhook registration and Commerce redeployment remain pending an authenticated Shopify Admin session.

## Local QA evidence

- Aggregate project check: passed.
- Smoke suites: 15 passed.
- Playwright privacy E2E: 11 passed.
- Production build: passed, 105 modules transformed.
- Offline browser proof: service worker controlled the page and returned `Sem ligação | AQUA AI Tools` with the network disabled.
- Lighthouse after optimization: Performance 90, Accessibility 100, Best Practices 96, SEO 100.
- Largest Contentful Paint improved from 5.7 s to 2.8 s in the same local audit profile.
- Estimated image-delivery waste fell from about 598 KiB to 23 KiB.

## Current device evidence

- iPhone 17: physical, paired, connected and Developer Mode enabled.
- iPad6,11: booted but pairing is `unsupported`; CoreDevice cannot acquire a usage assertion.
- iMac: Safari Web App exists at `~/Applications/AQUA AI Tools.app`, and its manifest targets `https://aqua-aitools.com/`.
