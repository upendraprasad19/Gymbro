# Activate the GYMBRO record service

## Current state

The site and staff interface are implemented locally. The public configuration is deliberately empty. No hosted GYMBRO service, staff accounts, invitations or live record entries have been created. Embedded PostgreSQL tests verify the migration's role checks, publication, corrections, withdrawal and private evidence policies; they simulate Supabase's auth/storage schemas and do not verify the actual Auth or Storage services.

The separate `npm run test:workflow` suite exercises real local Supabase Auth, REST and Storage when Docker is running. It refuses non-local URLs and uses disposable synthetic identities. During this implementation the Docker engine did not become ready, so this suite could not be completed. Hosted integration remains unverified.

## Hosting recommendation

Keep the public website on GitHub Pages. Use a separate Supabase project named GYMBRO Records, preferably ap-south-1, for record data, private evidence and staff sign-in. Do not link this checkout to the AVYA or ICANBEFITTER Website projects. Both already exist and are unrelated live services.

Before creating a project, inspect the organization plan and project allowance. Supabase's published free plan currently allows two active projects; this account already has two connected active projects, but its billing tier has not been verified. A third project may require a different eligible organization or paid capacity. Confirm the actual cost and obtain authorization before provisioning or changing billing. Source: https://supabase.com/pricing.

## Local verification

1. Run `npm ci`, `npm run bundle`, `npm run build` and `npm test`.
2. Start the installed Docker engine. Inspect `npx supabase start --help` before launching the isolated stack. The project id is `gymbro-expansion` and only public/graphql_public are exposed.
3. Start/reset the local stack using the installed CLI's documented commands. The migration must apply without errors. No staff or results are seeded.
4. Run `npm run test:workflow`. This reads local CLI credentials into process memory, never prints them and never uses a remote project. It must pass before claiming local platform integration is verified.
5. Keep local URL/key changes out of the published board-config.js. Unit/SQL tests do not require a configured public site.

## Hosted activation checklist

Obtain authorization for the dedicated project's actual billing terms and creation, and obtain the intended owner and coach email addresses. Do not guess addresses or send invitations without explicit authorization.

After approval:

1. Create the isolated project and inspect its current schema/settings before applying `supabase/migrations/20261022200249_gymbro_records.sql`. Never apply this migration to either existing connected project.
2. Disable public and anonymous sign-up. Configure Auth's site URL and exact redirect allow-list to `https://upendraprasad19.github.io/Gymbro/staff.html` plus any explicitly intended test URL. Configure working email delivery; verify the chosen provider's limits. The staff page uses invitation-only magic-link sign-in with `shouldCreateUser:false`.
3. Create/invite approved accounts only with authorization. Insert the actual Auth UUIDs into `gymbro_private.staff`, using role `approver` for Upendra and `coach` for designated coaches. Role assignments happen through privileged administration, never user-editable metadata or public forms.
4. Confirm event rules and divisions with the owner. Five lifting/bodyweight definitions are seeded inactive. Set precise equipment, technique, range-of-motion, rest/time and division conditions before setting `active=true`. Add a versioned endurance event once its equipment, distance and timing are agreed. Different units/conditions require different definition IDs. Used rules are immutable; create a new event version when conditions change.
5. Keep `record-evidence` private with its migration policies: staff uploads to their UUID folder, no staff overwrites/deletes, author/approver access only. Maximum file size is 25 MiB; JPEG/PNG/WebP/MP4/WebM only. Browser checks inspect file signatures; Storage enforces bucket MIME/size restrictions. Evidence downloads use short-lived signed attachment links; no evidence is embedded as public media. This is not a malware-scanning service.
6. Put only the project's public URL and publishable key into `dist/board-config.js`. Never include a service-role/admin key in dist, Git history, screenshots or reports. Bundle the pinned client locally with `npm run bundle`.
7. Test actual staff sign-in, submission, approval, rejection, correction, withdrawal, persistence after refresh, stale review, revoked staff, private evidence and pending invisibility. Run security advisors and resolve material findings. Invite/send test emails only as authorized.
8. Request the separately required commit/push/publication instruction after showing the locally verified result. The GitHub Pages workflow publishes only dist.

## Records and operations

- Current leaders and ties are computed within an event definition and division; beaten approved results remain in history.
- A corrected approved record stays public until the new revision is approved. Approval withdraws/replaces the old revision transactionally and retains the private audit trail.
- Withdrawing requires a reason. Rejection or a change request also requires a reason. Approval requires the owner's confirmation of membership eligibility and event/evidence checks.
- Disable a staff role immediately by setting its `active=false`; every privileged operation reads that server-owned role. Revoke their sessions through Auth as part of offboarding.
- Do not delete evidence used by published or disputed records. Define retention/consent practices with the owner before collecting real member media. Portraits require separate public approval and are not automatically copied from evidence.
- If a deployment needs rollback, first restore empty public configuration/previous website version. Keep the data project and audit history; do not destroy member records to roll back the UI. Suspend staff access or disable affected event definitions while investigating.
