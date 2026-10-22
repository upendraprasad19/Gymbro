# GYMBRO — interactive concept preview

**Website:** [upendraprasad19.github.io/Gymbro](https://upendraprasad19.github.io/Gymbro/)

**Repository:** [upendraprasad19/Gymbro](https://github.com/upendraprasad19/Gymbro)

Buildless static site. Serve `dist/` with any static web server. No installation or build is required. `node --check dist/app.js` checks script syntax.

Features: training tabs with keyboard navigation; membership duration and savings selector; supplement filtering and product dialogs; quantity controls and a tab-local demo bag; checkout demonstration; a validated trial form whose entries are never transmitted; responsive navigation, native modal focus management, reduced-motion support and scroll reveals.

All images are AI concept imagery. Prices come from the supplied prototype and are explicitly labelled as unconfirmed samples. No real booking, external contact, account, order, payment or persistence is implemented.

## Art direction

- Graphite, warm off-white and cobalt; Manrope with IBM Plex Mono.
- Full-bleed deadlift hero with oversized GYMBRO typography.
- Asymmetric editorial sections and sparse technical details.
- Entrance animation, scroll reveals, photographic depth and precise hover transitions; reduced motion disables these effects.

## Assets

- Hero, training and product photographs: generated with the built-in image generation tool for this preview, then JPEG-encoded for faster loading without cropping or retouching. Prompt briefs: industrial athletic photographs of a deadlift, ring support, heavy-bag boxing and sled push; neutral seamless product photographs with restrained cobalt accents, exact category names and explicit CONCEPT markings. No health or authenticity claims appear on the packaging.
- Arena photograph: exported unchanged from the user-supplied HTML prototype; confirmed by the user as a sample AI image.
- Font files and their licenses: Manrope and IBM Plex Mono, obtained from Google Fonts.

## Publication

The public GitHub repository is named **Gymbro**. GitHub Pages publishes only `dist/` through `.github/workflows/pages.yml`. Changes to website files on `main` automatically update the published preview after the deployment succeeds. Documentation-only changes do not trigger publication. The workflow can also be run manually from the repository's Actions tab.

Local Sites configuration and the convenience ZIP archive are excluded from Git. No account tokens, credentials or environment files belong in this repository.

## Preview

![GYMBRO desktop preview](qa/desktop.jpg)
