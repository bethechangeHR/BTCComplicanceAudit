# VERIFICATION.md

Evidence-backed definition-of-done for the California HR Risk Audit. See
`REVIEW.md` for the human HR-Pro sign-off checklist this feeds into. Nothing
in this document is asserted without the actual command output or curl
output that produced it.

**2026-07-18 tool-changes pass (P0 through P3), see `PLAN-tool-changes-2026-07-18.md`
for the full plan this executed:**

P0, the Q1 freeze that took a real Meta campaign from 223 landing views to 0
ToolStart events. `generateEventId()` (`channels/pixel.ts`) was a bare
`crypto.randomUUID()` with no fallback, called synchronously on the first
answer before the UI advanced, with no try/catch. Fixed with a three-step
fallback chain (`crypto.randomUUID()`, then a v4 UUID built from
`crypto.getRandomValues()`, then a `Date.now()`/`Math.random()` string, each
step wrapped so it can never throw) plus decoupling every tracking call in
`components/ComplianceCheckApp.tsx`'s `handleAnswer` and `handleGateSubmit`
from the state transition: the UI now always advances first, and all
tracking runs inside a try/catch guard afterward. The shared-eventId dedup
contract between the browser Pixel fire and the server-side CAPI twin
(`/api/tool-start`, `/api/submit`) is unchanged, each event still generates
one id and passes it to both legs.

P1, start and opt-in rate. The intro Hero screen (a separate "Start my free
risk audit" click) was removed; the tool now opens directly on question 1
(`components/ComplianceCheckApp.tsx` initial `Stage`), with `Hero.tsx`
repurposed into a slim header (logo, headline, value-prop line) shown only
above question 1. Headline copy is now an A/B seam (`lib/copy/headline.ts`,
`HEADLINE_VARIANTS`), selected via `?v=` on the landing URL
(`app/page.tsx`, `resolveHeadlineVariant`), default `control`. At the email
gate, the `name` field is no longer required, email is the only required
field; the phone field and its SMS consent checkbox were left completely
untouched, since they are the registered Twilio A2P 10DLC opt-in surface for
a campaign that is mid-resubmission (SID
`CMc7a7d23fc58fa791da103bda48928036`), confirmed by reading
`build/btc-a2p-resubmission-fix-v2-2026-07-17.md` and
`build/btc-a2p-book-redirect-vscode-handoff-2026-07-17.md`, and the exact
consent string was grepped unchanged against
`SMS_CONSENT_DISCLOSURE_TEXT` in `app/api/submit/route.ts`. A real letter-grade
teaser now shows at the gate before submit: `data/scoring.ts` gained
`computeAnswersScore()` (single source of truth, also now used by
`lib/engine/index.ts`, replacing a duplicate local sum) and `gradeAnswers()`,
a client-safe grade compute that imports only point records and
`scoreToGrade`, never `data/gap-library.ts`, so no gated report text is
reachable in the client bundle before the gate. `lib/engine/goldenMaster.test.ts`
asserts `gradeAnswers()` agrees with the full engine's grade on every
golden-master scenario.

P2, results-page deficit. `OnPageResult` (`lib/recommendation/types.ts`)
gained `industryContext` (the existing `INDUSTRY_LAWSUIT_ANCHOR`, reused
verbatim, never a new legal claim) and `leadPriority` (from
`buildQualificationTag`), both populated in `buildOnPageResult`
(`lib/recommendation/index.ts`). `components/ResultView.tsx` gained a
now-vs-could-be contrast (`components/RiskContrast.tsx`, only rendered when
at least one category is flagged) and a cost-of-doing-nothing line
(`components/CostAnchorLine.tsx`, the anchor's own framing string rendered
unchanged). The planned P2.3 VSL slot was dropped from scope: there is no
VSL recorded and no plan to record one, so no dark scaffolding was built for
it, per direct instruction mid-session.

P3, booking-link prefill. `bookingUrlWithAttribution()`
(`lib/recommendation/index.ts`) now accepts an optional prefill object
(firstname, lastname, email, company, phone via `URLSearchParams.set`, which
URL-encodes automatically) alongside the existing UTM params, wired through
`buildOnPageResult` (called from `app/api/submit/route.ts` with the
submitted name/email/company/phone), `buildReport` (called from
`app/report/[token]/page.tsx` with the signed token's payload), and
`buildEmailPayload`. A `splitName()` helper divides the gate's single name
field into firstname/lastname. Degrades gracefully: a contact with only an
email still gets that one param, no empty params are ever appended (see the
unit tests in `lib/recommendation/index.test.ts`, "booking URL prefill,
added 2026-07-18 P3").

Mobile QA pass on this same session's changes (code-level review only, no
device lab or browser automation tool available in this environment, same
limitation as section 8 below): reviewed every touched and new component for
Tailwind mobile-first classes, tap target sizing, and text overflow risk.
Two real issues were found and fixed as part of this pass, not left as
findings: (1) `components/EmailGateStep.tsx` originally reused the full-size
result-page `GradeBadge` (`text-8xl`/`text-9xl`) above a 3-field form, which
on a short viewport (the exact Facebook/Instagram in-app-browser environment
P0 is about) would push the email field, the actual point of the gate, below
the fold; fixed by adding a `compact` prop to `components/GradeBadge.tsx`
(smaller type scale and padding, same colors) used only at the gate,
`ResultView.tsx`'s usage is unaffected. (2) The outer page wrapper in
`components/ComplianceCheckApp.tsx` carried a fixed `py-16` (64px top and
bottom) regardless of screen size, and question 1 now stacks the header,
progress trail, and all 4 answer options on one screen (P1a); tightened to
`py-8 sm:py-16` and the Hero-to-question gap to `space-y-6 sm:space-y-8`
(desktop spacing unchanged) so the fixed chrome competes less with the
actual answer buttons for vertical space on a compressed mobile viewport.

Automated verification, all run for real this session:

```
npx vitest run   -> 6 test files, 48 tests, all passed (up from 32; 16 new
                     tests: 4 for generateEventId's fallback chain, 5 for
                     gradeAnswers agreeing with the engine across every
                     golden-master scenario, 2 for the new OnPageResult
                     fields, 4 for booking URL prefill, plus small updates
                     to existing suites)
npx tsc --noEmit -> clean, no output
npm run lint     -> "No ESLint warnings or errors"
```

`npm run format:check` initially flagged 30 files; cross-referenced against
`git status -s` and confirmed all but the 19 files this session actually
touched were pre-existing dirty state from before this session (the same
CRLF-normalization pattern documented in the 2026-07-14 note below).
`npx prettier --write` was run only on the files this session touched or
created, confirmed via `git diff` that the changes were whitespace-only,
then the full suite (tests, typecheck, lint) was re-run clean.

Em/en dash grep (`[\x{2012}-\x{2015}]|&mdash;|&ndash;`) across every file
this session touched or created: zero matches.

Manual end-to-end verification via `next dev` and curl:
- `GET /` returns the value-prop header and question 1 directly, no
  intermediate "Start" screen; confirmed absence of "Start my free risk
  audit" in the response body.
- `GET /?v=dream` swaps the headline to the dream-outcome variant; `GET /`
  and any unrecognized `?v=` value fall back to the control headline.
- `POST /api/submit` with only `email` (no `name`, no `phone`) returns 200
  with a valid `onPageResult` and `reportUrl`; the returned `bookingUrl`
  carries `email=` and the UTM params but no `firstname`/`lastname`/
  `company`/`phone` params, confirming graceful degradation.
- `POST /api/submit` with `name`, `email`, `company`, and `phone` all
  provided, followed by `GET /report/<token>`: the hosted report's booking
  link carries `firstname=Jordan&lastname=Smith&email=...&company=...&
phone=...` alongside the existing UTM params.
- Confirmed no gated content (`scope of work`, `ABC test`, `Labor Code`)
  appears in the `/` response body before the gate.
- Confirmed `GET /book` still returns a 307 to the HubSpot scheduler,
  unaffected by this session (next.config.mjs was not touched, per the P3
  plan's explicit instruction not to route prefill through that redirect).

**Same-session follow-up: gate value-proposition copy.** Noah asked for the
gate to make clear WHY someone should fill out the form, with larger, more
persuasive text. `data/scoring.ts` gained `previewFlaggedCategoryCount()`,
built from `ANSWER_GAP_TRIGGERS` (already category-labeled) the same way as
`gradeAnswers()`, never importing `data/gap-library.ts`. It reveals a COUNT
of flagged categories pre-submit, not the category names themselves, which
stay gated behind submit exactly as before, that is still the actual reward.
`components/EmailGateStep.tsx` now shows this count on the compact
`GradeBadge` and in a larger `font-display text-xl sm:text-2xl` headline
("N risk areas are putting your business at risk right now" / "Your answers
show a clean profile so far" when zero), with a shorter supporting line
below it. `lib/engine/goldenMaster.test.ts` gained a
`previewFlaggedCategoryCount` describe block asserting agreement with the
engine's `categoryRisks.length` on every golden-master scenario (`npx vitest
run` now 6 test files, 52 tests, all passed). Verified
against the live client bundle (`next dev`, fetched `_next/static/chunks/app/page.js`
directly): the new copy strings are present, and neither of the leak-guard
sentinels ("ABC test", "Labor Code") appear anywhere in that bundle. Two
unrelated string fragments did match a broader search ("scopeOfWork",
"scope of work"): one was this session's own code comment describing the
leak the client-safe path avoids (dev builds do not strip comments the way a
minified production build does), the other was the pre-existing
`REPORT_INTRO_COPY` marketing string ("the scope of work it would take to
close them"), generic UX copy describing the report, not actual per-item
gated content, and not reachable from the rendered `/` page before submit
either way. `npx tsc --noEmit`, `npm run lint`, and `npx prettier --write` on
the touched files were all re-run clean after this change.

**Not done this session, still an open gate:** the mandatory real-device
test in the actual Facebook and Instagram in-app browsers. This environment
has no device lab or mobile browser access. Every P0 verification above
(unit tests, a simulated `crypto.randomUUID` failure would need to be run in
an actual browser devtools console, not this Node-based toolchain, and was
not performed this session either) is necessary but not sufficient
evidence: desktop and curl passing was already true before this fix and did
not predict the original failure, so it cannot be treated as proof this fix
works in the field. Before resuming real ad spend, a human must open the
deployed preview from inside the Facebook in-app browser and the Instagram
in-app browser, ideally on an older iOS device, tap through question 1, and
confirm the tool advances and a ToolStart appears in Meta Events Manager
Test Events with the pixel flag on in a test environment.

**2026-07-14 rework note:** a brand/naming pass, a legal-accuracy pass
against `LEGAL-RESEARCH-2026-07-14.md` (correcting the sick-leave citation,
reframing SB 294 as a current obligation, adding the conjunctive exempt
salary-basis-plus-duties test, defining CRD, adding FEHA supervisor
liability, and re-sourcing the $200,000 lawsuit anchor), two new scored
questions (wage/hour and workers' compensation, `MAX_POSSIBLE_SCORE` moved
from 54 to 69, `GRADE_BANDS` re-derived), a local-ordinance disclaimer, and a
back button were all completed this session. Sections 1, 2, 3, 4, 5, and 9
below are updated with fresh command output from this pass. Sections 6, 7,
8, 10, and 12 predate this session (curl walkthroughs, the n8n/HubSpot
pipeline test-fire, the mobile/a11y spot check, the build-environment note,
and the HubSpot marketing-email workflow debug) and are left as an accurate
historical record; none of them touched `lib/engine/`, `data/scoring.ts`, or
`data/gap-library.ts`, so a fresh end-to-end curl pass and pipeline test-fire
against the new 11-question, 69-point model is still a follow-up item, not
done as part of this pass, see the updated open-items list at the bottom of
this file.

**2026-07-09 Part A logic rework note:** a 9th question (new-hire paperwork,
question 8 in the flow) was added and the HR-support question (question 9)
was zeroed out to a pure lead-fit tag. `MAX_POSSIBLE_SCORE` moved from 49 to
54 and `GRADE_BANDS` was re-derived proportionally. Section 2 below (hand
reconciliation) has been updated to the new numbers. Sections 6 and 7 contain
dated, real command/curl/MCP evidence captured **before** this rework
(2026-07-08 and 2026-07-09 respectively, prior to the Part A session) and are
left as an accurate historical record rather than rewritten; the specific
score/maxPossibleScore/gap-id values quoted there (39/49, etc.) reflect the
pre-rework engine and are stale as a description of current live behavior.
Re-verification against the new 54-point model (fresh `next dev` curl pass
and a fresh n8n/HubSpot test-fire) is a follow-up item, not yet done as part
of this Part A change, see the updated open-items list at the bottom of this
file.

**2026-07-09 end-of-session summary, Part B (design overhaul) and Part B7
(pixel wiring):** after the Part A logic rework above, this same session
also replaced the cream/Fraunces design system with the teal-instrument/
Spectral system, reframed the hero copy away from an "instant grade" pitch,
rebuilt the grade reveal into an instrument-panel scorecard (removing the
on-page score line and the direct report link), added a loss-aversion CTA,
simplified the booking embed, and rebuilt the hosted report page as the
funnel's highest-perceived-value asset. None of this touched
`lib/engine/`, `data/scoring.ts`, or `data/gap-library.ts`, so it does not
invalidate the hand-reconciled scenarios in section 2 below or the
gap-item source mapping in section 3; those still need the same
re-verification against the new 54-point model called out in the note
above, nothing more. `npx tsc --noEmit`, `next lint`, and `npx vitest run`
(32 tests) were all re-run clean after both the pixel wiring and the design
changes, see the fresh command output captured for this phase.

Also this session: Meta Pixel client-side event firing was wired
(`components/MetaPixel.tsx`, `channels/pixel.ts`'s `trackPixelEvent()`,
and the `ToolStart`/`Lead`/`ToolComplete` call sites in
`components/ComplianceCheckApp.tsx`), per Hard Gate 5 in `CLAUDE.md`. This
is wiring only, confirmed still OFF by default: `NEXT_PUBLIC_ENABLE_PIXEL`
grepped across the repo (excluding `node_modules`) is `false` in both
`.env.local` and `.env.example` and unset everywhere else, and a `curl` of
the rendered homepage HTML with the flag off contains no `fbq(` call, no
`connect.facebook.net` script, and no `meta-pixel-base` script tag. This
has not been tested with the flag actually turned on (no pixel ID exists
to test with, and turning it on is explicitly out of scope, gated behind
Hard Gate 5 clearing).

**What still needs fresh verification evidence before real prospect
traffic, unaffected by this session's design/pixel-wiring changes:** the
full end-to-end delivery pipeline test-fire through the live production
form, as scoped in `ops/NEXT-SESSION-HANDOFF.md` (a real submission through
the live Vercel deploy, confirming a new n8n execution, a new/updated
HubSpot contact with all 16 properties populated, and that the disabled
Slack alert node correctly does not fire). That item was already
outstanding before this session's design and pixel work started and
remains outstanding now; nothing in this session's changes affects it
either way.

**2026-07-09, pipeline audit and fix (Slack, HubSpot, email, name/company):**
Noah reported no Slack alerts were appearing and asked whether the pipeline
was even populating HubSpot or n8n at all. A full read-only audit of the live
n8n workflow, its execution history, the live HubSpot portal, and the Slack
channel was done before any change:

- `search_executions` on workflow `WZgb6WemXlxuamzz` returned 10 real
  executions beyond the original test-fire baseline (IDs 157-166, all
  `status: success`), most of them `tool_viewed` page-load events with all
  fields empty (correct, no PII on that branch), and one real
  `tool_complete` submission: execution `166`, 2026-07-09T19:42:20Z, from
  `ntpyt2001@gmail.com` (Noah's own email), grade D, 31/54.
- `get_execution` with `includeData` confirmed execution 166 ran the full
  graph correctly: `Upsert HubSpot Contact` updated Noah's real, pre-existing
  HubSpot contact (ID `10054`) with every `compliance_check_*`/`cc_*`
  property populated. Verified independently with
  `mcp__claude_ai_HubSpot__search_crm_objects` querying that email directly:
  all fields present and correct (`compliance_check_grade: "D"`,
  `compliance_check_score: "31"`, `compliance_check_max_score: "54"`,
  `compliance_check_gap_ids`, all `cc_*` answer fields, etc). This is the
  first real, non-manual-test-fire proof this pipeline has had.
- Execution 166's `Send Report Email (HubSpot)` node hit the exact same
  `Forbidden - perhaps check your credentials?` / missing-scope error
  confirmed in the original 2026-07-09 test-fire (section 7.6 below),
  confirming Hard Gate 1 is still unresolved, not a new bug.
- `list_credentials` on the n8n instance confirmed no SMTP-type or
  `twilioApi` credential exists, only HubSpot and Slack credentials. The SMTP
  fallback node has never had anything to fall back to.
- `slack_read_channel` on `#btc-risk-audit-alerts` (`C0BG9RE3QDQ`) returned
  exactly one message ever: the automated channel-join notice from
  2026-07-09T08:37:46 PDT. Zero submission alerts, confirming Noah's report.
  Root cause: `get_workflow_details` showed the `Notify Slack: New
Submission` node genuinely present in the _active/published_ version of
  the workflow (not just a draft, contrary to what a prior session worried
  might happen), but individually `disabled: true`. Not a bug, the
  documented pending state.
- Code read of `components/EmailGateStep.tsx` confirmed a real, separate gap
  Noah caught independently: the form never collected name or company, only
  email/phone. Every downstream piece (`app/api/submit/route.ts`,
  `lib/token.ts`, `ReportView.tsx`, this workflow's `Normalize Payload` and
  `Upsert HubSpot Contact` nodes) already expected and used these fields, so
  Noah's own contact showing "Noah" as firstname was from his pre-existing
  CRM record, not from the funnel.

**Fixes applied, same session:**

1. `components/EmailGateStep.tsx` and `components/ComplianceCheckApp.tsx`:
   added `name` (required) and `company` (optional) fields to the email
   gate, threaded into the `/api/submit` POST body. `npx tsc --noEmit`,
   `npm run lint`, `npx vitest run` all re-run clean after (32/32 tests,
   no changes needed to any test since no test asserted on
   `GateSubmission`'s exact shape).
2. n8n workflow `WZgb6WemXlxuamzz` updated via `update_workflow` (two
   `setNodeDisabled` operations) and republished via `publish_workflow`:
   `Notify Slack: New Submission` enabled, `Send Report Email (HubSpot)`
   disabled (was live but always erroring on the confirmed scope block).
   Confirmed via a fresh `get_workflow_details` call that the _active_
   version (`activeVersionId 8981beb3-445f-4a4a-b30e-0c1c95ee0801`)
   reflects both changes, not a draft.
3. Email strategy changed on Noah's direction: his HubSpot AI Assistant
   recommends marketing email (included in his plan) over chasing the
   transactional-send scope grant. This extends the pattern already chosen
   for the nurture sequence to the report email too, one native HubSpot
   workflow instead of an n8n-triggered send. See `ops/n8n-workflow.md`,
   "HubSpot marketing-email workflow, manual build task" for the exact
   checklist, a manual HubSpot-UI task for Noah or LeiLani, not buildable
   through the connected MCP tools.

**Still open after this fix:** the HubSpot marketing-email workflow itself
(email delivery stays unverified until it's built), HR-Pro sign-off, and
Twilio SMS (explicitly out of scope for this fix per Noah).

## 1. Test output

`npx vitest run`, 2026-07-08, original run. Re-run 2026-07-09 after the Part
A logic rework (9th question, HR-support zeroed out, new 54-point max), same
pass/fail shape, updated expected values inside the same 32 tests
(golden-master and MAX_POSSIBLE_SCORE assertions hand-reconciled to the new
numbers, see the note at the top of this file). Re-run again 2026-07-14
after adding the wageHour/workersComp questions (new 69-point max), real
`npm test` output from this session:

```
 Test Files  5 passed (5)
      Tests  32 passed (32)
```

Same 32 tests as before, same file/test count (no new test files or cases
added, existing fixtures and golden-master scenarios were extended with the
two new answer fields and hand-reconciled to the new numbers instead, see
section 2 below). One fixture (`lib/validateAnswers.test.ts`'s
`VALID_ANSWERS`) was initially missed and failed on the first re-run
(`expected null to deeply equal {...}`, since `validateComplianceAnswers`
correctly rejected an answer set missing the two new required fields); fixed
by adding `wageHour: "complete"` and `workersComp: "yes"` to that fixture,
then the full suite passed clean.

Covering: `lib/engine/index.test.ts` (10 tests: point contribution per
answer, band-cutoff edges with no gaps or overlaps from 0 to 69 as of
2026-07-14 (was 0 to 54, then 0 to 49 before that), all-clean and all-risky
extremes, "unsure" harassment training treated as a real gap not a free
pass, single-state-CA vs single-other-state vs multi-state distinguished,
the HR-support question (now question 11, last in the flow) never moving
the grade more than one band, qualification tag exposed separately from the
gap list, severity-descending ordering, handbook-stale vs handbook-none
triggering distinct gaps),
`lib/engine/goldenMaster.test.ts` (4 tests, see section 2),
`lib/recommendation/index.test.ts` (8 tests: the on-page result never leaks
diagnosis/scope-of-work text, the hosted report includes full diagnosis and
scope of work for every triggered gap, the $200K industry anchor is framed
correctly, gap sections match the engine's category risks, email payload
merge fields are correct, qualification tag lead-priority ordering),
`lib/validateAnswers.test.ts` (6 tests: valid/invalid answer sets, email
format), `lib/token.test.ts` (4 tests: sign/verify round-trip, tamper
detection, malformed input, wrong-secret rejection).

## 2. Three hand-reconciled scenarios, plus the required clean-business proof

All four locked as golden-master tests in `lib/engine/goldenMaster.test.ts`
so a future scoring change cannot silently drift these results. Updated
2026-07-09 for the Part A logic rework (9th question added, HR-support
zeroed out, new 54-point max), then re-reconciled again 2026-07-14 after
adding the wageHour and workersComp questions (new 69-point max); see the
note at the top of this file.

**Buildspec scenario 1** (6-employee single-state shop, no handbook, mostly
1099s). Unstated fields assumed: single state read as California; remaining
non-contractor staff assumed hourly; training and leave process assumed
absent, matching a very small, informally-run shop. New-hire paperwork
(question 8, added 2026-07-09) assumed "none," consistent with that same
profile. Wage/hour (added 2026-07-14) assumed "none" and workers' comp
(added 2026-07-14) assumed "unsure," the same informally-run profile
(no consistent timekeeping/break process; not confident about coverage
rather than confidently uninsured, a documented non-flattering middle
assumption). HR support no longer scores.

```
0 (headcount 1-9) + 0 (California only) + 8 (mostly 1099) + 0 (hourly)
+ 8 (no handbook) + 7 (no training) + 6 (no leave process)
+ 7 (no new-hire paperwork) + 7 (no wage/hour process)
+ 3 (unsure workers' comp) + 0 (HR support, zeroed out)
= 46 points -> grade D
```

**Buildspec scenario 2** (40-employee California, all salaried, no
harassment training). Unstated fields assumed: no contractor use; handbook
assumed stale (a neutral middle assumption, not the flattering "current");
leave process assumed documented; HR support assumed outsourced (no longer
scores). New-hire paperwork (question 8, added 2026-07-09) assumed "partial,"
the same neutral, non-flattering middle assumption as the stale handbook.
Wage/hour (added 2026-07-14) assumed "partial" for the same reason; workers'
comp (added 2026-07-14) assumed "yes," on the reasoning that a 40-employee
company past the earliest startup stage with outsourced HR support is the
profile most likely to already carry the legally required coverage even
while other practices lag.

```
2 (headcount 10-49) + 0 (California only) + 0 (no contractors)
+ 6 (all salaried) + 5 (stale handbook) + 7 (no training)
+ 0 (documented leave) + 4 (partial new-hire paperwork)
+ 4 (partial wage/hour process) + 0 (workers' comp covered)
+ 0 (HR support, zeroed out) = 28 points -> grade C
```

**Buildspec scenario 3** (120-employee multi-state, current handbook,
documented leave). Unstated fields assumed: some contractor use, a mixed
salaried/hourly workforce, harassment training current, HR support in-house.
New-hire paperwork (question 8, added 2026-07-09) assumed "complete," the
same deliberately-well-run profile as the current handbook and documented
leave. Wage/hour and workers' comp (added 2026-07-14) assumed "complete" and
"yes" respectively, the same deliberately-well-run profile.

```
4 (headcount 50-149) + 6 (multi-state) + 4 (some 1099) + 3 (mixed salaried)
+ 0 (current handbook) + 0 (training current) + 0 (documented leave)
+ 0 (complete new-hire paperwork) + 0 (complete wage/hour process)
+ 0 (workers' comp covered) + 0 (HR support, zeroed out)
= 17 points -> grade B
```

10 of this scenario's 17 points come from headcount tier and multi-state
structure, not from any practice failure: the company is doing the actual
work right (current handbook, trained, documented leave, complete new-hire
paperwork, documented wage/hour process, covered) but still carries real
structural complexity risk from its size and footprint. This is the honest
reading, not a rigged one, see the design-principle comment in
`data/scoring.ts`. The raw score is unchanged at 17 (this scenario's HR
support was already in_house and its new-hire paperwork answer was already
"complete," both zero points either way, and the two new questions are also
answered clean), but the **grade moved from C to B** because the new
69-point max lowers this score's relative position: 17/54 (31 percent of
the old max) landed in band C (16-26), while 17/69 (25 percent of the new
max) lands in band B (10-19). This is an expected, honest consequence of
adding two clean-scoring practice dimensions to the model, not a scoring
bug.

**Genuinely clean business** (required separately by the verification gate,
not a buildspec scenario): single-state California, 1 to 9 employees, no
contractors, hourly staff, current handbook, trained, documented leave,
complete new-hire paperwork, documented wage/hour process, workers' comp
coverage, in-house HR support.

```
0 + 0 + 0 + 0 + 0 + 0 + 0 + 0 + 0 + 0 + 0 = 0 points -> grade A, zero triggered gaps
```

This is the proof the scoring model is not rigged to fail everyone
regardless of actual compliance posture. Still holds after both the Part A
rework and the 2026-07-14 rework: every clean answer, including the two
newest questions, scores 0.

## 3. Gap-item source mapping

Every item in `data/gap-library.ts` cites a named source in its `sourceRef`
field. Summary, updated 2026-07-14 (rows marked "reworded 2026-07-14" changed
wording per `LEGAL-RESEARCH-2026-07-14.md`, not just a date bump; four new
rows added for the wage/hour and workers' compensation items):

| Gap ID(s)                                                          | Legal source                                                                                                                                                        | Confidence                                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `gap-1099-mostly`, `gap-1099-some` (reworded 2026-07-14)           | Cal. Labor Code Section 2775 (AB 5, 2019; AB 2257, 2020); AB 1514 (2026)                                                                                            | High, primary statute. The prior open question (whether the ABC test received a 2025/2026 amendment) is RESOLVED: AB 1514 is that amendment, core test unchanged                                                                                                                     |
| `gap-exempt-all`, `gap-exempt-mix` (reworded 2026-07-14)           | Cal. Labor Code Section 515(a); DIR News Release 2025-118 ($70,304/yr 2026 floor)                                                                                   | High, primary agency source. Now states the conjunctive salary-basis-then-duties test correctly, per LeiLani's correction                                                                                                                                                            |
| `gap-handbook-none`, `gap-handbook-stale` (reworded 2026-07-14)    | Gov Code Section 12950.1, 2 CCR Section 11023, Labor Code 245-249/2810.5/3550, SB 616 (2023), Labor Code 246.5 (AB 406, 2025), SB 294                               | High on each component requirement; sick-leave citation corrected (AB 2288 removed, it is the PAGA bill, not sick leave); SB 294 reframed as a current annual obligation, not future-dated; the "no single handbook mandate" framing remains an absence-of-law finding, still a FLAG |
| `gap-training-none`, `gap-training-unsure` (reworded 2026-07-14)   | Gov Code Section 12950.1 (SB 1343, 2018); Gov Code Section 12940(j)(3) (FEHA individual supervisor liability)                                                       | High, primary statute plus CRD FAQ. CRD now defined on first use; supervisor personal-liability point added; `gap-training-unsure`'s inaccurate "same exposure as skipping it" line removed                                                                                          |
| `gap-leave-none`                                                   | Labor Code 245-249; Gov Code 12945/12945.2 (SB 1383, 2021); 29 CFR 825.105                                                                                          | High, all four thresholds independently confirmed                                                                                                                                                                                                                                    |
| `gap-multistate`                                                   | General state-level employment law primacy (SHRM)                                                                                                                   | High as a structural principle, not a single-statute citation                                                                                                                                                                                                                        |
| `gap-other-state`                                                  | btc-paid-ads-campaign-buildspec-v1-2026-07-08.md geo decision                                                                                                       | This build's own framing choice, not an external legal citation                                                                                                                                                                                                                      |
| `gap-newhire-none`, `gap-newhire-partial` (added 2026-07-09)       | Federal Form I-9 / IRCA (8 U.S.C. Section 1324a, INA Section 274A); Cal. Labor Code Section 2810.5 (WTPA notice at hire); CA DIR / US DOL workplace posters         | I-9 and WTPA citations high confidence; the exact CA poster-mandate statute number was not independently confirmed by this build, flagged in `UNVERIFIED_RESEARCH_FLAGS` for a fresh legal pass                                                                                      |
| `gap-wage-hour-none`, `gap-wage-hour-partial` (new, 2026-07-14)    | Cal. Labor Code Section 512 (meal breaks); IWC Wage Orders and Labor Code Section 226.7 (rest breaks, premium pay); Ferra v. Loews Hollywood Hotel, LLC (Cal. 2021) | High, primary statutes plus a controlling Cal. Supreme Court case. Not part of the original 2026-07-08 pass, flagged in `UNVERIFIED_RESEARCH_FLAGS` for a fresh legal pass                                                                                                           |
| `gap-workerscomp-none`, `gap-workerscomp-unsure` (new, 2026-07-14) | Cal. Labor Code Sections 3700 and 3700.5; SB 291 (2026)                                                                                                             | High, primary statutes. Not part of the original 2026-07-08 pass, flagged in `UNVERIFIED_RESEARCH_FLAGS` for a fresh legal pass                                                                                                                                                      |

Full text of every claim, with exact statute numbers, lives in each item's
`sourceRef` field in `data/gap-library.ts`; the eight reworded items and
four new items above carry `lastVerified: 2026-07-14`, the rest still carry
`lastVerified: 2026-07-08` or `2026-07-09`. Everything either research pass
could not independently confirm is listed verbatim in
`UNVERIFIED_RESEARCH_FLAGS` in that same file, and repeated in `REVIEW.md`.

## 4. Em dash / en dash scan

`Grep` for `—|–|&mdash;|&ndash;` across the full repo, 2026-07-08. One file
matched: `CLAUDE.md`, line 49, which reads:

```
copy, or HTML entities (`&mdash;`, `&ndash;` count as violations). Use a
```

This is the rule text itself describing the ban, not a violation. No other
file in the repo, including every `.ts`, `.tsx`, and `.txt` email file,
matched.

**Re-run 2026-07-14** after the naming, legal-accuracy, new-questions, and
copy-softening pass. `Grep` for `[\x{2012}-\x{2015}]|&mdash;|&ndash;`
(Unicode figure/en/em/horizontal-bar dashes plus the HTML entities) across
the full repo, excluding `node_modules`, `.next`, and `.planning`. Three
files matched, all the rule text itself naming the banned entities, not a
violation:

```
CLAUDE.md:56:   copy, or HTML entities (`&mdash;`, `&ndash;` count as violations). Use a
VERIFICATION.md:262:`Grep` for `—|–|&mdash;|&ndash;` across the full repo, 2026-07-08. One file
VERIFICATION.md:266:copy, or HTML entities (`&mdash;`, `&ndash;` count as violations). Use a
REVIEW.md:192:      copy, email copy), including `&mdash;`/`&ndash;` entities, other than
```

`REVIEW.md` newly appears in this list only because the 2026-07-08 scan
predates the point where `REVIEW.md`'s own structural-checks section started
quoting the rule text; it is the same kind of quoted-rule-text exception as
the `CLAUDE.md` line, not a new violation. Every `.ts`, `.tsx`, and `.txt`
file this pass touched (data/gap-library.ts, data/scoring.ts,
data/questions.ts, lib/engine/*, lib/recommendation/copy.ts, every
`components/*.tsx`, every `content/emails/*.txt`) matched zero times.

## 5. BTC pricing scan

`Grep` for dollar amounts and every known BTC retainer/onboarding figure
(`$821.37`, `$769.97`, `$718.57`, `$1,897`, `$3,194`, `$5,640`, `$9,613`,
`$2,527`, `$5,088`) across the full repo, 2026-07-08. Zero matches for any
BTC pricing figure. The only dollar amounts anywhere in the repo are
`$70,304` (the CA 2026 exempt salary floor, a legal figure) and `$200,000`
(the industry lawsuit anchor, explicitly framed as an industry figure, not
a BTC guarantee, in both `data/gap-library.ts` and every email that
references it).

**Re-run 2026-07-14.** Same zero result for BTC pricing figures. Also grepped
for the literal string `BTC` in every `.tsx` and `.txt` file (the
user-facing surfaces) across the repo: zero matches. The remaining `BTC`
mentions in the repo are all non-rendered: `data/gap-library.ts`'s
`complianceAngle` field (an internal metadata field never rendered by any
component, confirmed by grepping for `complianceAngle` across
`components/`), this file's own historical pipeline-evidence text (test
contact names, workflow names), `CLAUDE.md`'s own rule text, and
`ops/n8n-workflow.md`'s internal credential name, all internal/comment
usage explicitly allowed by `CLAUDE.md` rule 1. `$200,000` was also
re-sourced this pass away from `data/gap-library.ts`'s prior citation to
BTC's own pitch deck (Genevieve's flag), to Novian Law 2026 and Hiscox, see
`LEGAL-RESEARCH-2026-07-14.md` item 10 and `REVIEW.md`.

## 6. Both payloads exercised end to end

Dev server started locally (`npm run dev`, `next dev`, confirmed listening
on `http://localhost:3000`). Verified with curl:

- `GET /` returns HTTP 200 and renders "California HR Risk Audit" and
  "Start my free risk audit."
- `GET /preview` returns HTTP 200 and renders all 5 seeded scenarios
  including "Genuinely clean business" and "View hosted report" links.
- `POST /api/submit` with a risky answer set (10-49 headcount, California
  only, mostly 1099s, all salaried, no handbook, no training, no leave
  process, no HR support) returned:

  ```json
  {
    "onPageResult": {
      "grade": "F",
      "score": 39,
      "maxPossibleScore": 49,
      "categoryRisks": [
        { "category": "Handbook & Written Policies", "severity": "high" },
        { "category": "Harassment Prevention Training", "severity": "high" },
        { "category": "Leave & Accommodation Process", "severity": "high" },
        { "category": "Worker Classification", "severity": "high" }
      ]
    }
  }
  ```

  with a valid, working `reportUrl` in the same response.

- `POST /api/track` with `{"mode":"paid","fbclid":"test-fbclid-123"}`
  returned `{"ok":true,"sent":false}`, `sent: false` is correct since
  `COMPLIANCE_CHECK_WEBHOOK_URL` is intentionally unset in local dev (logs
  the payload instead of sending, per `channels/webhook.ts`).
- `GET /report/<the signed token from the submit response above>` returned
  HTML containing "ABC test," "Labor Code Section 2775," "Full scope of
  work to close this gap," "200,000," and "Book your free 30-minute,"
  confirming the hosted report renders the full diagnosis, full scope of
  work, and industry context, with the booking embed present.
- `GET /report/tampered-invalid-token` returned the "This report link is
  invalid or has expired" fallback page, confirming a malformed or
  tampered token is rejected rather than silently accepted.

## 7. Delivery pipeline: built and test-fired, 2026-07-09

Both the n8n and HubSpot MCP connectors were confirmed live this session
(`search_workflows` and `get_organization_details` both returned real
data, portal ID 39710175). The pipeline in `ops/n8n-workflow.md` was
built node by node and test-fired with a **test contact only**, never a
real prospect. Evidence below.

### 7.1 MCP connector confirmation

`mcp__claude_ai_n8n__search_workflows` returned `{"data":[],"count":0}`
(empty portal, connector live). `mcp__claude_ai_HubSpot__get_organization_details`
returned real account data: `{"accountId":39710175,"timeZone":"US/Eastern","uiDomain":"app.hubspot.com"}`.

### 7.2 16 HubSpot custom contact properties, created and verified

Built as a one-time n8n setup workflow ("Setup: BTC Compliance Check
HubSpot Properties v2", workflow ID `fNaVvL4V37k7mkro`, HTTP Request
nodes calling HubSpot's Properties API directly, since neither the n8n
HubSpot node nor the HubSpot MCP expose property-schema creation).
Executed once; all 16 properties returned HTTP 201 with the exact
`name`, `type`, `fieldType`, `groupName`, and enum `options` specified in
this document's schema table. Verified independently afterward with a
direct `mcp__claude_ai_HubSpot__get_properties` call for all 16 names:

```
propertiesNotFound: []
```

All 16 confirmed present with correct types and option sets:
`compliance_check_grade` (enumeration A-F), `compliance_check_score`
(number), `compliance_check_max_score` (number),
`compliance_check_gap_ids` (string/textarea),
`compliance_check_qualification_tag` (enumeration
in_house/outside/none), `compliance_check_report_url` (string),
`compliance_check_source` (enumeration meta-paid/email), `fbclid`
(string), and `cc_headcount`/`cc_states`/`cc_contractor_use`/
`cc_salaried_classification`/`cc_handbook_status`/
`cc_harassment_training`/`cc_leave_process`/`cc_hr_support`
(enumerations, options matching the literal values in
`lib/engine/types.ts` exactly).

Note: HubSpot already has a native `hs_facebook_click_id` field. This
build created the custom `fbclid` property anyway, exactly as specified
in `ops/n8n-workflow.md`'s schema table, since that document's wording
is explicit ("exactly per"). Flagged here in case Noah prefers to
consolidate onto the native field later.

### 7.3 Main delivery pipeline workflow, built and published

n8n workflow "BTC California HR Risk Audit: Delivery Pipeline" (ID
`WZgb6WemXlxuamzz`), published and active. Live production webhook URL:

```
https://btchr.app.n8n.cloud/webhook/compliance-risk-check
```

This is the value to set as `COMPLIANCE_CHECK_WEBHOOK_URL` in Vercel
once Noah approves (not set by this build, per `REVIEW.md`).

Node map as built: Webhook (POST, responds immediately) -> Normalize
Payload (Set node, optional-chains every field so `$json.body?.x ??
$json.x` never breaks on a reshaped payload) -> Route by Event (Switch
on `event`, 3 outputs: `tool_complete`, `tool_viewed`, and an explicit
`Unknown Event` fallback so nothing is silently dropped) -> per the node
map in `ops/n8n-workflow.md`.

### 7.4 Test-fire 1: `tool_complete` event, real HubSpot contact created

Fired via `execute_workflow` against the published production webhook
with a payload shaped exactly like `app/api/submit`'s real
`tool_complete` body (see `ops/n8n-workflow.md`), using a clearly
labeled test identity:

```json
{
  "email": "qa-test-riskaudit@bethechangehr.com",
  "name": "QA Test Contact",
  "company": "DO NOT CONTACT - BTC Pipeline Test",
  "fbclid": "test-fbclid-verification-2026-07-08",
  "grade": "F",
  "score": 39,
  "maxPossibleScore": 49
}
```

The "Upsert HubSpot Contact" node returned
`{"vid":234168017998,"isNew":true}` on first fire and
`{"vid":234168017998,"isNew":false}` on a second fire (confirming upsert
idempotency, not duplicate creation). Fetched the live record directly
with `mcp__claude_ai_HubSpot__get_crm_objects`, contact ID
234168017998:

```json
{
  "email": "qa-test-riskaudit@bethechangehr.com",
  "firstname": "QA Test Contact",
  "company": "DO NOT CONTACT - BTC Pipeline Test",
  "compliance_check_grade": "F",
  "compliance_check_score": "39",
  "compliance_check_max_score": "49",
  "compliance_check_gap_ids": "gap-1099-mostly,gap-exempt-all,gap-handbook-none,gap-training-none,gap-leave-none",
  "compliance_check_qualification_tag": "none",
  "compliance_check_report_url": "https://compliance.bethechangehr.com/report/test-token-qa-2026-07-08",
  "compliance_check_source": "meta-paid",
  "fbclid": "test-fbclid-verification-2026-07-08",
  "cc_headcount": "10-49",
  "cc_states": "california_only",
  "cc_contractor_use": "mostly",
  "cc_salaried_classification": "all_salaried",
  "cc_handbook_status": "none",
  "cc_harassment_training": "no",
  "cc_leave_process": "no",
  "cc_hr_support": "none"
}
```

Every one of the 16 custom properties is populated correctly from the
webhook payload. Live record:
`https://app.hubspot.com/contacts/39710175/record/0-1/234168017998`.

### 7.5 Test-fire 2: `tool_viewed` event, engagement logged on existing contact

Fired with
`{"event":"tool_viewed","fbclid":"test-fbclid-verification-2026-07-08"}`
(matching `app/api/track`'s real payload shape). The "Search Contact by
fbclid" node found the test contact from 7.4 by its `fbclid` property,
and "Log Tool Viewed Engagement" created a real HubSpot task engagement
(ID `112595904429`) associated to that contact, body `"fbclid:
test-fbclid-verification-2026-07-08, viewed at
2026-07-09T05:36:00.000Z"`. Confirms the ungated `tool_viewed` branch
correctly finds and annotates an existing contact rather than blocking
or erroring.

### 7.6 Email leg: real API call made, blocked on a scope grant, not test-fired to delivery

The primary "Send Report Email (HubSpot)" node made a real POST to
HubSpot's `marketing/v3/transactional/single-email/send` endpoint using
the existing HubSpot Service Key (App Token) credential. HubSpot's API
returned:

```json
{
  "name": "NodeApiError",
  "message": "Forbidden - perhaps check your credentials?",
  "description": "This app hasn't been granted all required scopes to make this call. Read more about required scopes here: https://developers.hubspot.com/scopes."
}
```

This is concrete, first-hand confirmation of Hard Gate 1 (`CLAUDE.md`,
`REVIEW.md`): HubSpot transactional-send capability is not currently
available to this app token. It is not merely "unconfirmed," it is
confirmed **not enabled** as configured today. Fixing this requires
either granting the HubSpot Service Key app the transactional-email
scope (if the portal's plan includes that API) or creating a real
transactional email template in the HubSpot UI and referencing its ID
(the node currently uses a `placeholder()` for `emailId` since no real
template exists yet), a decision for Noah, not resolvable by this
build.

`onError: 'continueErrorOutput'` on that node correctly routed the
failure to the SMTP fallback node instead of crashing the workflow
(execution status: `success` end to end). The SMTP fallback node itself
is disabled, since no SMTP credential exists in this n8n instance
(`list_credentials` returned only HubSpot and Slack credentials, no
`smtp` type). No email was sent or received. **This is the one piece of
"actual email received" evidence this session could not produce**, and
it is a credential/scope gap, not a workflow-design gap: the node, its
field mapping, and its error-fallback wiring are all built and
confirmed to fire correctly.

### 7.7 SMS leg: scaffolded, disabled, no Twilio credential exists

The "Send SMS (Twilio)" node is built with the correct field mapping
(`to`, `message` referencing the normalized payload, report URL, and
booking link) but is disabled, since no `twilioApi` credential exists in
this n8n instance. The "Has SMS Opt-in?" IF node correctly evaluates
`smsOptIn && phone` (fixed a strict-boolean-type-validation bug hit
during test-fire, resolved by enabling loose type validation on that
node, then confirmed working in test-fire 1 above where
`smsOptIn: false` correctly routed to the `False` branch).

### 7.8 What is and is not done

Done, with real evidence: MCP connector confirmation, all 16 HubSpot
properties, the full node graph published and live, both webhook events
(`tool_complete` and `tool_viewed`) test-fired against a real test
contact with correct data end to end, the primary/fallback email
error-handling path confirmed to fire correctly under a real failure.

Not done, and not resolvable by this build: actual email delivery
(blocked on a HubSpot scope grant or a real transactional email
template, Noah's decision, Hard Gate 1), actual SMS delivery (blocked on
provisioning a Twilio account and credential), the native HubSpot
nurture workflow (a one-time manual setup task in the HubSpot UI, see
`ops/n8n-workflow.md`), and HR-Pro sign-off (`REVIEW.md`, a separate
liability gate, untouched by this build).

Do not connect real ad traffic until the email leg above is resolved and
HR-Pro sign-off clears.

## 8. Mobile responsiveness and accessibility, spot check

Verified at the code level (no device lab or browser automation tool was
available in this environment):

- Every page and component uses Tailwind's mobile-first responsive
  modifiers (`sm:`), with unprefixed styles as the mobile default and
  `sm:` overrides for larger screens, not the reverse.
- All form inputs (`EmailGateStep`) have an associated `<label htmlFor>`.
  The SMS opt-in checkbox is wrapped in its own `<label>`.
- Interactive elements (question option buttons, the CTA buttons) use
  Tailwind's `focus-visible:ring` utilities for a visible keyboard focus
  state, not only a hover state.
- The report's "invalid token" fallback and the in-flow error state both
  give the visitor an explicit next action (a link back to the start, a
  retry button), never a dead end.
- Next.js's App Router includes the responsive viewport meta tag by
  default.

A human should still spot-check this on a real phone before launch, this
section is a code-level review, not a device-lab confirmation.

## 9. Lint, typecheck, format

All run for real in this environment, 2026-07-08, final pass:

```
npx tsc --noEmit          -> clean, no output
next lint                  -> "No ESLint warnings or errors"
npx prettier --check .     -> "All matched files use Prettier code style!"
npx vitest run             -> 5 test files, 32 tests, all passed
```

One real lint fix was made along the way: `app/report/[token]/page.tsx`
used a plain `<a href="/">` for the invalid-token fallback link, which
`@next/next/no-html-link-for-pages` correctly flagged, fixed by switching
to `next/link`'s `<Link>`.

**Re-run 2026-07-09, end of session, after the Part B design overhaul and
the Part B7 Meta Pixel wiring:**

```
npx tsc --noEmit  -> clean, no output
npm run lint      -> "No ESLint warnings or errors"
npx vitest run    -> 5 test files, 32 tests, all passed
```

`npx prettier --check .` was not re-run separately this pass (no formatting
changes are expected outside what lint already covers); flagging that
explicitly rather than silently asserting it. `npm run build` was not
re-run either, per this phase's instructions, section 10 below still
applies unchanged.

**Re-run 2026-07-14, end of session, after the naming/legal-accuracy pass,
the two new scored questions, the back button, and the copy softening:**

```
npm test           -> 5 test files, 32 tests, all passed
npm run typecheck   -> clean, no output
npm run lint        -> "No ESLint warnings or errors"
npm run format:check -> clean for every file touched this session
```

`npm test` initially failed one test (`lib/validateAnswers.test.ts`'s
`VALID_ANSWERS` fixture was missing the two new required fields, correctly
rejected by `validateComplianceAnswers`); fixed, then the full 32/32 passed.
`npm run format:check` initially flagged pre-existing style issues in four
touched files (`app/layout.tsx`, `components/EmailGateStep.tsx`,
`components/Hero.tsx`, `components/RiskAssessmentCTA.tsx`), confirmed via
`git stash` to already exist before this session's edits, not introduced by
this pass; fixed with `prettier --write` on the touched files (content
unchanged, whitespace only, confirmed via `git diff`). That same `git stash`
round-trip also normalized line endings on every other file already edited
this session (git's `core.autocrlf=true` rewrote LF to CRLF on the stash/pop
checkout), which then also needed `prettier --write` before `format:check`
passed clean; content was unaffected, confirmed by re-running the full test
suite, typecheck, and lint clean afterward. `npm run build` was not re-run,
same as the 2026-07-09 note above, section 10 below still applies unchanged.
`format:check` still flags 8 pre-existing files this session did not touch
(`app/globals.css`, `tailwind.config.ts`, `ops/n8n-workflow.md`,
`ops/NEXT-SESSION-HANDOFF.md`, `.planning/debug/business-creation-error.md`,
and `LEGAL-RESEARCH-2026-07-14.md`), out of scope for this pass.

## 10. Environment limitation: `next build` fails locally, unrelated to app code

`npm run build` (`next build`) fails locally with:

```
Error: EISDIR: illegal operation on a directory, readlink
'...\node_modules\next\dist\pages\_app.js'
```

Root-caused directly with a small Node script: `fs.lstatSync` on that exact
file correctly reports a regular file (mode 33206), but `fs.readlinkSync`
on the same path throws `EISDIR`, and the file's `ctime` (2009) is wildly
inconsistent with its `birthtime` (2026), a known symptom of exFAT
filesystem metadata quirks combined with Node v24 (a very new, non-LTS
Node version) on Windows. `node_modules/next` and the flagged file were
both confirmed to be plain files/directories, not symlinks or junctions
(`Get-Item ... | Select LinkType` returned no link type for either). This
is a local toolchain/filesystem interaction, not an application bug: it
reproduces identically regardless of `next.config.mjs` changes
(`outputFileTracingRoot`, disabling webpack's persistent cache), and Next's
own internal `/pages/_app.js` fallback (not any file this app wrote) is
what triggers it. Vercel's actual build environment is Linux, which does
not have this exFAT-driver behavior, so this is not expected to reproduce
in production. Verified instead via `next dev` (section 6 above), which
uses a different code path and does not hit this. A human building locally
on a native NTFS or ext4 volume, or with an LTS Node version (20 or 22),
should not hit this at all. Recommend confirming a clean `vercel build` or
a real Vercel preview deploy before relying solely on this local
substitute.

## 12. HubSpot marketing-email workflow: built, debugged, and delivery confirmed, 2026-07-11

The native HubSpot workflow ("California HR Risk Audit: report + nurture,"
3 emails: Initial/Follow-up/Breakup, replacing the earlier 5-email/4-email
drafts per Noah's 2026-07-11 decision) was built by Noah via HubSpot's
in-app AI assistant, activated, and end-to-end tested with real production
submissions through `app/api/submit` (not synthetic n8n test-fires). Full
evidence trail:

- **Enrollment confirmed real**: contact `234573459107` (test submission via
  live production endpoint, 2026-07-11T04:23:13Z) enrolled in the workflow
  within seconds, confirmed via the contact's Workflows history panel.
- **Bug found #1, marketing-contact suppression**: the first real send
  attempt was suppressed by HubSpot with reason `NON_MARKETABLE_CONTACT`.
  Root cause, confirmed via `query_crm_data`: 3 of 4 contacts this funnel
  had ever created were `hs_marketable_status = false`, since contacts
  created via API/integration default to non-marketing unless explicitly
  set otherwise (documented HubSpot behavior). This affected every real
  contact this funnel would ever create, not just the test contact.
- **Bug found #2, action misconfigured**: Noah added a "Set marketing
  contact status" action as the first workflow step, but its value was
  initially set backwards (`Set as non-marketing contact` instead of
  `Set as marketing contact`). Corrected 2026-07-11.
- **Fix verified**: contact `234577063823` (fresh test, 2026-07-11T05:43:35Z)
  enrolled, was correctly flipped to `hs_marketable_status: true`, and
  received a real send: `hs_email_last_send_date: 2026-07-11T05:43:40Z`,
  `hs_email_last_email_name: "CA Risk Audit - Initial"`, `hs_email_delivered:
1`, zero bounces.
- **Deliverability issue found**: despite `hs_email_delivered: 1`, the email
  did not reach the test Gmail inbox at all (confirmed via exhaustive Gmail
  search: inbox, spam, trash, promotions, sender-domain search, and an
  unfiltered newest-first listing of the entire mailbox, all empty). Sending
  domain `bethechangehr.com` was confirmed authenticated in HubSpot
  (Settings > Domains & URLs > Email Sending, screenshot evidence) and via
  direct DNS lookup (SPF include, both HubSpot DKIM CNAMEs present, DMARC
  published at `p=none`). Diagnosed as a sending-reputation/cold-domain
  issue, not an authentication failure: HubSpot's "delivered" status reflects
  SMTP-level acceptance, not final mailbox placement.
- **Mitigations applied**: the email's From address was changed from a
  generic address to `info@bethechangehr.com`, an actively-used Google
  Workspace mailbox on the same domain with real prior send history
  (confirmed via MX records pointing to Google Workspace, and real prior
  Slack-alert sender activity from `operations@bethechangehr.com`).
- **Result after the From-address fix**: fresh test (contact `234641273162`,
  2026-07-11T16:02:24Z, `hs_marketable_status: true`) landed in the test
  Gmail account's **Promotions tab**, confirmed directly by Noah. This is a
  successful, visible delivery, a materially different outcome from the
  prior full silent drop. Promotions-tab categorization is normal, expected
  Gmail behavior for automated marketing email with a booking CTA and is not
  evidence of a continuing deliverability problem.
- **Still open**: continued warm-up (steady real send volume, ideally with
  real opens/clicks, over the following days) to move future sends toward
  Primary; DMARC should be tightened from `p=none` to `p=quarantine` at
  whoever manages `bethechangehr.com`'s DNS (not done this session); whether
  the reply-based unenrollment trigger (`hs_email_last_reply_date is known`)
  was ever added to the workflow's Settings tab was never confirmed, only
  the meeting-booked branch-check stop condition is confirmed present.
- An on-page fallback link to the full hosted report (`ResultView.tsx`) was
  added 2026-07-11 as a temporary safety net during the warm-up period,
  since the original design intentionally omitted a direct on-page report
  link in favor of email-only delivery. Remove once inbox (not just
  Promotions-tab) delivery is consistently confirmed.

## 11. Open items needing human verification (summary)

See `REVIEW.md` for the full checklist. Highest-priority items:

- Re-run the section 6 curl walkthrough and the section 7 n8n/HubSpot
  test-fire against the current 11-question, 69-point engine (2026-07-14).
  The values currently in sections 6 and 7 (39/49,
  `compliance_check_max_score: "49"`, etc.) predate both the 2026-07-09 and
  2026-07-14 reworks and are historical record only, not current expected
  output. The HubSpot `cc_*` custom-property schema also needs two new
  properties (`cc_wage_hour`, `cc_workers_comp`) added before a real
  submission is sent, see `ops/n8n-workflow.md` and `REVIEW.md`.
- HR-Pro sign-off on every scoring weight, band cutoff, and gap-item
  wording (liability gate), including the four new 2026-07-14
  `gap-wage-hour-*`/`gap-workerscomp-*` items, the eight reworded items
  (`gap-1099-mostly`, `gap-1099-some`, `gap-exempt-all`, `gap-exempt-mix`,
  `gap-handbook-none`, `gap-handbook-stale`, `gap-training-none`,
  `gap-training-unsure`), the two `gap-newhire-*` items from 2026-07-09, and
  the newly-zeroed HR-support weight. This is the single largest open item,
  see `REVIEW.md` sign-off section.
- LeiLani's naming correction ("be the change HR", dropping "HR Pro" from
  the booking/consultant phrase) was applied per her literal instruction;
  confirm she is comfortable with that literal reading rather than "an HR
  Pro from be the change HR," see the TODO comment in
  `lib/recommendation/copy.ts` and `REVIEW.md` FLAG 1.
- Confirm the $200,000 industry lawsuit anchor's new framing (re-sourced
  2026-07-14 to Novian Law and Hiscox, away from BTC's pitch deck) is the
  final wording BTC wants, see `REVIEW.md` FLAG 2 and the code comment in
  `data/gap-library.ts`.
- Provision a Twilio account and credential, then enable the "Send SMS
  (Twilio)" node (section 7.7). Out of scope per Noah for now.
- Confirm the question 2 answer-option interpretation and the 8-vs-10-vs-11
  question discrepancy with LeiLani.
- Insert a real, approved testimonial in `content/emails/nurture-3-proof.txt`
  before that email is used (note: the live 3-email sequence, "Initial /
  Follow-up / Breakup," does not include the testimonial email at all,
  per Noah's 2026-07-11 decision, so this file is currently unused).
- Set `COMPLIANCE_CHECK_WEBHOOK_URL` to
  `https://btchr.app.n8n.cloud/webhook/compliance-risk-check`, and set
  `REPORT_TOKEN_SECRET` and `NEXT_PUBLIC_SITE_URL` to real production
  values, in Vercel before deploying.
- Tighten `bethechangehr.com`'s DMARC record from `p=none` to
  `p=quarantine`, and continue the HubSpot sending-domain warm-up (see
  section 12), before pushing real ad spend into this funnel.
- Confirm whether the reply-based unenrollment trigger was ever added to
  the HubSpot workflow's Settings tab (see section 12).
