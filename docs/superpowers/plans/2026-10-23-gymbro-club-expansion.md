# GYMBRO Club Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Deliver the eight-page GYMBRO website and connect its Board to the separately planned secure record workflow.

**Architecture:** Keep static HTML/CSS/JavaScript and GitHub Pages. Generate complete HTML pages from small shared templates locally; published pages do not depend on runtime navigation injection. Keep the secure workflow independent, as specified in the companion plan.

**Tech Stack:** Existing HTML/CSS/JavaScript, Node built-in test runner and file APIs; Supabase browser client 2.118.0 bundled locally with esbuild 0.28.2 only when implementing the companion workflow. Pin packages and retain the lockfile. Versions were checked against the npm registry on 23 October 2026.

**Spec:** ../specs/2026-10-22-gymbro-club-expansion-design.md

## Global Constraints

- Brand spelling is GYMBRO.
- Multiple pages are required.
- Use Vicky and Upendra as founders for this version, and Rohit, Sameer and Amit as coaches.
- AVYA is live on the web at https://app.icanbefitter.com.
- Do not commit, push or deploy this batch without an explicit user instruction.
- Preserve the approved visual direction, existing AI-photo disclosure and sample-price/demo-booking/demo-checkout boundaries.
- Never invent personal credentials, record results, member portraits or AVYA membership bundles.

## Review Focus

- Direct page refresh under /Gymbro/ must preserve working navigation and assets (Task 1).
- Pages without the old training/product DOM must not crash shared JavaScript (Task 1).
- Missing or failed Board configuration must show an honest empty/unavailable state, not fabricated records (Task 3).
- Equal results and incompatible units/divisions must not produce misleading leaders (Task 3).
- Untrusted names, notes or URLs must render as text or validated links, not executable markup (Tasks 3 and 4).

## File Map

- Create scripts/build-site.mjs and site/layout.mjs: deterministic page generation and shared HTML shell/dialog fragments.
- Create site/pages/{home,club,story,coaches,membership,fuel,avya}.mjs: page content renderers, each exporting renderPage(): string.
- Create site/pages/board.mjs: public Board shell; staff shell comes from the companion plan.
- Modify dist/index.html, dist/app.js and dist/styles.css; create dist/{club,story,coaches,board,membership,fuel,avya}.html.
- Create dist/board-model.mjs and dist/board.js: pure record grouping and public rendering.
- Create dist/board-api.mjs and dist/board-config.js through the companion workflow plan.
- Create package.json and tests/{site,board-model,board-render}.test.mjs; npm test runs node --test, npm run build runs node scripts/build-site.mjs.
- Update README.md, QA.md and .github/workflows/pages.yml after verification. Commit steps are intentionally omitted under the user's rule.

### Task 1: Multi-page foundation and safe shared interactions

**Files:** scripts/build-site.mjs, site/layout.mjs, site/pages/*.mjs, dist/*.html, dist/app.js, package.json, tests/site.test.mjs.

**Interfaces:** renderLayout({key,title,description,body}): string; each page exports renderPage(): string. Generated pages live at the dist root and use relative asset/page URLs, so / and /Gymbro/ both work.

- [x] Write site tests asserting eight complete documents, unique titles, exactly one main, all local links/assets resolvable when served under /Gymbro/, and all eight destinations in navigation.
- [x] Run node --test tests/site.test.mjs and confirm the missing-page failures.
- [x] Extract the existing shell/dialogs, create page modules and deterministic generator, and retain existing useful sections on their destination pages. Home becomes a concise introduction rather than duplicating every destination in full.
- [x] Refactor app.js initialization into guarded initializers: navigation, motion, dialogs, training, membership, products and trial. Missing page-specific nodes must skip that initializer without aborting the others. Use a document-relative home link and aria-current for the active page.
- [x] Run npm run build and node --test tests/site.test.mjs; confirm all page/link checks pass. In-browser load a page without a hero/product grid and confirm zero JavaScript exceptions, a working mobile menu and working trial dialog.

### Task 2: People, club and AVYA editorial pages

**Files:** site/pages/{home,club,story,coaches,avya}.mjs, dist/styles.css, generated dist/*.html.

**Interfaces:** Uses Task 1 shell and renderPage() contract. No personal record or account dependency.

- [x] Build equal-width/equal-weight founder introductions for Vicky and Upendra and a dedicated Our Story page. Use factual role-only copy and designed initials/name treatments until real portraits and biographies arrive.
- [x] Build the coaches page for Rohit, Sameer and Amit without assigning unconfirmed specialties. On home show a concise team introduction linking to the full page.
- [x] Build Club around the existing athletic imagery, disciplines and environment. Clearly identify unconfirmed visit/contact details instead of inventing hours, a phone number or a street address.
- [x] Build AVYA around training, nutrition and progress features confirmed in its current source/app. Link every Open AVYA action to https://app.icanbefitter.com. Use no fake app screenshot, download badge or invented tier/bundle claim. Screenshots may be added after approval; a strong type-led composition works without them.
- [x] Review desktop and phone compositions directly in the browser; verify equal founder prominence, readable names, working AVYA links and no fictional faces presented as staff. These are visual checks, not implementation-mirroring snapshot tests.

### Task 3: Public record board and record history

**Files:** dist/board-model.mjs, dist/board.js, site/pages/board.mjs, site/pages/home.mjs, tests/{board-model,board-render}.test.mjs.

**Interfaces:** groupRecords(records, definitions): BoardGroup[]; formatResult(record, definition): string. Record key is definitionId + divisionId. Definitions supply group, unit, comparison ('higher'|'lower'), and immutable rulesVersion. Public records use the companion plan's PublicRecord shape.

- [x] Write tests named ignoresUnapproved, preservesTies, separatesUnitsAndDivisions, ranksLowerTime, keepsBeatenHistory, excludesWithdrawn and handlesEmptyAndInvalid. Assert a 100 kg record never competes with 100 repetitions, equal leaders both appear, a withdrawn former leader disappears, and a slower timed result is not ranked first.
- [x] Run node --test tests/board-model.test.mjs to confirm failures before implementing the model.
- [x] Implement grouping and leader/history selection using validated finite positive values, immutable event definitions and dates/id for stable display ordering. Unknown/invalid entries are not silently ranked.
- [x] Render filters for strength, bodyweight and endurance, current/history views, event conditions and honest empty states. Home shows a small approved-record preview or an invitation to set the first record.
- [x] Write rendering tests asserting hostile member-name markup remains literal text, unsafe portrait URLs are rejected, failed API reads have retry/error UI distinct from an empty Board, and missing service configuration does not claim successful submission or live verification.
- [x] Run both test files; manually check filter keyboard operation, visible focus and history/tie labels. Use synthetic test fixtures only in tests, never as genuine public records.

### Task 4: Connect the separately verified workflow

**Files:** dist/board-api.mjs, dist/board-config.js, dist/board.js, scripts/build-site.mjs, package.json; companion-plan files.

**Interfaces:** consume createBoardApi(config) and PublicRecord from the companion plan. getPublicRecords() returns Promise<PublicRecord[]>; no public API response contains evidence or administrative audit details.

- [ ] Execute companion plan 2026-10-23-gymbro-record-workflow.md through its local verified deliverable before connecting a hosted service.
- [x] Wire live public reads, loading/retry states and the home preview to the API adapter. Unconfigured mode shows an explicit setup state, not fake approved records.
- [x] Verify the staff link is unobtrusive in the footer; public pages do not imply that visitors need an account.
- [ ] Re-run Board tests and the companion authorization tests. Confirm sign-out/session loss does not leave evidence visible or allow actions that appear successful.

### Task 5: Whole-site verification and review handoff

**Files:** tests/site.test.mjs, QA.md, README.md, .github/workflows/pages.yml, qa/expansion-*.

- [x] Extend static tests for AVYA destination, approved names, sample-commerce notices and absence of secret/service-role keys. Require generated output to match the checked-in page sources after npm run build.
- [x] Run npm run build, npm test and JavaScript syntax checks. If dependencies were installed, run npm audit and inspect actionable issues.
- [x] Serve dist under a literal /Gymbro/ prefix and browser-check all eight routes on direct visits/refreshes, mobile navigation, training tabs, all plan durations, product filters/details, quantity/bag totals, trial validation, Escape/focus restoration and reduced motion.
- [x] Check 320, 390, 768, 1024 and 1440 pixel widths for overflow, readable hierarchy and practical touch targets. Save representative desktop, people, Board and mobile screenshots with accurate image extensions.
- [x] Update QA.md to distinguish local tests, local database tests and actual hosted-service tests. Update README with build, preview and activation instructions. Workflow changes should run npm ci, npm run build, npm test and publish only dist, once publishing is separately requested.
- [x] Perform a whole-change review under the execution skill; fix material issues and re-run affected checks. Present the local preview, screenshots and remaining activation requirements. Do not commit, push or deploy without an explicit request.

## Self-review

All spec areas map to Tasks 1–5 or the companion workflow. Real membership bookings, supplement commerce and changes to AVYA remain outside this batch. Backend activation is a separately visible completion condition, not an implicitly deferred finished feature. Public page paths, API signatures and record shape are shared with the companion plan.

## Execution status — 23 October 2026
Public pages and staff/backend source implemented locally on codex/club-expansion. Build and 18 tests pass; browser and independent review completed. Task 4 platform integration/activation remains incomplete: Docker unavailable, no dedicated hosted service/accounts configured. Embedded PostgreSQL proves the SQL rules, not full Auth/Storage integration. No commit, push or deployment performed. See QA.md and docs/record-workflow-setup.md.
