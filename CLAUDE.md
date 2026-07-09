# BTC California HR Risk Audit, Project Instructions

## Mission

Give a small or mid-sized California business owner an honest, instant read on
their HR compliance exposure in about 60 to 90 seconds, then make the risk
they cannot currently see feel real and specific to them. This is a Meta
paid-ads lead magnet. The visitor answers 9 questions and gets an on-screen
A-F risk grade with named (not detailed) gap categories, plus a free 30-minute
HR discovery call booked immediately below the grade. After they give an
email, a short transactional email links to a personalized, hosted audit
report page: the full diagnosis of every gap they triggered and the complete
named scope of work required to fix it. The report never hands over the
actual fix (the compliant handbook language, the reclassification steps, the
policy text), because that is the paid deliverable and the reason to book.
The tool reads as a diagnostic instrument, not a quiz: an owner should be
willing to screenshot the grade and show their business partner.

A 9th question (new-hire paperwork, question 8 in the flow) was added
2026-07-09 as a deliberate, reviewed spec change (see the "we are updating
the graceful stardust" plan, Part A). At the same time, the HR-support
question (question 9, the qualifying screen) was changed to contribute zero
scoring weight: it is now purely a lead-fit tag via
`buildQualificationTag()`/`qualificationTag` and never moves the grade.

## Report philosophy, the core strategic call, non-negotiable

Every gap item in `data/gap-library.ts` has three layers. Only two are ever
shown to a prospect:

1. **Diagnosis** (what it is, why it matters, cost/consequence context). Shown
   in full, in the emailed hosted report. This is the trust-builder.
2. **Scope of work** (the complete named list of tasks required to close the
   gap). Shown in full, in the emailed hosted report. This is what makes the
   execution gap real: seeing the whole list is what convinces an owner they
   will not do this themselves. Revealing more scope sells the call harder,
   it does not undercut it.
3. **Work product** (the actual compliant handbook language, the
   reclassification mechanics, the policy text, the training rollout plan).
   **Never shown anywhere, ever.** This is the paid deliverable.

Reveal real, sourced complexity. Do not manufacture drama or inflate risk to
look scarier than the law actually is. California employment law is already
genuinely overwhelming for an owner at this size; naming it accurately does
the selling. Exaggerated claims fail the moment an employment attorney or a
skeptical owner reads the report, and that failure costs more trust than an
honest report gains in urgency.

## Absolute rules, non-negotiable

1. No BTC pricing anywhere, ever. No tiers, fees, dollar figures, ranges, in
   code, UI copy, email copy, or comments. Pricing is discussed only live, on
   a call with an HR Pro. If unsure whether something counts as pricing,
   leave it out and route to the call.
2. No em dashes or en dashes anywhere. Not in code comments, UI copy, email
   copy, or HTML entities (`&mdash;`, `&ndash;` count as violations). Use a
   comma, a period, or rewrite the sentence. Grep before every "done."
3. Never invent a BTC fact, number, service, or compliance claim. Every BTC
   fact traces to a named source file, cited in a comment where it is used.
4. Every external (non-BTC) legal fact traces to a cited, dated source (named
   statute/regulation, enforcing agency, `lastVerified` date) in
   `data/gap-library.ts`. CONFIRMED vs UNVERIFIED is encoded in code, not
   just documentation, and never silently presented as equally solid.
5. The tool names general risk areas only. It never tells a specific company
   it is violating a specific law as settled legal fact. Every gap statement
   is written as "companies at this size/profile generally face X," never
   "you are violating X."
6. The scoring model must be able to award an honest A or B grade to a
   genuinely clean business. It is not rigged to fail everyone. A rigged
   grade is detectable and destroys the trust the funnel depends on.
7. No LLM anywhere on the path that produces the grade or the gap list.
   Scoring is a deterministic, client-side rules engine.
8. Assume the first version of any scoring weight is wrong. Hand-reconcile at
   least three full scenarios against the engine before trusting it.
9. Not legal advice. Say so visibly on every screen that shows a grade or a
   gap. HR-Pro sign-off (LeiLani/Genevieve) on the scoring library and every
   gap-item wording is a liability gate before real prospects reach it, see
   `REVIEW.md`.
10. Not done until `VERIFICATION.md` is complete with real evidence.

## Architecture

- `lib/engine/`: pure, UI-free, unit-tested TypeScript scoring engine.
  Answers in, `{grade, score, perCategoryRisk, triggeredGapIds}` out. No
  React, no DOM, no network. Imports every weight from `data/scoring.ts`,
  never inlines a number.
- `data/scoring.ts`: every question, every answer option, its risk points,
  the A-F band cutoffs. Single source of truth for the math. First-draft
  proposal, explicitly flagged pending HR-Pro calibration.
- `data/gap-library.ts`: the human-vetted gap-item library. Each item has an
  `id`, `category`, `jurisdiction`, `severity`, `triggerConditions`,
  `onPageStatement` (short, named-category only), `reportDiagnosis` (full),
  `scopeOfWork` (full, no how-to), `complianceAngle`, and a `sourceRef` citing
  either `btc-kb-lead-magnets.md` section 6 or a named external legal source
  with a `lastVerified` date. Modeled on the handbook-grader's
  `raw-items.json` + `tag-rules.ts` pattern.
- `lib/recommendation/`: pure, tested. `buildOnPageResult()` returns the
  gated, named-categories-only view. `buildReport()` returns the full
  diagnosis-plus-scope-of-work hosted report. `buildEmailPayload()` builds
  the transactional email's merge fields and the signed report URL.
  `buildQualificationTag()` reads Q9 (HR support) into a lead-quality tag
  that never moves the grade at all (zeroed out 2026-07-09).
- `lib/token.ts`: HMAC-signs the answer set into a URL-safe token so
  `/report/[token]` is stateless and tamper-evident: no database, the report
  page recomputes the result by re-running the pure engine on the decoded
  answers.
- `components/`: presentation only, renders whatever engine/recommendation
  return.
- `app/`: Next.js routes. `/` is the landing page and tool (paid mode).
  `/report/[token]` is the hosted audit report. `/api/submit` receives the
  email/phone gate, signs the token, and POSTs to the n8n webhook.
  `/preview` holds seeded scenarios for local QA.
- `channels/`: thin adapters. Paid mode is fully built (the only mode that
  ships now). Email mode (future, pre-filled, ungated) has its type/adapter
  seam stubbed, not implemented.
- `content/emails/`: the transactional report email and the 3-4 email
  nurture sequence, plain text, HubSpot-ready, sourced the same as the app.
- `ops/n8n-workflow.md`: the live delivery pipeline's node map, field
  mappings, event names, and go-live gate status.

## Brand tokens (orange is NOT a brand color, do not use it anywhere)

```css
:root {
  --btc-teal: #17aa96;
  --btc-teal-dark: #0f6f62;
  --btc-gray: #676766;
  --btc-white: #ffffff;
  --btc-gold: #c2a268;
  --btc-surface: #f5f8f7;
  --btc-ink: #14211e;
  --btc-instrument: #0b211d;
  --btc-instrument-line: rgba(255, 255, 255, 0.12);
}
```

The four `--btc-surface`/`--btc-ink`/`--btc-instrument`/`--btc-instrument-line`
tokens were added 2026-07-09 in the design overhaul below (see
`app/globals.css` and the `surface`/`ink`/`instrument` entries in
`tailwind.config.ts`). `--btc-surface` is the page background (a near-white
teal-tinted surface, not cream). `--btc-ink` is the primary text/heading
color. `--btc-instrument` is the deep-teal near-black panel background used
for the grade-reveal scorecard and other "instrument panel" surfaces,
paired with `--btc-instrument-line` for hairline borders on that dark
surface. Risk and urgency emphasis is carried by deep-teal shades, type
weight, and iconography, never by a new hue.

Fonts: Spectral (display/heading serif, replaced Fraunces 2026-07-09) plus
Inter (body/UI sans, unchanged). This is a diagnostic instrument, not a
quiz: confident type, generous spacing, real hierarchy.

**2026-07-09 design pass note:** a full design overhaul happened this
session, per Noah's direct feedback: the old cream/Fraunces "AI tell"
aesthetic was replaced with the teal-instrument/Spectral system above,
grade-first framing was removed from the hero copy, the on-page score line
and report link were removed from the grade reveal, the grade reveal was
rebuilt as an instrument-panel scorecard, a loss-aversion CTA was added,
and the hosted report page was rebuilt as the funnel's highest-perceived-
value asset. See commit history (`git log --oneline`) for the individual
changes. A future session should treat the current code, not this
document's older prose elsewhere, as the source of truth for anything not
explicitly called out as still-first-draft.

## Voice

Direct, knowledgeable, a little urgent on risk points. Trusted-advisor, not
salesperson. Lead with the specific consequence, not "most businesses."
Banned words: navigate, clarity, high-touch, values-driven, thoughtful,
meaningful, empower, journey, holistic, elevate, impactful, foster. No em or
en dashes.

## Geo: California-first, built to generalize

Question 2 (states employed in) and every `gap-library.ts` item's
`jurisdiction` field (`CA` | `federal` | `multi-state` | `not-legal-requirement`)
exist so a federal-baseline-plus-state-overlay model can be added later
(New York and other high-regulation states, month 2-3) without a rewrite. Do
not hardcode "California" into logic that should be data. Launch content is
CA-framed to match CA-targeted paid ads, per the buildspec's 2026-07-08 geo
decision.

## The channel mode (paid ships now, email is a future seam)

- Paid mode (default, no `mode` param needed): anonymous visitor from a Meta
  ad. Fully self-contained. Answers all 9 questions, one per view, with a
  visible progress indicator. A single light gate (email required, phone
  optional with an explicit SMS opt-in) sits at the grade reveal.
- Email mode (`?mode=email&...`, future): pre-filled from firmographics,
  ungated first reveal. Only the adapter type/seam is stubbed in
  `channels/`, not implemented.
- On email save: fires `tool_complete` (also referred to as
  `calculator_completed` in shared BTC event-naming convention) server-side
  only after the email validates, POSTs the full submission to
  `COMPLIANCE_CHECK_WEBHOOK_URL` (env-driven, never hardcoded), captures
  `fbclid` from the URL and stores it with the payload.
- Meta Pixel client-side event firing (PageView, ToolStart, Lead,
  ToolComplete) is wired but feature-flagged OFF by default
  (`NEXT_PUBLIC_ENABLE_PIXEL`). Server-side CAPI is not built yet, a future
  phase. Never hardwired pixel IDs.
- Booking CTA everywhere: `https://meetings.hubspot.com/bethechangehr/discoverycall`
  (also read from `NEXT_PUBLIC_BOOKING_URL`).
- `/preview` route with seeded scenarios (including the three hand-reconciled
  golden-master scenarios) for local QA.

## The delivery pipeline (built and test-fired: see status below)

`app/api/submit` -> n8n webhook -> HubSpot contact upsert (grade, numeric
score, triggered gap IDs, all 9 answers, Q9 qualification tag,
`source=meta-paid`, `fbclid`, signed report URL) -> transactional report
email (HubSpot primary, n8n-fallback sender path staged since HubSpot's
transactional-send capability is confirmed not currently enabled) -> SMS via
Twilio if phone plus opt-in -> compressed 3-4 email nurture over 7-10 days,
built as a native HubSpot workflow rather than n8n Wait nodes (see
`ops/n8n-workflow.md` for why). The app side of this (the webhook POST from
`app/api/submit`, validated and tested) is done. The n8n workflow and
HubSpot property schema are built, published, and test-fired with a test
contact, 2026-07-09, see `VERIFICATION.md` section 7 for full evidence. The
live production webhook is
`https://btchr.app.n8n.cloud/webhook/compliance-risk-check`. The email leg
(Send Report Email nodes) and SMS leg (Twilio node) are scaffolded and
correctly wired but disabled, since neither a real HubSpot transactional
scope/template nor a Twilio credential exist yet. Not connected to real ad
traffic until the Hard Gates below clear.

## Hard gates before this reaches a real prospect (do not resolve, flag status)

0. Resolved 2026-07-09. The n8n and HubSpot MCP connectors were
   authorized and confirmed live, and the delivery pipeline in
   `ops/n8n-workflow.md` was built, published, and test-fired with a
   test contact. See `VERIFICATION.md` section 7 for full evidence.
1. HubSpot transactional-send capability: confirmed **not enabled**,
   2026-07-09, not merely unconfirmed. A real test-fire against
   HubSpot's transactional email API returned a scope-forbidden error
   (see `VERIFICATION.md` section 7.6). Noah needs to either grant the
   HubSpot Service Key app the transactional-email scope or create a
   real transactional email template and provide its ID. n8n-fallback
   (SMTP) path is built but disabled, pending a real SMTP credential.
2. HR-Pro sign-off (LeiLani/Genevieve) on every scoring weight, band cutoff,
   and gap-item wording, liability gate, see `REVIEW.md`.
3. Genevieve's pain-point/qualification-signal list to sharpen Q9 and the
   lead-quality tag wording, seam left clean in `buildQualificationTag()`.
4. Booking routing decision (round-robin vs. LeiLani-only), unresolved. Uses
   the existing single booking link only, no scheduler changes made.
5. Meta pixel/CAPI events live before spend, still unresolved. As of
   2026-07-09, client-side Pixel firing is wired end to end
   (`components/MetaPixel.tsx` conditionally injects the base snippet,
   `channels/pixel.ts`'s `trackPixelEvent()` fires `ToolStart`, `Lead`, and
   `ToolComplete` from `components/ComplianceCheckApp.tsx`, PageView fires
   from the base snippet itself), but `NEXT_PUBLIC_ENABLE_PIXEL` is `false`
   (`.env.local`, `.env.example`) and `NEXT_PUBLIC_META_PIXEL_ID` is unset
   everywhere, so nothing fires. Server-side CAPI is not built at all, out of scope for this
   session, a separate future integration requiring a Meta access token.
   Do not set either env var to a real value before this gate clears.
6. Site geo-consistency (the funnel's landing page must not contradict BTC's
   confirmed all-50-state service area), owned by the site/IT vendor, not
   this app.

## Definition of done (the gate)

See `VERIFICATION.md` for the full evidence-backed checklist: test output,
three hand-reconciled scenarios, gap-item source-mapping table, em/en dash
grep, BTC-pricing scan, proof a clean business can score A/B, both the
on-page result and the hosted report exercised end to end, pipeline
test-fire evidence (HubSpot test contact, report email delivered), mobile/a11y
spot check, lint/typecheck/format output. See `REVIEW.md` for the human
HR-Pro sign-off checklist before this reaches real prospects.

## Sources

- `D:/claude/_PROJECTS/clients/BTC/cold-email/btc-paid-ads-campaign-buildspec-v1-2026-07-08.md`
  (primary spec: the 8 questions, scoring approach, result design, tech
  stack, geo decision, hard gates)
- `D:/claude/_PROJECTS/clients/BTC/build/btc-funnel-spec-final-2026-07-06.md`
- `D:/claude/_PROJECTS/clients/BTC/build/btc-reverse-magnet-tech-stack-and-flows-2026-07-06.md`
- `D:/claude/_PROJECTS/clients/BTC/knowledge-base/btc-kb-lead-magnets.md`
  (section 6: compliance angles and fear-based content framework, the
  primary source for gap-item wording and voice)
- `D:/claude/_PROJECTS/clients/BTC/strategy/btc-source-of-truth.md`
  ($200K industry lawsuit anchor, booking link, always cited as an industry
  figure, never a BTC guarantee)
- `D:/claude/_PROJECTS/clients/BTC/knowledge-base/btc-kb-client-facing.md`
- `D:/claude/_PROJECTS/clients/BTC/brand-and-voice/btc-brand-kit.md`
  (colors, corrected 2026-07-06: orange removed, it is not a brand color)
- `D:/claude/_PROJECTS/clients/BTC/cold-email/btc-lead-magnets-sequences.html`
  (prior copy for the "CA HR Compliance Checker," used as a copy-sharpening
  starting point only; its stale orange CSS and its 90-day close-cycle claim
  are not carried forward, see Deviations below)
- External legal sources, each cited individually with `lastVerified` in
  `data/gap-library.ts`: California Civil Rights Department (CRD), CA
  Department of Industrial Relations (DIR), California Labor Code and
  Government Code text via leginfo.legislature.ca.gov, US DOL Wage and Hour
  Division. Research pass conducted 2026-07-08.

## Discrepancies found in source material, not silently resolved

- `btc-kb-lead-magnets.md` and `btc-lead-magnets-sequences.html` both call
  this tool a "10-question checklist." The buildspec (2026-07-08, most
  recent and detailed) says 8 questions and is authoritative here. Flagged
  for LeiLani, not resolved by this agent.
- The prior HTML's "about 90-day sales cycle" claim is stale;
  `btc-source-of-truth.md`'s dashboard-confirmed 42 days is correct. Not
  directly used by this tool's logic, noted so it is not miscited if reused
  in email copy.

## Tool name

Recommended and built with: **"California HR Risk Audit."** Already the
internal working name in the tech-stack doc, so it keeps naming consistent
across BTC's own planning docs rather than introducing a third name.
Distinct from the live call's existing name ("HR Risk Assessment") while
signaling it is the free preview of that. Flagged pending LeiLani sign-off,
trivial to rename since it only touches copy and metadata.
