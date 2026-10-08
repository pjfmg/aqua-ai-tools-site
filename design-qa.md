# Design QA — Home hero and featured tool logos

- Reference: user-provided screenshot captured on 2026-07-23.
- Implementation: local Vite preview at a 1024 × 594 CSS viewport.
- Comparison artifact: `/private/tmp/aqua-design-qa-comparison.png`.
- Catalogue state: six realistic local QA records; production continues to use the live catalogue.

## Requested changes

- Yellow star / hero mark removed from the home page.
- “AQUA AI Tools” hero heading removed from the home page.
- Portuguese subtitle is now “Encontra a ferramenta de IA certa para cada necessidade.”
- Each of the six featured tool cards renders its catalogue logo with the existing fallback chain.

## Verification

- DOM: 0 `.hero__spark` elements.
- DOM: 0 home hero headings with “AQUA AI Tools”.
- DOM: 0 occurrences of “pesquisa, filtros e listas”.
- DOM: 6 featured cards and 6 logo images.
- Assets: all 6 logo images completed with a non-zero natural width.
- Browser console: no errors.
- Visual comparison: spacing, card grid, buttons, gradient, borders and typography remain aligned with the existing layout; only the requested hero content and logo treatment changed.

final result: passed

---

# Design QA — Campo Número dos filtros

- Source visual truth: `/Users/paulogoncalves/Desktop/Captura de ecrã 2026-07-23, às 13.54.47.png`.
- Browser-rendered implementation: `/Users/paulogoncalves/Desktop/04-AQUA Apps/AQUA AI Tools Site/audit/number-field-2026-07-23/implementation-full.png`.
- Focused implementation: `/Users/paulogoncalves/Desktop/04-AQUA Apps/AQUA AI Tools Site/audit/number-field-2026-07-23/implementation-filters.png`.
- Focused comparison: `/Users/paulogoncalves/Desktop/04-AQUA Apps/AQUA AI Tools Site/audit/number-field-2026-07-23/comparison-reference-vs-fixed.png`.
- Viewport: 1280 × 720 CSS px at device scale factor 1.
- Source pixels: 2522 × 350; normalized to 1120 × 155 for the focused comparison.
- Implementation pixels: 1280 × 1001 full page and 1120 × 180 focused crop.
- State: Portuguese, signed out, secondary filters visible, catalogue temporarily unavailable locally.

## Findings and comparison history

### Initial comparison

- [P2] The `Número` input was taller than the adjacent native selects because it inherited a 24 px body line height in addition to vertical padding, while the selects used the browser's native line-height calculation.

### Fixes made

- Applied one explicit 48 px control height, horizontal-only padding and a common normal line height to all catalogue filter inputs and selects.
- Preserved the existing responsive grid, labels, values, borders, radii, focus treatment and button layout.

### Post-fix visual evidence

- The focused stacked comparison shows `Categoria`, `Preço`, `Número`, `Registos`, `Visitado` and `Favorito` sharing the same height and baseline.
- Browser measurements confirm all six controls render at exactly 48 px high.
- The `Número` field accepted the value `12` and remained aligned; no browser console errors were recorded.

## Required fidelity surfaces

- Fonts and typography: existing interface font, weights and label hierarchy are unchanged; control text now shares a consistent vertical treatment.
- Spacing and layout rhythm: all six controls align at 48 px without changing grid widths or panel spacing.
- Colors and visual tokens: existing gradient, surfaces, borders, focus ring and text colors are unchanged.
- Image quality and asset fidelity: no image assets are involved in this focused control correction.
- Copy and content: Portuguese and English labels and placeholders are unchanged.

## Follow-up polish

- No actionable P0, P1 or P2 differences remain.

final result: passed

---

# Design QA — Continuous top-navigation borders

- Source visual truth: `/Users/paulogoncalves/Desktop/Captura de ecrã 2026-07-23, às 13.34.15.png`.
- Browser-rendered implementation: `/Users/paulogoncalves/Desktop/04-AQUA Apps/AQUA AI Tools Site/audit/topnav-border-active-validation.png`.
- Focused comparison: `/Users/paulogoncalves/Desktop/04-AQUA Apps/AQUA AI Tools Site/audit/topnav-border-comparison.png`.
- Source pixels: 2522 × 228 at Retina density, normalized to 1280 × 116 for comparison.
- Implementation viewport and screenshot: 1280 × 720 CSS px, with the 1280 × 98 header cropped for comparison.
- State: Portuguese, signed out; source shows `Surpreende-me` active and `Ferramentas` hovered, implementation shows `Ferramentas` active to validate the shared border construction.

## Finding and fix

- [P2] The white `Ferramentas` hover outline lost its straight top segment because it was rendered as an inset shadow inside the horizontally masked navigation layer.
- Replaced the inset-shadow outline with a reserved transparent one-pixel border on every navigation item.
- Hover now colors that real border white; active state colors the same border purple. This keeps every side and rounded corner in one continuous border path without changing button dimensions.

## Post-fix evidence

- The focused comparison preserves the header layout, typography, spacing, Atlantic background and purple active treatment.
- Browser-computed styles report equal one-pixel borders on the top, right, bottom and left, with `box-shadow: none`.
- No browser console errors were present.
- Production build and all smoke, privacy and operations tests passed.

## Required fidelity surfaces

- Fonts and typography: unchanged.
- Spacing and layout rhythm: unchanged; the transparent base border reserves the same geometry in all states.
- Colors and visual tokens: existing white hover and purple active colors are retained.
- Image quality and asset fidelity: the original AQUA AI Tools logo asset is unchanged.
- Copy and content: unchanged.

## Follow-up polish

- No actionable P0, P1 or P2 differences remain.

final result: passed

---

# Design QA — Unified top navigation

- Source visual truth:
  - `/Users/paulogoncalves/Desktop/Captura de ecrã 2026-07-23, às 12.28.27.png` (AQUA Stage AI).
  - `/Users/paulogoncalves/Desktop/Captura de ecrã 2026-07-23, às 12.28.36.png` (UAUU).
  - `/Users/paulogoncalves/Desktop/Captura de ecrã 2026-07-23, às 12.28.48.png` (original AQUA AI Tools header content and active state).
- Desktop implementation: `/Users/paulogoncalves/Desktop/04-AQUA Apps/AQUA AI Tools Site/audit/topnav-unification-2026-07-23/implementation-desktop.png`.
- Mobile closed implementation: `/Users/paulogoncalves/Desktop/04-AQUA Apps/AQUA AI Tools Site/audit/topnav-unification-2026-07-23/implementation-mobile-closed.png`.
- Mobile open implementation: `/Users/paulogoncalves/Desktop/04-AQUA Apps/AQUA AI Tools Site/audit/topnav-unification-2026-07-23/implementation-mobile-open.png`.
- Full-view comparison: `/Users/paulogoncalves/Desktop/04-AQUA Apps/AQUA AI Tools Site/audit/topnav-unification-2026-07-23/comparison-references-vs-implementation.png`.
- Desktop browser state: Portuguese, signed out, Home active; browser-rendered output 1568 × 900 px with a 97 CSS px header and no horizontal page overflow.
- Mobile browser state: Portuguese, signed out, menu open; explicit 390 × 844 viewport and 390 × 844 output.
- Density normalization: both 3114 × 240 source strips were normalized to 1568 × 121; the desktop implementation was cropped to its rendered header region for the stacked comparison.

## Findings and comparison history

### Initial comparison

- [P1] The AI Tools header used a white translucent canvas and a large logo block, while both peer products use a compact Atlantic-blue product bar.
- [P1] Primary navigation lived in a separate light pill, breaking the shared single-bar AQUA header language.
- [P2] Authentication controls and navigation had a different contrast and spacing system from the peer products.

### Fixes made

- Unified the header on the AQUA Atlantic background and removed the logo's dark container block.
- Moved desktop navigation, branding and account actions into one compact 96 px bar.
- Reworked navigation colors, weights, spacing and active state for the dark surface while retaining the AI Tools purple identity.
- Preserved language, sign-in, sign-up/account, sticky behavior and the existing accessible mobile menu.
- Added tablet and mobile layouts with no horizontal page overflow; mobile keeps all account actions visible and expands navigation into a two-column menu.

### Post-fix visual evidence

- The stacked comparison shows consistent Atlantic background, white AQUA lockup, muted navigation, compact vertical rhythm and thin lower divider across all three products.
- The implementation intentionally retains the purple active state and the extra AI Tools account actions shown in the original product reference.
- The focused header comparison is sufficient because the requested change is isolated to the top navigation and all relevant typography and controls are legible at full size.

## Required fidelity surfaces

- Fonts and typography: existing Inter/system interface family is retained; weights, compact sizes, line height and single-line labels align with the peer headers.
- Spacing and layout rhythm: 96 px desktop bar, centered wide container, consistent horizontal gaps and 42–44 px action targets; tablet and mobile layouts reflow without clipping.
- Colors and visual tokens: AQUA Atlantic surface, white lockup, blue-grey navigation and purple AI Tools active/primary accents use existing brand tokens.
- Image quality and asset fidelity: the supplied AQUA AI Tools lockup remains the real project asset; no logo or icon was redrawn.
- Copy and content: all Portuguese/English navigation and authentication labels remain intact.

## Interaction and runtime verification

- The mobile Menu control opens the full navigation, changes to “Fechar menu” and exposes the correct expanded state.
- Navigation, language and authentication links remain present with their original destinations.
- Desktop and mobile layouts were rendered in the in-app browser.
- A clean final browser load produced no console errors; only the repository's existing React Router v7 future-flag warnings appeared.
- Production build completed successfully.

## Follow-up polish

- No actionable P0, P1 or P2 differences remain.

final result: passed

---

# Design QA — Surpreende-me

- Source visual truth: `/Users/paulogoncalves/Desktop/Captura de ecrã 2026-07-23, às 11.41.08.png` (Blog page as the established page-language reference).
- Original inconsistent state: `/Users/paulogoncalves/Desktop/Captura de ecrã 2026-07-23, às 11.40.59.png`.
- Desktop implementation: `/Users/paulogoncalves/Desktop/04-AQUA Apps/AQUA AI Tools Site/audit/surprise-page-2026-07-23/implementation-desktop.png`.
- Mobile implementation: `/Users/paulogoncalves/Desktop/04-AQUA Apps/AQUA AI Tools Site/audit/surprise-page-2026-07-23/implementation-mobile.png`.
- Full-view comparison: `/Users/paulogoncalves/Desktop/04-AQUA Apps/AQUA AI Tools Site/audit/surprise-page-2026-07-23/comparison-reference-vs-implementation.png`.
- Desktop viewport: 1557 × 712 CSS px at device scale factor 1.
- Source pixels: 3114 × 1424 at 2× density, normalized to 1557 × 712.
- Implementation pixels: 1557 × 712 at 1× density.
- Mobile viewport and implementation pixels: 390 × 844 at 1× density.
- State: Portuguese, signed out, catalogue loaded, random result visible.

## Findings and comparison history

### Initial comparison

- [P1] The original Surpreende-me route used the generic `SimplePage` header instead of the branded hero used by peer pages.
- [P2] The reroll action appeared as an unstyled control detached from the page hierarchy.
- [P2] The single result lacked a section heading and the horizontal/vertical rhythm established on Blog and other catalogue pages.

### Fixes made

- Replaced the generic page shell with the shared branded `Hero`.
- Moved the reroll action into the hero action area and reused the standard button treatment.
- Added a shared `Section` with a clear heading and supporting copy.
- Constrained the single result card to a readable centered width using existing spacing and surface tokens.

### Post-fix visual evidence

- Full-view side-by-side comparison confirms matching header width, hero width, gradient, radius, shadow, section spacing, centered hierarchy and canvas color.
- A focused comparison was not needed: the hero, section heading and result-card typography are clearly legible in the full-size 3114 × 712 comparison.
- Mobile capture confirms a 366 px hero and result-card width inside a 390 px viewport, with no horizontal overflow.

## Required fidelity surfaces

- Fonts and typography: shared interface family, weights, display sizing, line height and heading hierarchy match the existing page system.
- Spacing and layout rhythm: hero, section and card align to the same 1120 px container and 4/8 pt token system; the narrower card width is intentional for a single result.
- Colors and visual tokens: existing hero gradient, canvas, borders, button, badge and surface tokens are reused without introducing a parallel palette.
- Image quality and asset fidelity: the existing catalogue logo and fallback chain remain unchanged; no substitute artwork or placeholder UI was introduced.
- Copy and content: Portuguese and English states have page-specific title, explanatory text, action copy, loading text and empty states.

## Interaction and runtime verification

- The reroll button was enabled after catalogue load and changed the visible result from ChatGPT to Airtable.
- Desktop and mobile layouts were rendered in the in-app browser.
- No browser console errors were present; only the repository's existing React Router v7 future-flag warnings appeared.
- Production build completed successfully.

## Follow-up polish

- No actionable P0, P1 or P2 differences remain.

final result: passed
