# GYMBRO club website expansion

Status: approved by the user on 23 October 2026. Proceed to implementation planning; commits, pushes, deployment and service provisioning require their own authorization.

## Purpose

Expand the current single-page GYMBRO concept into a complete club website. Visitors should understand the gym, meet the people behind it, discover its coaches, see genuine gym records, explore membership and supplements, and discover AVYA as a live web app.

The existing visual direction remains: XNRGY is the main reference, with The Performance Lab informing precise technical details. Preserve the cinematic deadlifting hero, strong typography, industrial palette and restrained cobalt accents. The user's concern about generic AI-looking design remains a central constraint.

## Confirmed decisions

- Brand spelling is GYMBRO.
- Multiple pages are required.
- Use Vicky and Upendra as founders for this version, and Rohit, Sameer and Amit as coaches. These names are approved; detailed biographies, specialties and competition credentials are not verified by that approval.
- The Board recognizes past, present and future GYMBRO members who set gym-level records.
- Include squat, bench press, deadlift, pull-up, push-up and endurance records. Exact endurance events and record divisions remain configurable.
- Designated coaches submit records; Upendra approves them before public display.
- AVYA is live on the web at https://app.icanbefitter.com, confirmed by the user. Promote AVYA with this destination. Do not infer app-store availability.
- Existing prototype photos are AI samples. Generated portraits must not be presented as actual founders, coaches or members.
- Current repository is https://github.com/upendraprasad19/Gymbro and public site is https://upendraprasad19.github.io/Gymbro/.
- Do not commit, push or deploy this batch without an explicit user instruction.

## Proposed public pages

The user approved the following page and navigation proposal as part of this brief.

1. Home: the deadlifting hero, training overview, equal founder introductions, coach preview, current records, membership/fuel pathways and an AVYA feature.
2. The Club: facilities, training disciplines, the gym environment and visit information. Publish practical details only when confirmed.
3. Our Story: Vicky and Upendra receive equal visual prominence. Use short introductions based on their founder role until factual biographies are approved.
4. Coaches: Rohit, Sameer and Amit, with space for approved specialties, portraits and short biographies. Do not restore unconfirmed achievements from the original HTML.
5. The Board: records grouped by strength, bodyweight and endurance, with current holders and a browsable record history.
6. Membership: existing concept plans, FAQs and trial interaction. Prices and submissions retain their concept/demo status until real commercial details and a booking destination are supplied.
7. Fuel: existing supplement catalogue and its demo product/bag interaction. Real payment, stock and fulfilment are outside this expansion.
8. AVYA: explain how the live app supports training, nutrition and progress tracking, using features checked against the current app/source and approved screenshots. Main action is Open AVYA.

Keep desktop navigation compact: Club, People (Our Story and Coaches), The Board, Fuel and AVYA, with a prominent Membership action and the wordmark linking home. Mobile navigation exposes the same destinations clearly. Every page has a useful footer and consistent navigation.

## Composition and people

Use editorial sections, substantial photography and clear type hierarchy. Avoid a long sequence of interchangeable card grids. Give each page a distinct composition while retaining a coherent visual system.

Founders appear together with equal weight. Coaches have a separate presentation. Until actual portraits are approved, use designed name/initial treatments rather than fictional faces. The supplied prototype remains a content reference rather than a source of verified personal claims.

Home shows a concise introduction to each destination; detailed content lives on the destination page. AVYA promotion should feel relevant to a member's routine and link to its own live product without implying a bundled membership benefit.

## Board behaviour

This is a record board, not a monthly popularity or consistency spotlight. No invented record holders, results, verification badges or member stories may be published as genuine.

Each record stores a member name, optional approved portrait, event, result and unit, event-specific conditions, category/division if applicable, date achieved, evidence reference, submitting coach and approval state. Membership eligibility is checked by the approving person; public visitors do not need a member account.

Record definitions must describe how attempts are compared: greater weight/repetitions/distance wins where appropriate; lower elapsed time wins for timed events. Bodyweight, equipment, range-of-motion and other material conditions belong to the event definition. Do not automatically compare unlike events or units.

Recommended defaults, left to the builder to refine in the plan:

- Show current approved records first, with history available separately. A beaten record remains in history.
- Permit tied approved records; do not silently discard one holder.
- Categories/divisions are configurable. Do not assume one global ranking across different disciplines, sexes or weight classes.
- Allow corrections or withdrawal by the approver with a reason, preserving an audit history.
- A future member means someone who joins later can qualify under the same rules. Guest records do not automatically qualify without the owner's membership check.
- Where no genuine approved record exists, show an empty category and its record rules, with an invitation to ask a coach about an attempt.
- Show only approved public information. Raw evidence and administrative details are private unless explicitly approved for public use.

## Submission and approval workflow

The complete target includes a real persistent workflow, not just a simulated approval button:

1. A designated coach signs in to a private submission area and enters the result and evidence.
2. The entry remains pending and invisible publicly.
3. Upendra reviews it and approves, rejects or requests a correction.
4. Only approved records enter the public Board; subsequent changes are controlled and auditable.

Coach and approver permissions must be enforced by the server/service. Hiding controls in a public page or storing an admin flag in the browser is insufficient. No secrets or private evidence belong in the public repository.

Keep the public site compatible with GitHub Pages. The workflow needs a hosted data/authentication service alongside it; GitHub Pages alone cannot provide that service. The implementation plan should select an appropriate available service, explain any account or cost requirement, and identify necessary user setup before activation. Backend vendor selection is left to the builder's recommendation, not claimed as user-approved.

Deliver a local multi-page review preview first, then connect and test the persistent workflow as part of the full expansion. If the service cannot be activated yet, explicitly label the administrative preview as a demo and report the remaining setup; do not call the full workflow complete. Any real service provisioning, public deployment or publication still follows the user's authorization boundaries.

## AVYA relationship

- Brand it AVYA even though the destination domain contains icanbefitter.
- Use https://app.icanbefitter.com for Open AVYA links; the older repository homepage is not the intended destination.
- Include one purposeful home-page feature, the dedicated AVYA page, and relevant contextual links where useful.
- Suggested copy direction: train at GYMBRO and support your routine with AVYA. Treat marketing wording as draft until reviewed.
- Do not imply shared login, shared health data, automatic gym-member access, a free paid tier or a membership bundle.
- No AVYA repository changes are included in this batch.

## Implementation constraints and builder choices

The current public site uses buildless HTML, CSS and JavaScript in dist. Retain it unless the implementation plan establishes a clear need to change. Real HTML page paths should work on direct visits and refresh under /Gymbro/; avoid server routes that GitHub Pages cannot resolve.

The builder chooses file structure, shared navigation implementation, small interaction details, breakpoints and the managed workflow service recommendation. Preserve useful existing training, product and membership interactions, font licences, reduced-motion support and keyboard access.

Design notes may be written locally now. Product implementation starts after this full brief is approved. Existing commerce and trial interactions must remain honestly labelled while they are demonstrations.

## Review and completion criteria

- All public pages can be opened directly from the GitHub project subpath, refreshed and reached from desktop/mobile navigation.
- Founder and coach names are present, founders have equal prominence, and no unverified personal credentials or fake portraits appear as factual.
- Board filters, history, ties, event comparisons, pending visibility and corrected/withdrawn entries behave consistently.
- Real workflow verification covers coach submission, approver-only publication, persistence, public approved-only reads and denied unauthorized access.
- AVYA actions use the confirmed live destination and make no unapproved commercial or data-sharing promises.
- Review at 320, 390, 768, 1024 and 1440 pixels with no horizontal overflow. Check touch targets, keyboard navigation, focus, dialogs and reduced motion.
- Trial, price and cart demo limitations remain clear. The site never reports a real booking, order or payment that did not occur.
- Report separately what is implemented locally, what is connected to a real service and what is published. Publication is not part of design approval.

## Remaining content before factual publication

Approved founder biographies, coach specialties/biographies, real portraits, actual gym/contact details, real record entries and evidence, and approved AVYA screenshots. Missing content should produce honest short introductions or empty states rather than fabricated details; it need not block reviewing the design.
