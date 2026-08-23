# Design System — GREATIMMOB

<!-- impeccable:design-schema 1 -->

## World

**Atlantic Ledger** — quiet luxury for coastal property management. Deep Atlantic ink, bone paper, champagne hairlines. Boutique hotel brand book energy without kitsch Morocco tropes.

**Primary surface:** [greatimmob.ma](https://greatimmob.ma) (WordPress / Elementor chrome in `.tmp/gi-*`).  
`website-com/` is secondary / experiment — do not treat it as the brand source of truth.

Mode default for marketing surfaces: **Persuade** (owners).

**Craft bar (structure & motion only):** [nesty.ma](https://nesty.ma/) — immersive hero, numbered service rows, zone photo cards, paced scroll reveals.  
**Never copy:** Nesty teal palette, Inter UI stack, or their invented portfolio claims. Colors, logo, copy, and proof stay **Brand DNA / PRODUCT.md**.

## Color

| Token | Value | Usage |
|-------|-------|-------|
| ink | `#0B1C2C` | Text, dark sections, wordmark |
| bone | `#F7F4EF` | Page background |
| champagne | `#C4A574` | Accents, rules, monogram, primary CTA fill |
| mist | `#E8E2D9` | Borders, muted panels |
| white | `#FFFFFF` | Cards on ink |
| success | `#2F5D50` | Occupancy / positive stats only |

Color strategy: **Restrained** (neutrals + one metal accent).

## Typography

- Display: **Cormorant Garamond** (Google Fonts) — headlines, logo feel, stat numerals
- Body / UI: **Source Sans 3**
- Tracking: display +0.04em to +0.12em on brand wordmarks (less than old Didone stacks)
- **Do not use:** Bodoni Moda, Manrope

## Components

- Buttons primary: champagne fill, ink text, 2px radius; hover sheen + slight lift
- Buttons secondary / ghost: outline on ink or bone
- Cards: bone or white, 1px mist border, no heavy shadow
- Hairline rules in champagne at 1px
- Stats: large Cormorant numerals, Source Sans 3 labels tracked
- Service paths: numbered 01–04 editorial rows (Nesty structure, GI tokens)

## Motion

- Hero: rise + champagne rule draw + optional Ken Burns on media
- Scroll: `.gi-reveal` / `.gi-reveal-media` via IntersectionObserver
- Hover: soft lift on cards/zones; sheen on champagne CTA
- Respect `prefers-reduced-motion`

## Imagery

- Prefer **real** apartment / Agadir place photos already on WP media
- Logo: `brand/logos/` + live `gi-site-icon.png`
- AI imagery only as temporary gap-fill; label if synthetic

## Logo

See `BRAND_DNA.md`. **Primary:** horizontal lockup (GI + GREATIMMOB + GESTION LOCATIVE). Monogram for dark / icon uses.

## Do not

- Teal / cyan competitor accents on `.ma`
- Purple gradients, glass glow, emoji logos
- Agency property grids as brand identity
- Fake social proof modules
- Redirecting redesign work to `.com` unless the operator asks
