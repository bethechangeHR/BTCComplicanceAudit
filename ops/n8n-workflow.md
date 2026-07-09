# Delivery pipeline: n8n workflow + HubSpot wiring

Status as of 2026-07-09: **built, published, and test-fired with a test
contact.** The n8n and HubSpot MCP connectors were confirmed live this
session and used to build the workflow described below directly. See
`VERIFICATION.md` section 7 for full evidence: the live production webhook
URL, the 16 HubSpot custom properties (created and verified), a real test
contact created with all properties populated correctly, a real engagement
logged on the `tool_viewed` branch, and a real (failed) API call to
HubSpot's transactional email endpoint that concretely confirms Hard Gate
1's exact blocker (missing scope, not "unconfirmed").

Do not connect real ad traffic to this pipeline before:

1. The email leg is actually working end to end (Hard Gate 1: HubSpot has
   confirmed it does not currently grant this app token the transactional-
   send scope, see `VERIFICATION.md` section 7.6). SMS is also disabled,
   pending a Twilio credential.
2. HR-Pro sign-off clears (see `REVIEW.md`).
3. Noah resolves HubSpot's transactional-send capability in the portal
   (Hard Gate 1, see `CLAUDE.md` and `VERIFICATION.md` section 7.6).

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
5. **Email send, with a fallback branch** (Hard Gate 1 is unconfirmed, so
   build both):
   - Primary: **HubSpot node**, trigger the transactional/marketing email
     using `content/emails/transactional-report.txt` as the template, merge
     fields `firstName`, `grade`, `gapCount`, `topCategory`, `reportUrl`,
     `bookingUrl` (all already computed by
     `lib/recommendation/buildEmailPayload()`, so the workflow's Set node
     just maps the webhook payload to these merge fields, it does not
     recompute anything).
   - Fallback: if the primary HubSpot send node errors (continue-on-fail,
     branch on error output), an **SMTP node** sends the same template as
     plain text. Document which path is actually active once Noah confirms
     Gate 1, do not leave both silently active at once.
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
   (`R5amYUiLnbdeUVRR`). **Built but not live**: the node is `disabled:
   true` and the update was saved as a new draft version only, the
   currently *active/published* version of the workflow does not include
   it, so it cannot fire even by accident. Two things need to happen before
   it goes live: confirm the message format/channel with Noah, then
   un-disable the node and publish the workflow.

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
- [ ] Primary and fallback email send paths built (done, both nodes exist
      with correct field mapping), but neither is active: the primary
      HubSpot node hit a confirmed scope error (Hard Gate 1, see
      `VERIFICATION.md` section 7.6) and the SMTP fallback is disabled
      pending a real SMTP credential. Which path is active must be
      documented here once Gate 1 is resolved by Noah.
- [ ] Twilio SMS node built (done, correct field mapping) but disabled,
      pending a real Twilio account and credential and a real test phone
      number (see `VERIFICATION.md` section 7.7).
- [ ] HubSpot native nurture workflow built (4 emails, day 1 through day
      10, unenroll on reply or `lead_meeting_booked`). Not started, a
      manual HubSpot UI task for whoever owns that portal.
- [x] End-to-end test-fire completed with a **test contact only**,
      2026-07-09: submitted both `tool_complete` and `tool_viewed` events
      against the live production webhook, confirmed the HubSpot test
      contact (ID 234168017998) was created with every one of the 16
      properties populated correctly, confirmed a real engagement was
      logged on the `tool_viewed` branch. The report email did **not**
      arrive (Hard Gate 1 blocker, confirmed not a workflow bug) and no
      SMS was sent (node disabled, no credential). See `VERIFICATION.md`
      section 7 for full evidence.
- [ ] HR-Pro sign-off recorded in `REVIEW.md`. Untouched by this build,
      remains a separate outstanding gate.
- [ ] Slack notification branch built 2026-07-09 (`Notify Slack: New
      Submission`, posts to `#btc-risk-audit-alerts`), but disabled and
      only saved as a draft version, not published. Enable once Noah
      confirms the message format and channel.
- [x] Booked-call attribution wired 2026-07-09: `bookingUrlWithAttribution()`
      in `lib/recommendation/index.ts` tags every code-controlled booking
      link (on-page CTA, hosted report, transactional email) with
      `utm_campaign=ca-hr-risk-audit`. The 4 nurture emails need the
      literal per-email URLs above pasted in when that HubSpot workflow is
      built.
- [ ] Real ad traffic connected only after every box above is checked.
