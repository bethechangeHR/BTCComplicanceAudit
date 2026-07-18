# PLAN: btc-compliance-risk-check tool changes (2026-07-18)

Deliverable target on approval: save this document to the repo root as
`PLAN-tool-changes-2026-07-18.md`. No code changes in this session. Nothing is
implemented until this plan is reviewed.

Style rule enforced throughout this doc and every future code comment it
describes: no em dashes, no en dashes. Commas and periods only.

---

## Context

The live Meta campaign got 223 landing-page views and 0 ToolStart events.
Desktop works end to end. The failure is concentrated in the Facebook and
Instagram in-app mobile browsers, which is where most ad traffic lands. That is
a total top-of-funnel loss: no starts means no leads, regardless of how good
the grade, report, or booking flow are.

Root cause is code-level and confirmed by reading the source.
`generateEventId()` in `channels/pixel.ts` is a bare `crypto.randomUUID()` with
no fallback. It is called synchronously inside `handleAnswer` in
`components/ComplianceCheckApp.tsx` on the first answer (`stage.index === 0`),
at line 74, BEFORE the UI advances (the `setAnswers` and `setStage` calls are
at lines 87 to 94), and with no try/catch. On any runtime that lacks
`crypto.randomUUID` (older WebViews, iOS below 15.4, any non-secure context),
that first tap throws, the handler aborts before advancing, the tool freezes on
Q1, and ToolStart never fires. This runs even with the Pixel flag off, because
the eventId generation and the `/api/tool-start` post are not gated on the flag.

Beyond the freeze, the funnel has start-rate and opt-in-rate headroom (P1), a
results page that does not yet execute the framework's core deficit move (P2),
and a booking link that re-asks for contact data the tool already has (P3).

This plan fixes the freeze first, then lifts start and opt-in rates, then
sharpens the results page, then plumbs booking prefill. It preserves the Meta
tracking contract and the CLAUDE.md and REVIEW.md guardrails at every step.

---

## Guardrail and liability-gate summary (read first)

The REVIEW.md HR-Pro sign-off gate is re-triggered ONLY by changes to graded
gap-item wording (the `data/gap-library.ts` item text: `onPageStatement`,
`reportDiagnosis`, `scopeOfWork`) or to scoring weights and band cutoffs
(`data/scoring.ts`). Framing and layout changes do not re-trigger it.

Against that definition:

- No item in this plan edits `data/gap-library.ts` gap-item wording.
- No item changes a scoring weight or a `GRADE_BANDS` cutoff.
- Therefore no item formally re-triggers the REVIEW.md gap-item wording gate.

Two P2 items introduce NEW user-facing risk and consequence copy (the
now-vs-could-be contrast and the cost-of-doing-nothing line). They do not edit
gap-library, but they are liability-adjacent under CLAUDE.md rule 5 (name
general risk areas only, never a company-specific legal verdict) and rule 1 (no
pricing) and the $200,000 anchor rule (industry figure, never a BTC guarantee).
They should get an HR-Pro eyeball before shipping even though they do not
formally trip the gap-item gate. This is called out per item below and
collected in the sign-off section at the end.

Everything else in this plan is framing, layout, plumbing, or a pure runtime
hardening, and ships without HR-Pro sign-off.

---

## Locked decisions (from this session)

- Gate stays the registered A2P 10DLC opt-in surface. The Twilio campaign
  message flow (SID `CMc7a7d23fc58fa791da103bda48928036`) is filed as: after
  the audit, the user enters a mobile number and checks the unchecked SMS
  consent box whose exact text lives in `EmailGateStep.tsx`. The campaign is
  mid-resubmission. So the phone field and SMS consent checkbox stay exactly as
  filed. Only the NAME field loses its required flag. Email becomes the single
  required field. No A2P re-file.
- Teaser: compute the real letter grade client-side and show it AT the gate.
  Named categories and the full report stay gated behind submit.
- Headline A/B: centralize the headline in a variant map, select the variant
  from an ad-level URL param. No experiment framework, no client randomization.

---

## P0. Fix the Q1 freeze (reason starts are zero)

Two changes shipped together: harden the id generator, and decouple all
tracking from the state transition so the UI always advances first.

### Files touched

- `channels/pixel.ts` (`generateEventId`)
- `components/ComplianceCheckApp.tsx` (`handleAnswer`, `handleGateSubmit`)

### Approach

1. Harden `generateEventId()` with a three-step fallback chain, each step
   wrapped so it can never throw:
   - try `crypto.randomUUID()` when it exists;
   - else build a UUID v4 from `crypto.getRandomValues()` (set the version and
     variant bits, format as 8-4-4-4-12 hex);
   - else fall back to a `Date.now()` plus `Math.random()` string.
     The function must never throw. The dedup contract only needs the browser
     fire and the server twin to share the SAME string, not a spec-perfect UUID,
     so a degraded id is still a correct dedup key.

2. In `handleAnswer`, compute the "is this the first answer" boolean, then call
   `setAnswers` and `setStage` to advance the UI FIRST. Only after the UI has
   advanced, run the ToolStart tracking, and run it inside a guard (a helper
   wrapped in try/catch) that generates the shared eventId once, fires the
   browser Pixel ToolStart with that id, reads fbp and fbc, and posts to
   `/api/tool-start` with the same id. A throw or a slow network anywhere in
   that block can no longer block or abort the answer handler.

3. Apply the same guard shape to `handleGateSubmit`: generate the shared Lead
   eventId with the hardened function, fire the browser Lead inside a guard,
   and pass the same eventId plus fbp and fbc into the `/api/submit` body. The
   `setStage("submitting")`, the fetch, and the ToolComplete-after-submit
   sequence are unchanged in order relative to the network call, but the
   pre-submit Pixel work can no longer throw the submit.

### Meta tracking contract (must stay intact)

- PageView: unchanged, fires from the base snippet in `MetaPixel.tsx`.
- tool_viewed: unchanged, fires from the mount `useEffect` posting to
  `/api/track`. Independent of the freeze.
- ToolStart: still fires on the first answer, still generates one shared
  eventId passed to BOTH the browser Pixel fire and the `/api/tool-start` CAPI
  twin. Only the ordering (UI first) and the guard (cannot throw) change.
- Lead: still fires on gate submit, shared eventId to browser fire and
  `/api/submit` twin.
- ToolComplete: unchanged, after a successful submit.
- Dedup: preserved, because each event still generates its id exactly once and
  hands the same id to both the browser and the server leg.

### Risks

- A degraded fallback id is not a v4 UUID. Acceptable: Meta dedups on string
  equality of `eventID`, and both legs use the same value. Note this in a
  comment.
- Moving tracking after the state update means a user who taps extremely fast
  could unmount mid-fire. The guard swallows that. tool_viewed already proves
  the page loaded, so a rare missed ToolStart is a metrics gap, not a freeze.
- Do not gate the guard on `isPixelEnabled()` in a way that skips the
  `/api/tool-start` post. The server twin must still fire when the flag is on;
  keep the existing behavior where `trackPixelEvent` no-ops on its own when the
  flag is off, and the server post runs regardless.

### Verification (P0 is not done without the real-device test)

- Unit and type: `npm test`, `npm run typecheck`, `npm run lint` clean.
- Add a `generateEventId` unit test that stubs `crypto.randomUUID` to throw and
  asserts a non-empty id is still returned, then stubs both `randomUUID` and
  `getRandomValues` away and asserts the final fallback still returns an id.
- Simulate the failure locally: in desktop Chrome DevTools, override
  `crypto.randomUUID` to throw before answering Q1, confirm the tool still
  advances past Q1 (pre-fix it freezes, post-fix it advances).
- MANDATORY real-device test in the actual Facebook and Instagram in-app
  browsers, not desktop and not mobile Safari. Open the deployed preview URL
  from inside a Facebook post link and from inside an Instagram profile-link
  browser, on at least one older iOS device if available, tap through Q1 and
  confirm the tool advances and that a ToolStart shows in Meta Events Manager
  Test Events (when a pixel id is wired in a test environment). Desktop passing
  is not evidence for this bug. This is the specific environment that produced
  the 223-to-0 result.

### REVIEW.md gate: no. Pure runtime hardening, no gap wording, no scoring.

---

## P1. Lift the start and opt-in rates

### P1a. Open on question 1 (remove the intro Hero screen)

#### Files touched

- `components/ComplianceCheckApp.tsx` (`Stage` type, initial state,
  `handleBack`, render)
- `components/Hero.tsx` (repurpose to a slim header, or replace with a small
  inline header)

#### Approach

- Remove the `intro` stage. Initial state becomes
  `{ name: "question", index: 0 }`, so Q1 is the landing view and the
  intro-to-Q1 drop is eliminated.
- Remove `handleStart` and the intro branch of `handleBack` (Q1 no longer has
  an intro to go back to, so Q1 renders no Back control).
- Keep a minimal value-prop line above Q1, plus the logo, for trust. Repurpose
  `Hero` into a small header band (logo plus one headline line, no CTA button),
  rendered above `ProgressTrail` and the question. The old full Hero with its
  own "Start my free risk audit" button goes away.
- Preserve semantics: tool_viewed still fires on mount (the `useEffect` is
  unaffected by which stage renders first). ToolStart still fires on the first
  answer, which is now the visitor's first interaction with the tool.

#### Risks

- Losing the intro removes a soft framing beat. Mitigated by the retained
  value-prop line. This is the intended trade for removing the drop-off step.
- Ensure the ProgressTrail still reads sensibly starting at step 1 of 11.

#### Verification

- Load the page, confirm Q1 renders immediately with the value-prop line and
  logo, no separate start screen.
- Confirm tool_viewed fires once on load and ToolStart fires on the first
  option tap (Network tab: one `/api/track`, then one `/api/tool-start`).

#### REVIEW.md gate: no. Layout and framing only.

### P1b. A/B seam for the headline

#### Files touched

- New tiny module, for example `lib/copy/headline.ts` (or a constants block in
  the repurposed `Hero.tsx`)
- `app/page.tsx` (read the variant param, pass it down)
- `components/ComplianceCheckApp.tsx` and the header component (accept a
  `headlineVariant` prop)

#### Approach

- Centralize the headline copy in a `HEADLINE_VARIANTS` map, keyed by a short
  slug. Two entries to start:
  - `control`: the current fear frame, "The HR gaps exposing your California
    business, before they become a claim."
  - `dream`: a dream-outcome variant, for example "Know exactly where your
    California HR stands, in about 90 seconds." Final dream copy to be chosen by
    Noah, written to the CLAUDE.md voice rules, no banned words, no dashes.
- Select the variant from an ad-level URL param (for example `?v=dream`),
  resolved in `app/page.tsx` alongside the existing `mode` and `fbclid`
  capture, defaulting to `control` when absent or unknown. Each Meta ad links to
  its own variant URL, so attribution rolls up through the existing UTM and
  fbclid capture with no experiment framework.
- Keep the value-prop subline stable across variants, or make it a second
  optional field on the variant if desired.

#### Risks

- Marketing copy only. The dream variant must not imply a legal guarantee or
  pricing. No gap-item wording is involved.

#### Verification

- Load `/` and `/?v=dream`, confirm the headline swaps and an unknown value
  falls back to control.

#### REVIEW.md gate: no. Marketing copy and framing, not gap-item wording.

### P1c. Gate to email-required, name optional, phone kept as filed (A2P-safe)

#### Files touched

- `components/EmailGateStep.tsx`
- `components/ComplianceCheckApp.tsx` (`GateSubmission` handling only if the
  type changes)

#### Approach

- Make the NAME field optional: remove `required` from the name input and its
  label affordance. Email stays the only required field, which is the
  single-required-field gate the opt-in-rate goal wants.
- Keep the phone input and the SMS consent checkbox exactly as they are. They
  are the registered A2P 10DLC opt-in surface for the mid-resubmission Twilio
  campaign. Removing them would make the live site no longer match the filed
  message flow and risk a third rejection or an invalidated consent mechanism.
  Keep the SMS opt-in logic where it already is, gated to when a phone is
  actually entered (`smsOptIn && phone.trim().length > 0`).
- `GateSubmission.name` becomes optional (`name?: string`). Downstream already
  tolerates this: `app/api/submit/route.ts` treats `name` as optional
  (`typeof body.name === "string" ? body.name : undefined`), `lib/token.ts`
  signs an optional name, and `ReportView` and the email payload already handle
  a missing first name (the email payload falls back to "there"). No server
  changes required for this to be safe.

#### Risks

- Net-new leads who skip name lose first-name personalization in the report and
  emails until they book. Accepted per the locked decision. Personalization
  degrades gracefully to the existing "there" fallback.
- Do not touch the SMS consent copy string. It must stay in lockstep with
  `SMS_CONSENT_DISCLOSURE_TEXT` in `app/api/submit/route.ts` and the A2P filing.

#### Verification

- Submit with email only (no name, no phone), confirm the grade reveal and the
  `/api/submit` 200 with a valid `reportUrl`.
- Submit with a phone entered, confirm the consent checkbox appears and the
  consent record is still built server-side.
- Grep the consent string against `SMS_CONSENT_DISCLOSURE_TEXT` and the A2P doc
  to confirm it is byte-for-byte unchanged.

#### REVIEW.md gate: no. Form-field requiredness and layout, not gap wording.

A2P note: no re-file needed because the opt-in surface is unchanged.

### P1d. Real teaser: show the actual letter grade at the gate

#### Files touched

- `data/scoring.ts` (add a pure `gradeAnswers` helper) OR a new
  `lib/engine/grade.ts` that imports only `data/scoring.ts`
- `components/ComplianceCheckApp.tsx` (compute the grade at the gate, pass to
  the gate view)
- `components/EmailGateStep.tsx` (render the grade teaser)

#### Assessment of the client-side compute question (asked in the prompt)

The grade CAN be computed client-side for an honest teaser without leaking any
gated detail, and it is honest because it is the same deterministic result the
server recomputes on submit.

Key constraint handled: do NOT import `lib/engine/index.ts` on the client to do
this. That module imports `getGapItem` from `data/gap-library.ts`, which would
pull the gated `reportDiagnosis` and `scopeOfWork` prose into the client
bundle, letting anyone read the full report content in devtools without giving
an email, which defeats the gate. Instead add a pure `gradeAnswers(answers)`
that lives in or beside `data/scoring.ts` and depends ONLY on the point records
and `scoreToGrade`. `data/scoring.ts` imports only types and gap IDs, never the
gap prose, so the client bundle gains the letter-grade math and nothing gated.

At the gate, all 11 answers already exist (the gate renders after the last
question), so the client grade equals the server grade exactly. The teaser
shows the letter grade and optionally the `RISK_TIER_LABELS` band label. The
substance stays gated: named categories (`categoryRisks`), the verdict line,
and the full report are still only revealed after submit through
`buildOnPageResult` and the hosted report.

#### Approach

- Add `gradeAnswers(answers: ComplianceAnswers): RiskGrade` summing the
  existing `*_POINTS` and calling `scoreToGrade`, no gap-library import.
- In `ComplianceCheckApp`, when entering the gate, compute
  `gradeAnswers(answers as ComplianceAnswers)` and pass it to `EmailGateStep`.
- In `EmailGateStep`, render the letter grade prominently above the email
  field, with a line like "Your grade is a B. Enter your email to see the risk
  areas behind it and get your full report." Do not show category names or any
  gap detail here. Reuse the existing grade type only, no new gap copy.
- Optional: reuse `GradeBadge` in a compact form for visual consistency, but
  `GradeBadge` currently takes `flaggedCount`, which is category-derived. For
  the teaser, omit `flaggedCount` (the prop is already optional) so no gated
  count leaks, or render just the big letter without the badge chrome.

#### Risks

- The grade shown pre-submit must exactly match the server grade. It will,
  because both run the same `data/scoring.ts` on the same answers. Add a test
  asserting `gradeAnswers` equals `scoreComplianceAnswers(...).grade` across the
  golden-master scenarios so the two can never drift.
- Do not leak the flagged category names or the report text into the gate view.
  Keep the teaser to the letter grade and the tier band only.
- Bundle check: confirm the client chunk for the tool does not include gap
  prose after this change (search the built chunk for a known gated phrase such
  as "scope of work" or "ABC test" and confirm absent).

#### Verification

- Answer all 11, reach the gate, confirm the real letter grade shows and equals
  what the result screen shows after submit.
- Confirm no category names or report text appear before submit.
- New unit test: `gradeAnswers` matches the engine grade on every golden-master
  scenario.

#### REVIEW.md gate: no. Uses the existing grade and tier label, no gap-item

wording. Note: this surfaces the letter grade earlier than before; it is a
framing change, not a gap-wording change, so it does not trip the gate. Worth a
quick Noah eyeball since it changes the reveal sequence, but no HR sign-off.

---

## P2. Results-page deficit (the framework's core move)

All three additions go in `components/ResultView.tsx` and its data source
`lib/recommendation/index.ts`, guardrail-safe: no fix content, no pricing, no
company-specific legal verdict. Keep the existing `RiskAssessmentCTA` and
`BookingEmbed`.

### P2 shared plumbing

`OnPageResult` (in `lib/recommendation/types.ts`) and `buildOnPageResult` (in
`lib/recommendation/index.ts`) need three additions so the result view can
render the new blocks from server-computed data:

- `industryContext` (amount, framing, source) reusing `INDUSTRY_LAWSUIT_ANCHOR`,
  exactly as `buildReport` already does. No new anchor copy.
- `leadPriority` (or the qualification tag) via
  `buildQualificationTag(result.qualificationTag)`, so the VSL slot can gate on
  lead quality client-side. This is not PII.
- Nothing else. Categories and severity are already present.

Guard the existing leak test: `lib/recommendation/index.test.ts` asserts the
serialized on-page result does not contain "ABC test", "scopeOfWork", or
"Labor Code". Verify `INDUSTRY_LAWSUIT_ANCHOR.framing` and `.source` contain
none of those strings (they are the Novian Law and Hiscox lawsuit framing, so
they should not), and add an assertion that the anchor framing still reads as an
industry figure, "not a" guarantee, mirroring the existing `buildReport` test.

### P2.1. Now-vs-could-be contrast

#### Approach

Render a small two-column contrast: the visitor's current state (their
`riskTierLabel` and their flagged-category count) versus a generic compliant
benchmark (an A, "Low exposure", zero flagged areas). No fix content, no
category-specific detail, no pricing. It visualizes the gap between where they
are and a clean posture using only values the engine already produced.

#### Risks and REVIEW.md gate

New user-facing risk framing. Does not edit gap-library, so it does not
formally trip the gap-item gate, but it is liability-adjacent under CLAUDE.md
rule 5. HR-Pro eyeball recommended on the exact contrast wording before ship.
Flagged in the sign-off list.

### P2.2. Cost-of-doing-nothing line

#### Approach

One line reusing `INDUSTRY_LAWSUIT_ANCHOR` (the $200,000 figure and its
existing framing) on the result page, industry-framed only, never a BTC
guarantee. Reuse the anchor's own `framing` string verbatim so no new legal
claim is authored. This just places the existing, already-sourced anchor on the
on-page result in addition to the hosted report.

#### Risks and REVIEW.md gate

Reusing the existing anchor string verbatim means no new gap-item wording.
But putting the $200,000 figure on a new surface (pre-report) is
liability-adjacent: it must keep the "industry figure, not a BTC guarantee"
framing intact and carry the not-legal-advice disclaimer already on the result
view. HR-Pro eyeball recommended for placement and framing. Flagged in sign-off.

### P2.3. VSL slot, gated to qualified visitors, shipped dark

#### Approach

Add a VSL component that renders only when BOTH a video URL is configured (an
env var such as `NEXT_PUBLIC_VSL_URL`, unset for now) AND the visitor is
qualified (`leadPriority === "high"`, which maps to `hrSupport` of `none` or
`self_no_pro` via the existing `QUALIFICATION_TAGS`). With the env unset the
component returns null, so it ships dark until the video exists. No pricing, no
fix content.

#### Risks and REVIEW.md gate

No copy, no gap wording, renders nothing today. REVIEW.md gate: no. When the
video is later added, review its script separately; that is out of scope here.

### P2 verification

- Unit: extend `lib/recommendation/index.test.ts` so `buildOnPageResult`
  carries `industryContext` and `leadPriority`, still leaks no gated text, and
  still frames the anchor as an industry figure.
- Visual: run `/preview` scenarios, confirm the contrast and cost line render
  for a risky result, the VSL slot renders nothing with the env unset, and a
  qualified vs non-qualified answer set toggles the (empty) slot correctly when
  a placeholder URL is temporarily set locally.
- Grep the rendered result HTML for any gap prose or pricing, confirm absent.

---

## P3. Booking-link param pass-through (low priority)

Param plumbing only. No HubSpot-side work is in scope. Deferred form-question
changes stay deferred.

### Files touched

- `lib/recommendation/index.ts` (`bookingUrlWithAttribution`, and its callers
  `buildOnPageResult`, `buildReport`, `buildEmailPayload`)

### Approach

- Extend `bookingUrlWithAttribution(source, medium, prefill?)` to accept an
  optional prefill object and append HubSpot meeting prefill params when
  present: `firstname`, `lastname`, `email`, `company`, and phone if desired.
  HubSpot meeting links read these query params to prefill the scheduler.
- Split a captured full name into `firstname` and `lastname` at the call site
  (first token and the remainder), since the gate captures a single name field.
- Thread the contact into the builders that have it: `buildOnPageResult` is
  called in `app/api/submit/route.ts` where email, name, company, and phone are
  available, so pass a contact object through. `buildReport` already has
  `contactName` and `company`; add email and phone if we want the hosted-report
  booking link prefilled too.
- Keep `utm_campaign`, `utm_source`, `utm_medium` exactly as they are so
  booked-call attribution in HubSpot is unaffected.

### Important interaction to respect

The prefill params must go on the DIRECT `meetings.hubspot.com` URL that
`bookingUrlWithAttribution` builds and that `BookingEmbed` and the CTA use. Do
NOT try to carry prefill through the `/book` redirect in `next.config.mjs`: that
is a fixed 307 to a static destination and strips query params. `/book` is only
used in SMS, where the recipient already has their own info, so this is fine.

### Risks

- With name optional (P1c), net-new paid leads may have only email to prefill.
  That is still a saved field. Prefill degrades gracefully when a field is
  absent (only append params that exist).
- URL-encode all prefill values. Do not append empty params.

### Verification

- Unit test `bookingUrlWithAttribution` with and without a prefill object,
  asserting the UTM params are always present and the prefill params appear only
  when provided and are URL-encoded.
- Manually open a generated booking URL and confirm the HubSpot scheduler
  prefills the provided fields.

### REVIEW.md gate: no. Pure URL plumbing.

---

## Consolidated risk section

- P0 is the only launch-blocking item. Until the real FB and IG in-app browser
  test passes on a real device, treat starts as still broken regardless of
  desktop results. Do not judge P0 fixed from desktop.
- Do not break the shared-eventId dedup. Every tracking change must keep one id
  per event, shared by the browser fire and the server twin.
- Do not disturb the A2P opt-in surface. The phone field and the exact SMS
  consent string stay as filed while the Twilio campaign is mid-resubmission.
- Do not leak gated content client-side. The P1d teaser must use the
  scoring-only grade path, never import the engine or gap-library into the
  client. Verify the built client chunk contains no gap prose.
- P2 introduces new risk and consequence copy. Keep it industry-framed, no
  pricing, no company-specific legal verdict, disclaimer present. Get an HR-Pro
  eyeball before ship even though it does not formally trip the gap-item gate.
- Do not touch `data/gap-library.ts` gap-item wording or `data/scoring.ts`
  weights and bands in any of this work, so the formal REVIEW.md gate stays
  clear.
- Env flags stay as they are per CLAUDE.md hard gates: `NEXT_PUBLIC_ENABLE_PIXEL`
  and `NEXT_PUBLIC_META_PIXEL_ID` are only turned on in a test environment for
  the P0 Events Manager check, never silently flipped in production here.
  `NEXT_PUBLIC_VSL_URL` stays unset so the VSL ships dark.

---

## Consolidated test plan

Automated, run for real and capture output:

- `npm test`, `npm run typecheck`, `npm run lint`, and
  `npm run format:check` clean.
- New tests:
  - `generateEventId` returns a usable id when `crypto.randomUUID` throws and
    when both `randomUUID` and `getRandomValues` are unavailable.
  - `gradeAnswers` equals `scoreComplianceAnswers(...).grade` on every
    golden-master scenario.
  - `buildOnPageResult` now carries `industryContext` and `leadPriority`, still
    contains no gated text, and still frames the anchor as an industry figure.
  - `bookingUrlWithAttribution` appends prefill params only when provided, keeps
    UTMs always, and URL-encodes values.
- Em and en dash grep across the repo stays clean (rule text mentions in the
  three docs excepted, as VERIFICATION.md already records).

Manual, local dev (`next dev`):

- Q1 renders as the landing view, tool_viewed then ToolStart fire once each.
- Email-only submit works end to end and returns a valid report URL.
- The letter-grade teaser at the gate matches the post-submit grade, with no
  category or report text visible pre-submit.
- Result page shows the contrast, the cost-of-doing-nothing line, and no VSL
  (env unset), with the disclaimer present and no pricing or gap prose.
- A generated booking URL prefills the HubSpot scheduler.

Mandatory real-device test (P0 gate):

- Open the deployed preview from inside the Facebook in-app browser and the
  Instagram in-app browser, ideally on an older iOS device, tap through Q1, and
  confirm the tool advances and ToolStart is observed in Meta Events Manager
  Test Events when a pixel id is wired in that test environment. Desktop and
  mobile Safari do not count for this gate.

Production build note:

- `next build` fails locally on this exFAT plus Node 24 setup (documented in
  VERIFICATION.md section 10). Confirm a clean `vercel build` or a real Vercel
  preview deploy rather than relying on the local build.

---

## Items requiring REVIEW.md HR-Pro sign-off before they can ship

Formal gap-item wording gate re-triggered by this plan: none. No item edits
`data/gap-library.ts` gap-item wording or `data/scoring.ts` weights or bands.

Liability-adjacent copy that should get an HR-Pro eyeball before ship (new
user-facing risk and consequence framing under CLAUDE.md rule 5, rule 1, and the
$200,000 anchor rule), even though it does not formally trip the gap-item gate:

- P2.1 now-vs-could-be contrast wording.
- P2.2 cost-of-doing-nothing line placement and framing (reuses the existing
  anchor string, so the review is placement and framing, not new legal text).

Optional non-HR eyeball (Noah, not HR-Pro):

- P1b final dream-outcome headline copy.
- P1d change to the reveal sequence (letter grade now shown at the gate).

Everything else (P0, P1a, P1c, P1d mechanics, P2.3 dark VSL, P3) ships without
sign-off.

---

## Suggested execution order

1. P0 both changes, then the real-device FB and IG test. Do not proceed to ship
   anything else to ad traffic until P0 passes on device.
2. P1a, P1b, P1c, P1d together (they all touch the same two or three components
   and the gate).
3. P2 plumbing then the three result blocks, with the HR-Pro eyeball on P2.1 and
   P2.2 before those two go live.
4. P3 last, low priority.
