# VERIFICATION.md

Evidence-backed definition-of-done for the California HR Risk Audit. See
`REVIEW.md` for the human HR-Pro sign-off checklist this feeds into. Nothing
in this document is asserted without the actual command output or curl
output that produced it.

## 1. Test output

`npx vitest run`, 2026-07-08, final run after all fixes:

```
 Test Files  5 passed (5)
      Tests  32 passed (32)
```

Covering: `lib/engine/index.test.ts` (10 tests: point contribution per
answer, band-cutoff edges with no gaps or overlaps from 0 to 49, all-clean
and all-risky extremes, "unsure" harassment training treated as a real
gap not a free pass, single-state-CA vs single-other-state vs multi-state
distinguished, question 8 never moving the grade more than one band,
qualification tag exposed separately from the gap list, severity-descending
ordering, handbook-stale vs handbook-none triggering distinct gaps),
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
so a future scoring change cannot silently drift these results.

**Buildspec scenario 1** (6-employee single-state shop, no handbook, mostly
1099s). Unstated fields assumed: single state read as California; remaining
non-contractor staff assumed hourly; training, leave process, and HR support
assumed absent, matching a very small, informally-run shop.

```
0 (headcount 1-9) + 0 (California only) + 8 (mostly 1099) + 0 (hourly)
+ 8 (no handbook) + 7 (no training) + 6 (no leave process) + 2 (no HR support)
= 31 points -> grade D
```

**Buildspec scenario 2** (40-employee California, all salaried, no
harassment training). Unstated fields assumed: no contractor use; handbook
assumed stale (a neutral middle assumption, not the flattering "current");
leave process assumed documented; HR support assumed outsourced.

```
2 (headcount 10-49) + 0 (California only) + 0 (no contractors)
+ 6 (all salaried) + 5 (stale handbook) + 7 (no training)
+ 0 (documented leave) + 1 (outside HR support) = 21 points -> grade C
```

**Buildspec scenario 3** (120-employee multi-state, current handbook,
documented leave). Unstated fields assumed: some contractor use, a mixed
salaried/hourly workforce, harassment training current, HR support in-house.

```
4 (headcount 50-149) + 6 (multi-state) + 4 (some 1099) + 3 (mixed salaried)
+ 0 (current handbook) + 0 (training current) + 0 (documented leave)
+ 0 (in-house HR) = 17 points -> grade C
```

10 of this scenario's 17 points come from headcount tier and multi-state
structure, not from any practice failure: the company is doing the actual
work right (current handbook, trained, documented leave) but still carries
real structural complexity risk from its size and footprint. This is the
honest reading, not a rigged one, see the design-principle comment in
`data/scoring.ts`.

**Genuinely clean business** (required separately by the verification gate,
not a buildspec scenario): single-state California, 1 to 9 employees, no
contractors, hourly staff, current handbook, trained, documented leave,
in-house HR support.

```
0 + 0 + 0 + 0 + 0 + 0 + 0 + 0 = 0 points -> grade A, zero triggered gaps
```

This is the proof the scoring model is not rigged to fail everyone
regardless of actual compliance posture.

## 3. Gap-item source mapping

Every item in `data/gap-library.ts` cites a named source in its `sourceRef`
field. Summary:

| Gap ID(s)                                  | Legal source                                                                                       | Confidence                                                                                                               |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `gap-1099-mostly`, `gap-1099-some`         | Cal. Labor Code Section 2775 (AB 5, 2019; AB 2257, 2020)                                           | High, primary statute. ABC-test stability since 2020 not exhaustively re-checked, flagged in `UNVERIFIED_RESEARCH_FLAGS` |
| `gap-exempt-all`, `gap-exempt-mix`         | Cal. Labor Code Section 515(a); DIR News Release 2025-118 ($70,304/yr 2026 floor)                  | High, primary agency source                                                                                              |
| `gap-handbook-none`, `gap-handbook-stale`  | Gov Code Section 12950.1, 2 CCR Section 11023, Labor Code 245-249/2810.5/3550, SB 294 (2026-02-01) | High on each component requirement; the "no single handbook mandate" framing is an absence-of-law finding                |
| `gap-training-none`, `gap-training-unsure` | Gov Code Section 12950.1 (SB 1343, 2018)                                                           | High, primary statute plus CRD FAQ                                                                                       |
| `gap-leave-none`                           | Labor Code 245-249; Gov Code 12945/12945.2 (SB 1383, 2021); 29 CFR 825.105                         | High, all four thresholds independently confirmed                                                                        |
| `gap-multistate`                           | General state-level employment law primacy (SHRM)                                                  | High as a structural principle, not a single-statute citation                                                            |
| `gap-other-state`                          | btc-paid-ads-campaign-buildspec-v1-2026-07-08.md geo decision                                      | This build's own framing choice, not an external legal citation                                                          |

Full text of every claim, with exact statute numbers and a `lastVerified:
2026-07-08` date, lives in each item's `sourceRef` field in
`data/gap-library.ts`. Everything the 2026-07-08 legal research pass could
not independently confirm is listed verbatim in `UNVERIFIED_RESEARCH_FLAGS`
in that same file, and repeated in `REVIEW.md`.

## 4. Em dash / en dash scan

`Grep` for `—|–|&mdash;|&ndash;` across the full repo, 2026-07-08. One file
matched: `CLAUDE.md`, line 49, which reads:

```
copy, or HTML entities (`&mdash;`, `&ndash;` count as violations). Use a
```

This is the rule text itself describing the ban, not a violation. No other
file in the repo, including every `.ts`, `.tsx`, and `.txt` email file,
matched.

## 5. BTC pricing scan

`Grep` for dollar amounts and every known BTC retainer/onboarding figure
(`$821.37`, `$769.97`, `$718.57`, `$1,897`, `$3,194`, `$5,640`, `$9,613`,
`$2,527`, `$5,088`) across the full repo, 2026-07-08. Zero matches for any
BTC pricing figure. The only dollar amounts anywhere in the repo are
`$70,304` (the CA 2026 exempt salary floor, a legal figure) and `$200,000`
(the industry lawsuit anchor, explicitly framed as an industry figure, not
a BTC guarantee, in both `data/gap-library.ts` and every email that
references it).

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
  "grade": "F", "score": 39, "maxPossibleScore": 49
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

## 11. Open items needing human verification (summary)

See `REVIEW.md` for the full checklist. Highest-priority items:

- HR-Pro sign-off on every scoring weight, band cutoff, and gap-item
  wording (liability gate).
- Resolve the HubSpot transactional email scope/template gap confirmed
  in section 7.6 above (Hard Gate 1), then re-test-fire the email leg
  specifically before enabling the "Send Report Email (HubSpot)" node.
- Provision a Twilio account and credential, then enable the "Send SMS
  (Twilio)" node (section 7.7).
- Confirm the question 2 answer-option interpretation and the 8-vs-10
  question discrepancy with LeiLani.
- Insert a real, approved testimonial in `content/emails/nurture-3-proof.txt`
  before that email is used.
- Set `COMPLIANCE_CHECK_WEBHOOK_URL` to
  `https://btchr.app.n8n.cloud/webhook/compliance-risk-check`, and set
  `REPORT_TOKEN_SECRET` and `NEXT_PUBLIC_SITE_URL` to real production
  values, in Vercel before deploying.
- Build the native HubSpot nurture workflow (4 emails, day 1-10) in the
  HubSpot UI, see `ops/n8n-workflow.md`.
