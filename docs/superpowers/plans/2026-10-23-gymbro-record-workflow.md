# GYMBRO Record Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement persistent coach submissions and Upendra-only record publication with private evidence and an auditable history.

**Architecture:** Recommend a dedicated Supabase project for GYMBRO, separate from the two existing connected projects (AVYA and ICANBEFITTER website). Develop and test locally first. Publish approved safe fields into a public projection; submissions, evidence, roles and audit data remain private. The static website calls authenticated APIs using a public publishable key, never an administrative secret.

**Tech Stack:** Supabase Postgres/Auth/Storage, supabase-js 2.118.0, CLI 2.121.0, esbuild 0.28.2, Node tests. Pin versions and keep package-lock.json. Docker is installed but its engine was not running during planning.

**Spec:** ../specs/2026-10-22-gymbro-club-expansion-design.md

## Global Constraints

- Designated coaches submit records; Upendra approves them before public display.
- No secrets or private evidence belong in the public repository.
- Do not commit, push or deploy this batch without an explicit user instruction.
- Do not change either existing Supabase project's schema, accounts or settings for GYMBRO.
- No project creation, paid upgrade, account invitations or email messages before the necessary explicit authorization. Local fixtures use no real people/contact information.

## Review Focus

- Authenticated but undesignated users cannot submit, review or read evidence (Task 1).
- Coaches cannot approve their own entry by bypassing UI or editing metadata (Task 1).
- Public readers cannot retrieve pending/rejected entries or evidence through alternate queries (Task 1).
- Corrections, double approvals and concurrent reviews must preserve an accurate projection/audit (Task 1).
- Expired sessions, failed uploads and retried submissions cannot produce a false success (Task 2).

## File Map and Contracts

- supabase/config.toml and supabase/migrations/<CLI-generated-timestamp>_gymbro_records.sql: local configuration and reviewed schema.
- supabase/tests/record_permissions.sql and tests/workflow.integration.test.mjs: real permission/state-transition tests.
- dist/board-api.mjs: createBoardApi({url,publishableKey}) with getPublicRecords(), getStaffContext(), submitRecord(input), listSubmissions(), reviewRecord({id,version,decision,reason,membershipVerified}), uploadEvidence(file), signIn(email), signOut(). Methods return Promises and reject failed operations with safe user-facing errors; uploadEvidence returns a private evidencePath, submit/review return {id,state,version}.
- dist/board-config.js: public configuration only; unconfigured by default. dist/vendor/supabase.js is an exact-version locally bundled browser dependency.
- dist/staff.js and site/pages/staff.mjs -> dist/staff.html: sign-in, coach form and approver review queue.
- scripts/{bundle-client,run-workflow-tests}.mjs and docs/record-workflow-setup.md: reproducible bundle/tests and activation runbook.

PublicRecord = {id,definitionId,divisionId,memberName,portraitUrl|null,value,achievedOn,approvedAt}. Public event definitions include {id,group,label,unit,comparison,rules,rulesVersion,active}. Private submission adds evidencePath, coachId, state, version, reviewReason and timestamps. State is pending, changes_requested, rejected, approved or withdrawn. An approved correction creates a new pending revision; the existing approved revision remains visible until replacement approval, and both audit entries are retained.

SubmitRecordInput = {definitionId,divisionId,memberName,portraitUrl|null,value,achievedOn,evidencePath,idempotencyKey,supersedesId|null}. Review decision is approve, reject, request_changes or withdraw; approve requires membershipVerified:true. Staff context is null for an undesignated account or {userId,role:'coach'|'approver'} for designated staff. Names are trimmed, required and at most 80 characters; achievement dates use YYYY-MM-DD and cannot exceed today's date in Asia/Kolkata. Evidence defaults are a 25 MiB limit and JPEG/PNG/WebP/MP4/WebM files, with filename/content validation; these are builder choices that may be adjusted before activation. Signed evidence links expire after 60 seconds.

### Task 1: Persisted model and server-enforced permissions

- [ ] Inspect current Supabase changelog/docs again at execution. Discover CLI commands with --help; install pinned development tooling only after execution approval. Start the existing local Docker environment if available, then initialize a new local Supabase setup. If Docker cannot run, report that limitation and do not label SQL tests passed.
- [ ] Generate the migration stub using supabase migration new gymbro_records; use its returned filename. Implement private staff roles, versioned definitions/divisions, submissions, private evidence and append-only audit; expose only active definitions and approved PublicRecord projection. Roles come from server-owned tables, never user_metadata or browser flags.
- [ ] Define transactional submit/review/correction/withdrawal functions with the adapter contracts above. Check active role and ownership inside every privileged action. Enforce positive finite results, known definition/unit/division, achievable date, required private evidence and explicit owner membership verification at approval. Require expected version to prevent stale concurrent review; duplicate idempotency keys return the original submission instead of duplicating it.
- [ ] Apply row/column access, revoke public default function execution, fix search_path and restrict privileged helpers to a non-exposed schema. Any SECURITY DEFINER helper must have explicit auth/role checks, minimal grants and security-advisor review. Coaches may see their own submissions; only approver sees the review queue. No direct browser writes to roles, audit or public projection.
- [ ] Evidence uploads use a private bucket scoped to the submitting staff account and immutable unique paths; reject unsupported types/oversized files and do not use public URLs. Access is available only to the author and approver; create signed URLs only after server-enforced access checks. Optional approved portraits use separately approved public assets, never the evidence bucket.
- [ ] Before implementing the permissive policies/RPCs, write integration cases for anon, unrelated authenticated user, coach A, coach B and approver. Assert denied cross-coach reads, metadata-based role spoofing, direct approvals/public writes, raw private queries, evidence access and role escalation. Confirm expected initial test failures.
- [ ] Add successful submit -> pending -> approve -> public read; changes requested -> correction -> approve; reject; tied records; withdrawal; approved revision replacement; concurrent stale review; duplicate retry; and revoked-role cases. Apply schema/policies locally and run the complete suite against real local Auth/REST/Storage, not only mocked JS.
- [ ] Run security advisors where supported and inspect every warning. Generate/reconcile the final migration using the installed CLI's supported workflow, verify a clean reset reproduces the schema, and re-run all permission tests. Do not store local JWTs or administrative keys in test reports.

### Task 2: Staff UI and public API adapter

- [ ] Write adapter tests for missing configuration, network denial, session expiry, duplicate submission retry and evidence upload failure; confirm failures before implementation.
- [ ] Implement createBoardApi(config) with the exact contracts above using the pinned browser SDK. Sign-in uses invitation-only email magic links with shouldCreateUser:false and a configured staff.html redirect; no UI self-registration or role selector. Do not send invitations or sign-in emails during unauthorized testing.
- [ ] Build staff.html with a clear unconfigured state, sign-in state, coach form/submission history and approver queue. Rendering privileges are for usability; the server tests prove authorization. Display evidence only after authorized access, clear sensitive UI on sign-out, and render member names/notes as text.
- [ ] Disable submit/review controls during requests, retain recoverable form content on network errors, and announce success only after a confirmed persisted response. A failed evidence upload prevents submission. A stale review prompts refresh rather than overwriting another decision.
- [ ] Bundle the pinned SDK locally using esbuild; include licence information and commit no node_modules. Run adapter tests and keyboard/browser checks using the local service and synthetic fixture identities. Verify public projection reads through the main site's Board model.

### Task 3: Hosted activation and honest handoff

- [ ] Write docs/record-workflow-setup.md with dedicated project recommendation, region recommendation ap-south-1, evidence limits, redirects, private bucket policies, owner/coach role provisioning and a rollback procedure. Do not use the two unrelated live projects as test environments.
- [ ] Inspect organization billing/project eligibility before requesting project creation; do not assume a third free project is available. Official pricing currently limits free active projects to two; paid terms must be verified at activation. Explain the actual account/cost requirements before any charge or provisioning action.
- [ ] Prepare all local code, migration, test evidence and the exact proposed service setup for review first. Activation requires user authorization for project/account setup plus Upendra's and designated coaches' actual sign-in emails. Do not guess addresses or send unsolicited invitations.
- [ ] After authorization, create the isolated project, inspect its schema, apply the reviewed migration, configure allowed redirects and email delivery, provision staff and publish only the public URL/publishable key in board-config.js. Record service identifiers in local setup documentation without secret values.
- [ ] With authorized test identities, verify coach submission, private evidence, approver publication, pending invisibility, denied unauthorized access, persistence after refresh and correction/withdrawal against the hosted service. Report any email-delivery or service limit explicitly.
- [ ] If activation is awaiting setup, mark the local implementation verified only to the level actually tested and keep public UI in honest setup/empty state. Do not call the real workflow complete or publish an administrative demo as a working service. No Git commit/push/site deployment without explicit user instruction.

## Verified references and planning limits

- https://supabase.com/docs/guides/database/postgres/row-level-security — exposed-table RLS, unsafe user metadata, safe views.
- https://supabase.com/docs/guides/auth/auth-email-passwordless — invitation-only sign-in via shouldCreateUser:false.
- https://supabase.com/docs/guides/storage/security/access-control — private storage policies.
- https://supabase.com/pricing — confirm project eligibility/cost at activation, not an assumed free slot.
- https://supabase.com/changelog.md — checked 23 October 2026; upcoming legacy TLS cipher removal does not justify weakening browser transport requirements.

Self-review: covers private/public separation, evidence, staff roles, every record transition, persistence and conditional hosted activation. Public rendering belongs to the companion site plan; no AVYA integration or gym-member account system is included.

## Execution status — 23 October 2026
SQL migration, isolated public/private model, browser adapter and staff UI implemented. Full embedded PostgreSQL test and adapter/state tests pass; independent review fixes verified RED->GREEN. Docker startup did not become ready, and npm run test:workflow failed its prerequisite check, so real local/hosted Supabase integration remains unverified. Hosted activation is awaiting organization/cost choice, explicit provisioning authorization and actual staff emails. Existing organization Claude_ICANBEFITTER was verified as free with two active projects. No unrelated project changed.
