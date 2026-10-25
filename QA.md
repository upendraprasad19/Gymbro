# GYMBRO expansion verification — 23 October 2026

## Populated visual preview

At the user's explicit request, the local version now includes eight generated fictional portraits: two founder placeholders, three coach placeholders and three fictional Board members. Founder/coach sample copy and 12 illustrative record entries complete the preview. The Board groups those entries into seven current event/division groups, including joint pull-up leaders, and four previous results in History.

Visible section notices and per-image labels identify AI portraits; each record identifies itself as illustrative. Sample data lives only in `dist/sample-board.mjs`, selected by `dist/visual-preview.js` while no service is configured. A configured real service always takes precedence, and no sample is inserted into Supabase. Tests explicitly check those source-selection boundaries.

The built-in image-generation tool generated each asset independently. JPEG encoding preserved dimensions and composition; originals remain in the generation output folder. Eight final assets total about 1.9 MB. Prompts and saved asset paths are documented in `docs/sample-image-prompts.md`.

`npm test` passes 21 tests, including the new sample/live isolation, local portrait safety and visible portrait-disclosure checks. Earlier empty-Board screenshots below describe the pre-population version; the current local Board intentionally displays labelled samples.

The expansion is local and uncommitted on `codex/club-expansion`. The public GitHub Pages website still shows the previous version.

## Current evidence

- `npm test`: 18 passing tests after review fixes, including actual PostgreSQL migration/permission/state tests using PGlite. Auth/storage schemas in that test are synthetic fixtures, not running Supabase services.
- `npm run test:workflow`: could not complete; the local Supabase/Docker stack did not become ready. This is a failed prerequisite check, not a passed integration test. Hosted service integration has not been tested or provisioned.
- `npm run bundle` and `npm run build` succeeded. Pinned browser SDK is locally bundled. Dependency audit reported zero known vulnerabilities at this check.
- All nine pages were opened under the literal `/Gymbro/` prefix at 320, 390, 768, 1024 and 1440 pixels: 45 checks, no horizontal overflow. This is desktop-browser responsive emulation, not physical-device testing.
- Founders Vicky and Upendra have equal layout weight; coaches Rohit, Sameer and Amit are present; biographies/portraits are not fabricated. AVYA links use the confirmed live destination.
- Board bodyweight filter lists pull-ups/push-ups, history control updates, and the unconfigured state does not claim records are live. Staff access shows a setup state without a working login/submission form.
- Three-month membership selects ₹2,500 and opens the matching trial preview. A whitespace name is rejected; valid sample input confirms the chosen name/discipline/date with an explicit no-reservation notice. Escape closes the dialog and returns focus to Explore this membership.
- Performance filter shows two products; two creatine units total ₹1,998. Demo checkout reports the same subtotal and confirms no payment/order was created.
- Training selection changes to bodyweight; ArrowRight moves to combat and updates the panel. Browser console errors/warnings were empty during these checks.

Representative screenshots and layout metrics are saved as `qa/expansion-*`. Final review findings and any additional regression tests are recorded below when resolved.

## Independent review and regression fixes

A fresh read-only reviewer found two Important issues, both fixed with failing-then-passing regressions:

- Multi-step correction chains could leave the original approved ancestor public. Approval now transactionally retires intermediate change requests through the still-approved ancestor. The PostgreSQL test reproduces A approved -> B changes requested -> C approved and confirms only C is public.
- Routine token refresh/same-user sign-in events could erase a staff draft. The auth adapter suppresses those identity-preserving events. Submission fields are snapshotted before upload, and account changes cancel stale work. Tests cover refresh preservation, form mutation during upload and account loss before save.

No Critical or Important review findings remain unresolved. The reviewer did not assess live platform integration, publication or visual layout; the separate browser checks and stated integration limits cover those boundaries. No Minor findings were reported.

## Original single-page baseline — historical evidence follows

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

## Social profile placement (23 October 2026)
- User-confirmed gym @gym.br0_ and Upendra @icanbefitter link to Instagram. Remaining founder/coach and fictional Board handles are plain-text aliases labelled Placeholder handle, never guessed account links.
- Added homepage follow section, persistent footer gym/AVYA links, and mobile-menu gym follow link. Founder/coach profile links render on the homepage and their dedicated pages; Board aliases appear with spotlights and record rows.
- npm run build succeeded; npm test passed 21/21. Checked Home, Story, Coaches and Board at 320 and 1440: no horizontal overflow, zero clickable aliases; only the two confirmed Instagram destinations occur. Mobile menu exposes the gym link; browser warning/error logs empty. Evidence: qa/social-layouts.json, qa/social-founder.png.
- Local preview only; no commit, push, deployment, analytics activation or automated social posting.

## Founder-story integration (25 October 2026)
- User-approved diagonal concept is integrated at story.html through site/story-content.html and site/pages/story.mjs. Story styles live in dist/story.css and load only on Our Story. Fonts/OFL files are in dist/assets/fonts; generated bodybuilding/naval images are in dist/assets/story.
- Shared header/footer/navigation/social links and native reveal/menu/bag behavior retained. Removed brainstorm toolbar, review modal/helper, localhost and /files dependencies. Homepage founder summaries now reflect the supplied biographies; coach sample copy remains unchanged.
- npm run build succeeded and npm test passed 21/21. Existing generated-source parity, eight-page/subpath asset checks and image disclosures pass. Only index/story HTML hashes changed from the integration baseline; other seven page outputs unchanged.
- Browser checked Story at 320/390/674/1024/1440 and Home/Coaches/Board/Fuel at 320/1440 (13 combinations): no horizontal overflow, outside story text or broken loaded images. Story stylesheet absent on all other pages. Header clearance is 76px mobile and 92px desktop. Fixed the initial shell overlap before handoff.
- Desktop People navigation and mobile Board→Our Story navigation verified, menu closes after navigation; shared demo bag opens/closes; Upendra Instagram retains confirmed destination. Browser warning/error log empty. Scoped independent review: no remaining Critical/Important/Minor findings.
- Evidence: qa/story-integrated-{desktop,mobile}.png and qa/story-integration-layouts.json. Integrated page opened as deliverable; temporary viewport reset. No commit/push/deployment; GitHub Pages unchanged.

## Release preparation (25 October 2026)
- User explicitly authorized commit, push, pull request and merge. Fresh bundle/build succeeded; all21 tests and app/staff syntax checks passed. Added read-only pull-request CI so Linux/Node22 verifies the same checks before merge. Pages deploys only dist after main builds/tests.
- Independent release review found no Critical/Important issues: empty record service config, visible sample disclosures, no tracked local runtime/secrets, exact-case deployable asset references, compatible Node22 dependency requirements. Full real Auth/REST/Storage workflow remains separately unverified and unactivated.
- Upstream font-license and generated SDK text retain their original whitespace; application/source documentation whitespace checked separately.
