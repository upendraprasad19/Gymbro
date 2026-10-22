# GYMBRO preview verification

Verified on 22 October 2026 using the live local site in the Codex in-app browser on Windows. This is responsive browser verification, not testing on physical phones.

## Passed

- JavaScript syntax check with Node.
- Asset and internal-link audit: no missing referenced assets, broken anchor targets, duplicate HTML IDs or occurrences of the incorrect GIMBRO spelling in delivered site files.
- All delivered HTML, CSS and JavaScript reference local assets; no external service endpoints or form transmissions.
- No horizontal overflow at requested browser viewports 320×740, 390×844, 768×1024, 1024×768 and 1440×900.
- Training tab selection updates imagery, title and description. Arrow-key navigation moves selection; panel labelling follows the active tab.
- Three-month plan displays ₹2,500, ₹833 monthly equivalent and ₹1,100 savings against three individual ₹1,200 months. Annual default displays ₹8,000 and ₹6,400 savings.
- Protein filter shows one product; performance shows two; all restores three.
- Product dialog, quantities and bag count work. Two whey units total ₹10,998. Two creatine units plus one pre-workout total ₹3,897. Removal returns the bag to its empty state.
- Demo checkout explains that no real order or payment is created and preserves the session bag.
- Trial form rejects an empty/whitespace name and requires a valid preferred date. Valid sample input displays the chosen name, discipline and day without transmission.
- Escape dismisses dialogs and returns focus to the opener. Mobile menu Escape closes it and restores focus to its toggle. Mobile trial dialog is usable within the viewport.
- Final browser console warning/error log is empty.
- Generated image encoding reduces the complete eight-image set to approximately 1.78 MB; no image crop or retouching is applied to saved assets.

## Review artifacts

`qa/desktop.jpg`, `qa/mobile.jpg`, `qa/fuel.jpg` and `qa/layout-checks.json` capture the local result and responsive checks. `qa/github-pages-live.jpg` records the published website.

## Publication target

The user approved the public GitHub repository **upendraprasad19/Gymbro** and its GitHub Pages preview on 22 October 2026. The Pages workflow checks JavaScript syntax and publishes only `dist/`. Deployment status is available in the repository's Actions tab. The separate local Sites configuration is excluded from the GitHub repository, and no credentials are saved to project files.

## Published verification

- Public repository: https://github.com/upendraprasad19/Gymbro
- Published preview: https://upendraprasad19.github.io/Gymbro/
- First deployed commit: `e02cd204c85a58330aa0ddd42c48e3c2a91d97f3`.
- GitHub Actions run `39824862906` completed successfully.
- Published page, application script and deadlift image returned HTTP 200.
- Browser verification confirmed product details and a one-unit whey bag subtotal of ₹5,499 on the hosted site; browser console error/warning log was empty.
- The site is still an interactive concept: no real bookings, orders or payments.
