# Handoff prompt for the next session

Paste the block below as the first message in a fresh session.

---

I'm resuming work on the Be the Change HR "California HR Risk Audit" tool
at `D:\claude\_PROJECTS\clients\BTC\apps\btc-compliance-risk-check`. Read
`CLAUDE.md` first for the full mission, architecture, and non-negotiable
rules, then `REVIEW.md` and `VERIFICATION.md` for what's already verified,
then `ops/n8n-workflow.md` for the delivery pipeline's current state.

**Status as of 2026-07-09, end of session:**

- The Vercel deploy is fixed and live. Root cause of the earlier build
  failure was `/preview` being statically prerendered at build time and
  crashing on a missing `REPORT_TOKEN_SECRET`; fixed with `export const
  dynamic = "force-dynamic"` on `app/preview/page.tsx`, committed and
  pushed (commits `4d4c4a6`, `f734c9e`, `ffd7453`).
- All three required Vercel production environment variables are now set:
  `REPORT_TOKEN_SECRET`, `NEXT_PUBLIC_SITE_URL`
  (`https://btc-complicance-audit.vercel.app`, update this once a real
  subdomain is live), and `COMPLIANCE_CHECK_WEBHOOK_URL`
  (`https://btchr.app.n8n.cloud/webhook/compliance-risk-check`). Noah
  triggered the redeploy himself after adding the last one; latest
  deployment `dpl_C5L3fAccCz8o3fDrhtEoBuwz9k3Q` shows `READY`.
- **Not yet done**: a real end-to-end test through the live production
  form was interrupted before it happened. `app/api/submit/route.ts` also
  now has a try/catch (from a debug session) so failures return a proper
  JSON error and log server-side instead of crashing silently, but that
  fix has not been exercised against a real request yet either.
- A Slack notification node (`Notify Slack: New Submission`, posts to
  `#btc-risk-audit-alerts`) exists in the n8n workflow
  (`WZgb6WemXlxuamzz`) but is deliberately `disabled: true`. Note: an
  earlier assumption that saving it left the *published* workflow
  untouched was wrong, the n8n API published it immediately, so the
  node's own `disabled` flag is the only thing currently preventing it
  from firing. Leave it disabled until Noah confirms the message format
  and channel.
- Booking-link UTM attribution (`lib/recommendation/index.ts`,
  `bookingUrlWithAttribution()`) is built and tested, tags on-page CTA,
  hosted report, and transactional email booking links with
  `utm_campaign=ca-hr-risk-audit`. The 4 nurture emails still need their
  literal per-email URLs pasted in once that HubSpot workflow is built,
  see `ops/n8n-workflow.md` "Booked-call attribution" for the exact URLs.
- Still blocked, unrelated to the above: Hard Gate 1 (HubSpot
  transactional-send scope, confirmed not enabled), Twilio SMS (no
  credential), HR-Pro sign-off in `REVIEW.md` (untouched).

**Your task, in this order:**

1. **Design and form review comes first.** Before touching the pipeline
   connections again, Noah wants to go through the tool itself: questions
   about the 8-question form's flow/copy/UX, and a full pass to confirm
   the site's design is optimal (brand tokens, layout, hierarchy, mobile).
   Treat this as an open revision session, wait for his specific feedback
   rather than assuming what needs to change. Relevant files:
   - `components/ComplianceCheckApp.tsx`: the 8-question flow, the gate,
     grade reveal, error states (including the fallback error text fixed
     in the last debug session).
   - `components/CredibilityStrip.tsx`, other `components/`: presentation
     layer, renders whatever `lib/recommendation` returns.
   - `app/report/[token]/page.tsx` (or wherever the hosted report route
     lives): the full diagnosis + scope-of-work report page.
   - `lib/recommendation/copy.ts`: on-page result copy, disclaimer,
     qualification tag labels.
   - `CLAUDE.md` "Brand tokens" and "Voice" sections: the teal/gold
     palette (orange is banned), Inter font, banned words list, no em/en
     dashes anywhere, before proposing any copy changes.
   - `content/emails/*.txt`: the transactional + 4 nurture emails, if
     copy review extends there too.
   Live URL to look at: `https://btc-complicance-audit.vercel.app`.

2. **After design/form revisions are addressed** (or if Noah says to move
   on), finish the pipeline verification that got interrupted:
   - Submit a real test through the live production form using a test
     email only (never a real prospect, e.g.
     `test-<timestamp>@example.com`), all 8 questions through the grade
     reveal and email gate.
   - Confirm via `search_executions` on n8n workflow `WZgb6WemXlxuamzz`
     that a new execution appears (the last one before this session was
     ID 156 at `2026-07-09T05:35:09Z`, from the original test-fire, not
     a real form submission).
   - Confirm via HubSpot that a new or updated contact exists with all 16
     custom properties populated, matching the test submission.
   - Confirm the Slack channel `#btc-risk-audit-alerts` correctly did
     **not** receive a message (the node is disabled on purpose, this is
     expected, not a bug).
   - Update `ops/n8n-workflow.md`'s go-live checklist and
     `VERIFICATION.md` with this real evidence (the actual execution ID,
     the actual contact record, not just a description of what should
     have happened).

**Hard constraints, non-negotiable, same as the rest of this project:**

- Never connect a real prospect's contact info to this pipeline, test
  contact only, until every Hard Gate in `CLAUDE.md` clears and HR-Pro
  sign-off is recorded in `REVIEW.md`.
- No BTC pricing anywhere, in any file, ever.
- No em dashes or en dashes anywhere, including anything written to
  HubSpot, n8n, or code comments. Grep before calling anything done.
- Don't make any live change to the HubSpot booking/scheduler calendar
  itself, that boundary is unchanged.
- Push and redeploy autonomously when needed (git push, Vercel redeploy)
  without asking permission each time, Noah has authorized this. But
  test/verify integration points yourself (n8n executions, HubSpot
  records) before reporting something as working, don't make Noah be the
  one to discover a gap by testing it manually himself.

Read the files first, then wait for Noah's specific form/design feedback
before proposing changes.
