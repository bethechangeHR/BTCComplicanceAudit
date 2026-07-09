# Delivery pipeline: n8n workflow + HubSpot wiring

Status as of this build: **specified in full, not yet wired.** The n8n and
HubSpot MCP connectors were not connected in this session (both returned
"not connected" when called), so the workflow described below could not be
created or test-fired live. This is a connection/authorization gap, not a
design gap: the moment those connectors are authorized (via `/mcp` or the
claude.ai connector settings), this document is a precise, node-by-node
blueprint an agent or a human can build from directly, with no further
design decisions required.

Do not connect real ad traffic to this pipeline before:

1. It is actually built and test-fired end to end with a **test contact
   only** (never a real prospect).
2. HR-Pro sign-off clears (see `REVIEW.md`).
3. Noah confirms HubSpot's transactional-send capability in the portal
   (Hard Gate 1, see `CLAUDE.md`).

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

- [ ] n8n and HubSpot MCP connectors authorized, or a human builds this
      directly in each tool's UI using this document.
- [ ] Webhook node created, URL set as `COMPLIANCE_CHECK_WEBHOOK_URL` in
      Vercel's environment variables (never committed to the repo).
- [ ] All 16 custom HubSpot properties above created.
- [ ] Primary and fallback email send paths built, and which one is active
      is explicitly documented here once Gate 1 (HubSpot transactional-send
      capability) is confirmed by Noah.
- [ ] Twilio SMS node built and tested with a real test phone number.
- [ ] HubSpot native nurture workflow built (4 emails, day 1 through day
      10, unenroll on reply or `lead_meeting_booked`).
- [ ] End-to-end test-fire completed with a **test contact only**:
      submit the tool locally or in preview, confirm the HubSpot test
      contact is created with every property populated correctly, confirm
      the report email arrives with a working report link, confirm SMS
      arrives if a test phone number with opt-in was used.
- [ ] HR-Pro sign-off recorded in `REVIEW.md`.
- [ ] Real ad traffic connected only after every box above is checked.
