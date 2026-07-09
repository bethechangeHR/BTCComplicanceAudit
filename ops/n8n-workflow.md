# Delivery pipeline: n8n workflow + HubSpot wiring

**Status as of 2026-07-09, pipeline audit and fix:** a full read-only audit
of the live workflow, its execution history, the live HubSpot portal, and
the Slack channel found that the pipeline **already works end to end** for
everything except email. Real evidence, not a manual test-fire: execution
`166` (2026-07-09T19:42Z) was a genuine `tool_complete` submission through
the live production form, and it correctly upserted a real HubSpot contact
(ID `10054`) with every `compliance_check_*`/`cc_*` property populated. This
is the first real (non-test-fire) end-to-end proof this pipeline has had.
See `VERIFICATION.md` for the full audit write-up.

Two things were fixed as a direct result of that audit:

- **Slack notifications are now live.** The `Notify Slack: New Submission`
  node was already correctly built and wired into the published workflow,
  just individually `disabled: true`. Flipped to enabled and republished
  (`activeVersionId 8981beb3-445f-4a4a-b30e-0c1c95ee0801`), confirmed the
  *active* version reflects it, not just a draft (the same mistake the
  original build flagged as a risk).
- **The broken HubSpot transactional-email node is now disabled.** It was
  live but always erroring on the missing scope (confirmed again on
  execution 166, same `Forbidden - perhaps check your credentials?` error as
  the original test-fire). Rather than keep chasing that scope grant, the
  email strategy has changed, see below.

**Email strategy changed: marketing email via a native HubSpot workflow,
not the transactional API.** Noah's HubSpot AI Assistant recommends using
marketing email instead of the transactional-send API (included in his
plan, no scope blocker). This extends the pattern already chosen for the
nurture sequence (see "Nurture sequence" section below) to cover the first
report email too: one native HubSpot workflow, not a second n8n send path.
n8n's job for email is already complete once it upserts the contact with
`compliance_check_report_url` and `compliance_check_grade` set; HubSpot's
own workflow tool takes it from there. **This is a manual HubSpot-UI build
task for Noah or LeiLani**, not something buildable through the n8n or
HubSpot MCP tools available here (no "create workflow" / "create marketing
email" tool exists in the connected toolset). See the checklist below.

**Also fixed in the same session**: the app never actually collected the
submitter's name or company (`components/EmailGateStep.tsx` only had
email/phone fields). Every downstream piece, `app/api/submit/route.ts`,
`lib/token.ts`, `ReportView.tsx`, and this workflow's `Normalize Payload`
and `Upsert HubSpot Contact` nodes, already expected and used `name`/
`company`, so this was a two-file app fix (collect the fields, thread them
into the submit payload), not a pipeline change.

Do not connect real ad traffic to this pipeline before:

1. The marketing-email workflow described below is built in HubSpot and
   confirmed sending. SMS is also disabled, pending a Twilio credential
   (explicitly out of scope for this fix, per Noah).
2. HR-Pro sign-off clears (see `REVIEW.md`).
3. Noah or LeiLani builds the HubSpot marketing-email workflow (see
   "HubSpot marketing-email workflow, manual build task" below).

## What the app already does (built and tested, see VERIFICATION.md)

`app/api/submit/route.ts` validates the answer set and email, recomputes the
grade server-side, signs a stateless report token, and POSTs the following
JSON body to `COMPLIANCE_CHECK_WEBHOOK_URL` (read from environment, never
hardcoded):

```json
{
  "event": "tool_complete",
  "mode": "paid",
  "timestamp": "2026-07-08T18:21:52.421Z",
  "email": "owner@example.com",
  "phone": "5555550123",
  "smsOptIn": true,
  "company": "Acme Co",
  "name": "Jordan",
  "fbclid": "...",
  "answers": {
    "headcount": "10-49",
    "states": "california_only",
    "contractorUse": "mostly",
    "salariedClassification": "all_salaried",
    "handbookStatus": "none",
    "harassmentTraining": "no",
    "leaveProcess": "no",
    "hrSupport": "none"
  },
  "grade": "F",
  "score": 39,
  "maxPossibleScore": 49,
  "triggeredGapIds": [
    "gap-1099-mostly",
    "gap-exempt-all",
    "gap-handbook-none",
    "gap-training-none",
    "gap-leave-none"
  ],
  "qualificationTag": "none",
  "reportUrl": "https://<site>/report/<signed-token>",
  "source": "meta-paid"
}
```

`app/api/track/route.ts` POSTs a lighter, PII-free event for the ungated
tool-open signal:

```json
{ "event": "tool_viewed", "mode": "paid", "timestamp": "...", "fbclid": "..." }
```

Everything from here down is what the n8n workflow needs to do with those
two events.

## n8n workflow node map

1. **Webhook trigger** (POST). Path: something like
   `/compliance-risk-check`. This URL becomes
   `COMPLIANCE_CHECK_WEBHOOK_URL` in the app's environment once created.
   Responds `200 {"received": true}` immediately (respond-immediately mode),
   the rest of the workflow runs async so the visitor's page never waits on
   HubSpot/Twilio latency.
2. **Switch/IF node** on `{{$json.event}}`: routes `tool_viewed` down a
   short branch (see step 6) and `tool_complete` down the main branch (steps
   3 to 5).
3. **HubSpot node, upsert contact by email.** Create the contact if new,
   update if existing (a repeat visitor who retakes the tool). Standard
   properties: `email`, `firstname` (from `name`, best-effort split),
   `company`. Custom properties (see schema below): `compliance_check_grade`,
   `compliance_check_score`, `compliance_check_max_score`,
   `compliance_check_gap_ids`, `compliance_check_qualification_tag`,
   `compliance_check_report_url`, `compliance_check_source`, `fbclid`, plus
   one property per question so the raw answers are queryable
   (`cc_headcount`, `cc_states`, `cc_contractor_use`,
   `cc_salaried_classification`, `cc_handbook_status`,
   `cc_harassment_training`, `cc_leave_process`, `cc_hr_support`).
4. **IF node**: `{{$json.smsOptIn}}} === true AND {{$json.phone}}` is set.
   - True branch: **Twilio node**, send SMS using
     `content/emails/transactional-report.txt` condensed to SMS length
     (short recap plus `reportUrl` and `bookingUrl`, no full report body).
   - Both branches continue to step 5.
5. **Email send: disabled, superseded by a native HubSpot workflow.**
   Two nodes exist as historical scaffold, both `disabled: true`:
   - `Send Report Email (HubSpot)`: an HTTP Request node calling HubSpot's
     transactional-send API directly. Confirmed twice now (original test-fire
     and again on real execution 166) that this app token does not have the
     required scope. Disabled 2026-07-09 rather than left erroring on every
     execution.
   - `Send Report Email (SMTP Fallback)`: never had a credential, dead
     branch, left disabled.
   - **Current plan**: email is sent by a native HubSpot marketing-email
     workflow instead, triggered off the contact properties this workflow
     already sets (`compliance_check_report_url`, `compliance_check_grade`).
     See "HubSpot marketing-email workflow, manual build task" below. n8n
     does not need a new node for this, the contact is already fully
     populated by the time HubSpot's own workflow would enroll it.
6. **`tool_viewed` branch**: a lighter HubSpot node that logs the view as an
   engagement/note on the contact if one already exists by fbclid or email,
   or simply no-ops if the visitor has not converted yet. This is the
   ungated interest-signal event, it should never block on finding a
   contact.
7. **Slack notification branch**: a parallel output off `Upsert HubSpot
   Contact` (does not block the SMS/email branch), node `Notify Slack: New
   Submission`, posts to `#btc-risk-audit-alerts` (channel ID
   `C0BG9RE3QDQ`, created 2026-07-09) with name, company, email, grade,
   score, gap count, HR-support qualification tag, source, and report URL.
   Built 2026-07-09 using the existing "BTC Slack" credential
   (`R5amYUiLnbdeUVRR`). **Live as of 2026-07-09**: enabled and republished
   (`activeVersionId 8981beb3-445f-4a4a-b30e-0c1c95ee0801`), confirmed the
   *active* version reflects it via `get_workflow_details`, not just a
   draft. Now that `name`/`company` are actually collected by the app (see
   above), these fields will populate for real going forward instead of
   showing blank.

## HubSpot marketing-email workflow, manual build task

Not buildable through the connected n8n or HubSpot MCP tools (no "create
workflow" / "create marketing email" tool exists in either toolset). A
manual task in the HubSpot UI for Noah or LeiLani, folding the previously
separate "send the report email" and "build the nurture workflow" tasks
into one build:

1. Create the report email as a HubSpot marketing/automated email using
   `content/emails/transactional-report.txt` as the copy source. Merge
   fields already computed and available on the contact record:
   `firstname`, `company`, `compliance_check_grade`,
   `compliance_check_report_url`, plus the standard booking link
   (`https://meetings.hubspot.com/bethechangehr/discoverycall`, already
   UTM-tagged per "Booked-call attribution" below when sent from the app's
   own booking CTAs, use the plain link or the same UTM pattern for this
   email).
2. Build one contact-based HubSpot workflow: enrollment trigger
   `compliance_check_report_url is known` (or `compliance_check_source is
   known`, either works since both are set together by `Upsert HubSpot
   Contact`). First step sends the email from (1) immediately. Following
   steps: the existing nurture-1 through nurture-4 sequence
   (`content/emails/nurture-1-recap.txt` through `nurture-4-breakup.txt`),
   day 1 through day 10, using the literal per-email booking URLs already
   listed under "Booked-call attribution" below. Unenroll on reply or
   `lead_meeting_booked`.
3. Once built, re-run the verification test-fire in `VERIFICATION.md` and
   confirm the email actually lands, then update this file and
   `VERIFICATION.md` with real delivery evidence before connecting real ad
   traffic.

## Booked-call attribution: connecting a call back to this campaign

Added 2026-07-09. HubSpot's meetings tool auto-populates three default
contact properties whenever a visitor books through a link that carries
UTM params: `engagements_last_meeting_booked_campaign`,
`engagements_last_meeting_booked_source`, and
`engagements_last_meeting_booked_medium`. No new infrastructure was needed,
just consistent UTM tagging on every booking link this funnel emits.

`lib/recommendation/index.ts` now has a `bookingUrlWithAttribution(source,
medium)` helper. `utm_campaign` is fixed at `ca-hr-risk-audit` everywhere
(so every booked call from this funnel rolls up under one campaign value),
`utm_source` identifies the exact touchpoint, `utm_medium` is `web` or
`email`:

| Touchpoint               | Built by       | utm_source            | utm_medium |
| ------------------------- | -------------- | ---------------------- | ---------- |
| On-page CTA (grade reveal) | `buildOnPageResult()` | `landing-page-cta`     | `web`      |
| Hosted report page         | `buildReport()`       | `hosted-report`        | `web`      |
| Transactional report email | `buildEmailPayload()` | `transactional-email`  | `email`    |

Because the contact record already carries `fbclid` and
`compliance_check_source` from the original `tool_complete` submission, and
HubSpot matches the meeting booking to that same contact by email, a booked
call ties back to both the originating Meta ad (`fbclid`) and this specific
campaign (`utm_campaign=ca-hr-risk-audit`) on one contact record, no manual
reconciliation needed.

**The 4 nurture emails are the one gap**, since they are authored directly
in HubSpot's UI (not by this app's code, see below), so their `{{bookingUrl}}`
merge field needs a literal URL pasted in per email rather than a computed
one. Whoever builds that HubSpot workflow should use:

- nurture-1-recap: `https://meetings.hubspot.com/bethechangehr/discoverycall?utm_campaign=ca-hr-risk-audit&utm_source=nurture-1-recap&utm_medium=email`
- nurture-2-top-risk-insight: `https://meetings.hubspot.com/bethechangehr/discoverycall?utm_campaign=ca-hr-risk-audit&utm_source=nurture-2-top-risk-insight&utm_medium=email`
- nurture-3-proof: `https://meetings.hubspot.com/bethechangehr/discoverycall?utm_campaign=ca-hr-risk-audit&utm_source=nurture-3-proof&utm_medium=email`
- nurture-4-breakup: `https://meetings.hubspot.com/bethechangehr/discoverycall?utm_campaign=ca-hr-risk-audit&utm_source=nurture-4-breakup&utm_medium=email`

If `NEXT_PUBLIC_BOOKING_URL` is ever changed from the default, rebuild these
four literal URLs from the new base rather than reusing the ones above.

## Nurture sequence: handled by HubSpot's own workflow tool, not n8n waits

The 4-email nurture sequence (`content/emails/nurture-1-recap.txt` through
`nurture-4-breakup.txt`, spanning day 1 through day 10) is deliberately
**not** built as a chain of n8n Wait nodes. Reasoning: n8n Wait nodes across
multiple days are fragile to rebuild/redeploy and harder to see the state
of at a glance, while HubSpot's native workflow tool already has
day-based delay steps, enrollment/unenrollment on reply or booking, and a
visual view LeiLani or Genevieve can actually read without touching n8n.

Once the HubSpot contact is upserted in step 3 with
`compliance_check_grade` and `compliance_check_report_url` set, a native
HubSpot workflow (built directly in the HubSpot UI, not by this agent, see
`CLAUDE.md`'s "do not make any live change to HubSpot scheduling" boundary
which applies to the booking calendar, not to authoring a nurture workflow)
enrolls the contact and sends nurture-1 through nurture-4 on the day-based
schedule, unenrolling automatically if `lead_meeting_booked` fires or the
contact replies. This is a one-time HubSpot workflow setup task for
whoever owns that portal, not a per-lead n8n execution.

## HubSpot custom contact property schema (create before first live send)

| Internal name                                                                                                                                                       | Label                       | Type                                        | Notes                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `compliance_check_grade`                                                                                                                                            | Risk Audit Grade            | Single-line text (or enumeration A/B/C/D/F) |                                                                                          |
| `compliance_check_score`                                                                                                                                            | Risk Audit Score            | Number                                      |                                                                                          |
| `compliance_check_max_score`                                                                                                                                        | Risk Audit Max Score        | Number                                      | Constant today (49), kept as its own property since `data/scoring.ts` weights may change |
| `compliance_check_gap_ids`                                                                                                                                          | Risk Audit Flagged Gap IDs  | Multi-line text                             | Comma-joined `triggeredGapIds`, for filtering/segmentation                               |
| `compliance_check_qualification_tag`                                                                                                                                | Risk Audit HR Support       | Enumeration (`in_house`, `outside`, `none`) | Powers lead-priority segmentation, see `lib/recommendation/copy.ts` `QUALIFICATION_TAGS` |
| `compliance_check_report_url`                                                                                                                                       | Risk Audit Report URL       | Single-line text                            |                                                                                          |
| `compliance_check_source`                                                                                                                                           | Risk Audit Source           | Enumeration (`meta-paid`, `email`)          |                                                                                          |
| `fbclid`                                                                                                                                                            | Facebook Click ID           | Single-line text                            | Required for CAPI/Pixel attribution of a later booked call, do not skip                  |
| `cc_headcount`, `cc_states`, `cc_contractor_use`, `cc_salaried_classification`, `cc_handbook_status`, `cc_harassment_training`, `cc_leave_process`, `cc_hr_support` | Risk Audit: (question name) | Enumeration, one per question               | Raw answers, each option set matches the literal values in `lib/engine/types.ts`         |

## Go-live checklist

- [x] n8n and HubSpot MCP connectors authorized and confirmed live,
      2026-07-09 (see `VERIFICATION.md` section 7.1).
- [ ] Webhook node created (done, live at
      `https://btchr.app.n8n.cloud/webhook/compliance-risk-check`), URL
      set as `COMPLIANCE_CHECK_WEBHOOK_URL` in Vercel's environment
      variables (not yet done, never committed to the repo).
- [x] All 16 custom HubSpot properties above created and verified live,
      2026-07-09 (see `VERIFICATION.md` section 7.2).
- [x] Email send path: the primary HubSpot transactional node is disabled
      2026-07-09 (confirmed scope error again on real execution 166, see
      `VERIFICATION.md`) rather than left erroring. The SMTP fallback stays
      disabled (no credential, no longer the intended path). Superseded by
      the HubSpot marketing-email workflow described above.
- [ ] HubSpot marketing-email workflow built (report email + the existing
      4-email nurture sequence, one combined workflow, see "HubSpot
      marketing-email workflow, manual build task" above). Not started, a
      manual HubSpot UI task for Noah or LeiLani.
- [ ] Twilio SMS node built (done, correct field mapping) but disabled,
      pending a real Twilio account and credential and a real test phone
      number (see `VERIFICATION.md` section 7.7). Explicitly out of scope
      for the 2026-07-09 pipeline fix, per Noah.
- [x] End-to-end test-fire completed with a **test contact only**,
      2026-07-09: submitted both `tool_complete` and `tool_viewed` events
      against the live production webhook, confirmed the HubSpot test
      contact (ID 234168017998) was created with every one of the 16
      properties populated correctly, confirmed a real engagement was
      logged on the `tool_viewed` branch. The report email did **not**
      arrive (Hard Gate 1 blocker, confirmed not a workflow bug) and no
      SMS was sent (node disabled, no credential). See `VERIFICATION.md`
      section 7 for full evidence.
- [x] **Real (non-test-fire) end-to-end proof**, 2026-07-09: execution 166,
      a genuine submission through the live production form from Noah's own
      email, correctly upserted his real HubSpot contact (ID 10054) with
      every property populated. This is the first real-traffic proof this
      pipeline has had, found during the pipeline audit, see
      `VERIFICATION.md`.
- [ ] HR-Pro sign-off recorded in `REVIEW.md`. Untouched by this build,
      remains a separate outstanding gate.
- [x] Slack notification branch built 2026-07-09 (`Notify Slack: New
      Submission`, posts to `#btc-risk-audit-alerts`), enabled and
      published live (`activeVersionId 8981beb3-445f-4a4a-b30e-0c1c95ee0801`),
      confirmed active not draft.
- [x] Name/company collection added to the app 2026-07-09
      (`components/EmailGateStep.tsx`, `components/ComplianceCheckApp.tsx`):
      the form never asked for these before, so every contact and every
      Slack alert had a blank first name and company. Everything
      downstream (this workflow, the report page, email merge fields)
      already expected these fields, only the UI collection was missing.
- [x] Booked-call attribution wired 2026-07-09: `bookingUrlWithAttribution()`
      in `lib/recommendation/index.ts` tags every code-controlled booking
      link (on-page CTA, hosted report, transactional email) with
      `utm_campaign=ca-hr-risk-audit`. The 4 nurture emails need the
      literal per-email URLs above pasted in when that HubSpot workflow is
      built.
- [ ] Real ad traffic connected only after every box above is checked.
