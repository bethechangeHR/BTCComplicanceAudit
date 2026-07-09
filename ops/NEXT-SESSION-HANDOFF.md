# Handoff prompt for the next session

Paste the block below as the first message in a fresh session, after
confirming the n8n and HubSpot MCP connectors show "Connected" in your
claude.ai connector settings (a same-day MCP authorization outage on
Anthropic's side, resolved 2026-07-08 19:00 UTC, was the likely cause of
the "Server not found" error last session, not your account setup).

---

I'm resuming work on the Be the Change HR "California HR Risk Audit" tool
at `D:\claude\_PROJECTS\clients\BTC\apps\btc-compliance-risk-check`. Read
`CLAUDE.md` in that folder first for the full mission, architecture, and
non-negotiable rules, then `REVIEW.md` and `VERIFICATION.md` for what's
already built and verified, then `ops/n8n-workflow.md` for the exact task
below.

**Status:** the Next.js app (scoring engine, gap library, two-payload
recommendation layer, hosted report page, premium front end) is fully
built, tested (32/32 passing), typechecked, linted, and formatted clean.
Everything is committed to git in this folder already. The one thing not
done is the live delivery pipeline: `ops/n8n-workflow.md` is a complete,
node-by-node blueprint that was written when the n8n and HubSpot MCP
connectors were disconnected, so it was never actually built or test-fired.

**Your task:**

1. Confirm the n8n and HubSpot MCP tools are actually available this
   session (try `list_credentials` on n8n and `get_organization_details` on
   HubSpot). If either errors as "not connected," stop and tell me, don't
   proceed.
2. Follow `ops/n8n-workflow.md` exactly: create the 16 custom HubSpot
   contact properties listed in its schema table, then build the n8n
   workflow (webhook trigger, event-type switch, HubSpot upsert, the
   SMS-opt-in branch with a Twilio node, the primary HubSpot email send
   plus an SMTP fallback branch). Read the n8n MCP's own SDK reference and
   workflow best practices before writing any workflow code, per its
   server instructions, don't guess node syntax.
3. Do not build the 4-email nurture sequence as n8n Wait nodes. Per
   `ops/n8n-workflow.md`'s own reasoning, that's meant to be a native
   HubSpot workflow instead, built once the contact properties exist.
   You can note this as a follow-up rather than building it yourself if
   HubSpot workflow authoring isn't practical through the MCP tools.
4. Test-fire the whole pipeline end to end using a **test contact only**
   (something like `test-<timestamp>@example.com`, never a real prospect
   email). Confirm: the HubSpot test contact is created with every custom
   property populated correctly, the report email actually arrives with a
   working report link, and SMS arrives if you used a real test phone
   number with opt-in.
5. Update `ops/n8n-workflow.md`'s go-live checklist and add the test-fire
   evidence to `VERIFICATION.md` section 7 (currently marked "specified,
   not yet wired or test-fired"). Do not mark the pipeline done without
   pasting back real evidence (the actual HubSpot contact record fields,
   the actual email received, screenshots or exact API responses), not
   just a description of what should have happened.

**Hard constraints, non-negotiable, same as the rest of this project:**

- Never connect real ad traffic or a real prospect's contact info to this
  pipeline. Test contact only, this session.
- No BTC pricing anywhere in any email template, HubSpot property, or
  workflow config.
- No em dashes or en dashes anywhere, including in anything you write to
  HubSpot or n8n.
- Don't make any live change to the HubSpot booking/scheduler calendar
  itself, that's out of scope, only the workflow/contact-property side.
- The HR-Pro sign-off in `REVIEW.md` is still outstanding and unrelated to
  this task. Building and test-firing the pipeline does not clear that
  gate, both are required before this reaches a real prospect.

Read the files first, then start with step 1 and report back before
proceeding to step 2.
