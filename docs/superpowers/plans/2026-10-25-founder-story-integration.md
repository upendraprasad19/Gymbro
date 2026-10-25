# Founder Story Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Make the reviewed founder concept the actual local Our Story page.

**Architecture:** Extract the concept's story content into editable HTML, render through the existing page generator and shared shell. Namespace its CSS/classes and use the existing reveal script rather than importing mockup infrastructure.

**Tech Stack:** Buildless HTML/CSS, ESM generator, existing Node tests, native browser verification.

**Spec:** `docs/superpowers/specs/2026-10-25-founder-story-integration.md`

## Global Constraints
- Work in existing `codex/club-expansion` checkout; preserve pre-existing changes.
- Relative deployable URLs beneath `/Gymbro/`; no companion helper/localhost dependencies.
- User-provided facts and visible fictional-image disclosures; confirmed Instagram destinations only.
- Local integration only: no commit, push or deployment.

## Review Focus
- Story CSS must not restyle the shared shell, dialogs or other pages.
- Mobile crops must preserve faces; text stays outside clipped shapes and within the viewport.
- Native sticky header/menu and reveal script must function on the new page.
- All fonts, licenses and new images must be in the deployed directory.
- Homepage founder summaries and story must agree without changing coach placeholders.

### Task 1: Integrate the founder page and assets
**Files:** `site/pages/story.mjs`, `site/story-content.html`, `dist/story.css`, `site/layout.mjs`, `site/people.mjs`, `site/fragments.mjs`, `dist/assets/story/`, `dist/assets/fonts/`.
**Interfaces:** consumes the reviewed v4 concept; produces `renderPage(): string` using the existing layout contract.
- [x] Snapshot the editable files before changes for delta review.
- [x] Extract and namespace the approved content/CSS; omit all companion UI/scripts and use existing reveals.
- [x] Copy images/fonts/licenses to deployable paths; add story-only CSS through layout.
- [x] Update founder summaries/disclosure without changing coaches.
- [x] Build and run existing `npm test` checks. Expected: generated parity, eight-page/subpath, disclosures and all existing workflow tests pass.

### Task 2: Verify, review and show the integrated page
**Files:** QA evidence under `qa/`, `QA.md`.
**Interfaces:** consumes the actual generated story page and site shell.
- [x] Check output for companion/localhost references, links and assets. Expected: no leaked companion infrastructure.
- [x] Check Story at 320/390/674/1024/1440 and representative Home/Coaches/Board/Fuel. Expected: no horizontal overflow, broken media, warnings or navigation regressions.
- [x] Check People navigation, mobile menu, confirmed social link and story anchors.
- [x] Obtain one independent integration-delta review; fix material findings and rerun affected checks.
- [x] Show the actual integrated page and report local-only status.

## Execution rulings
- User has explicitly requested integration of the reviewed result; proceed inline without another plan-approval gate.
- This is reversible presentation/content integration. Follow the developer instruction against implementation-mirroring tests: use the existing meaningful tests and browser checks instead of adding assertions that merely restate copy/classes.
- The branch already contains substantial uncommitted expansion work. Review the integration against retained before-snapshots, not the entire pre-existing diff, and do not create a commit as a bookkeeping substitute.
