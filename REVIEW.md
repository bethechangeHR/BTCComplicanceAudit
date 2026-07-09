# REVIEW.md

One-screen checklist for an HR Pro (LeiLani or Genevieve) and Noah to sign
off on before this tool reaches a real prospect. This is the liability gate
named in `CLAUDE.md`: the scoring weights and every gap-item wording need a
human HR review, not just a correct build. See `VERIFICATION.md` first for
the full evidence-backed definition-of-done checklist.

## Before anything else

- [x] `npm install`, `npm test`, `npm run typecheck`, `next lint`,
      `npx prettier --check .` all run for real, in this environment, and
      passing. See `VERIFICATION.md` for the actual command output.
- [x] `btc-logo-color.png`, `btc-logo-white.png`, `btc-logo-footer.png`
      copied into `/public`.
- [x] `git init` done. Commit history to be created per Noah's instruction
      (small logical commits).
- [ ] Set `COMPLIANCE_CHECK_WEBHOOK_URL` to the real n8n webhook endpoint in
      Vercel's environment variables, not committed to the repo. Not set
      yet, currently no-ops (logs instead of sending).
- [ ] Set `REPORT_TOKEN_SECRET` to a real, long random secret in Vercel's
      environment variables. The `.env.example` placeholder is
      dev-only and insecure, never use it in production. **This was the
      cause of the 2026-07-09 Vercel build failure**: `/preview` was
      statically prerendered at build time and crashed with `Error:
      REPORT_TOKEN_SECRET is not set`. Fixed by marking `/preview` as
      `export const dynamic = "force-dynamic"` (it is QA-only, never linked
      from the live tool, so it has no reason to be baked into the static
      build), which unblocks the build regardless of this env var. The
      real pipeline (`/api/submit`, `/report/[token]`) still needs the
      secret set in Vercel to actually function, that requirement did not
      go away.
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the real production domain once known,
      so report links in emails resolve correctly.
- [x] The n8n workflow and HubSpot property schema in `ops/n8n-workflow.md`
      are built, published, and test-fired with a test contact,
      2026-07-09. See `VERIFICATION.md` section 7. The email leg is
      blocked on a confirmed HubSpot scope gap (Hard Gate 1) and SMS is
      disabled pending a Twilio credential; both are documented, neither
      is wired live. Wire the real webhook URL
      (`https://btchr.app.n8n.cloud/webhook/compliance-risk-check`) into
      Vercel's `COMPLIANCE_CHECK_WEBHOOK_URL` only after Gate 1 clears.
- [ ] `NEXT_PUBLIC_ENABLE_PIXEL` and `NEXT_PUBLIC_META_PIXEL_ID` stay unset
      until the Meta pixel/CAPI Hard Gate clears, per `CLAUDE.md`.

## Scoring model: first-draft, needs HR-Pro calibration

- [ ] **Every risk-point weight in `data/scoring.ts`** (headcount, states,
      contractor use, salaried classification, handbook status, harassment
      training, leave process, HR support) is a first-draft proposal by
      this build, not a finalized model. Review each weight against your
      actual experience of which gaps are riskiest relative to each other.
- [ ] **The A-F band cutoffs** (`GRADE_BANDS` in `data/scoring.ts`, currently
      A: 0-6, B: 7-14, C: 15-24, D: 25-34, F: 35-49 out of a 49-point max)
      are a first-draft proposal. Confirm these feel right, especially
      whether the C band is too wide or the A band too generous.
- [ ] Confirm you are comfortable that headcount and multi-state carry real
      scoring weight even when every practice-level answer is clean (see
      the design-principle comment at the top of `data/scoring.ts` and the
      golden-master scenario 3 reconciliation in `VERIFICATION.md`, a
      120-employee multi-state company with a current handbook and
      documented leave still lands in band C, not A, because of structural
      complexity alone).
- [ ] **Question 2's three answer options** (`california_only`,
      `one_other_state`, `multi_state`) are this build's interpretation of
      the buildspec's ambiguous shorthand "(one / CA / multi-state)".
      Confirm this interpretation is what was intended, see `CLAUDE.md`
      "Discrepancies found in source material."
- [ ] **8 vs 10 questions**: `btc-kb-lead-magnets.md` and
      `btc-lead-magnets-sequences.html` both describe this tool as a
      "10-question checklist," while the 2026-07-08 buildspec (used here)
      specifies 8. Confirm 8 is correct and the other two files should be
      updated, or that a 9th/10th question is actually wanted.

## Every gap item's wording, source, and framing (data/gap-library.ts)

Review each of the 11 items for: is the legal citation accurate, is the
"why this matters" framing honest rather than alarmist, and does the scope
of work list feel like the right level of detail (complete enough to show
real complexity, but with no actual fix given away).

- [ ] `gap-1099-mostly`, `gap-1099-some`: CA ABC test, Labor Code Section 2775. Flagged in `UNVERIFIED_RESEARCH_FLAGS`: whether the ABC test
      received any 2025/2026 amendment beyond 2020's AB 2257. Recommend a
      final legal pass before launch.
- [ ] `gap-exempt-all`, `gap-exempt-mix`: CA exempt salary floor, currently
      $70,304/yr (2026), Labor Code Section 515(a). This tool deliberately
      never states a federal FLSA dollar figure, since that threshold is in
      active litigation flux, see `UNVERIFIED_RESEARCH_FLAGS`.
- [ ] `gap-handbook-none`, `gap-handbook-stale`: the claim that California
      has no standalone handbook mandate (only component written-policy
      requirements) is an absence-of-law finding, not a single citation.
      Confirm you are comfortable with this framing.
- [ ] `gap-training-none`, `gap-training-unsure`: CA harassment training,
      5+ employees, Government Code Section 12950.1 (SB 1343).
- [ ] `gap-leave-none`: CFRA and Pregnancy Disability Leave at 5+ employees,
      federal FMLA at 50+. Confirm the headcount tiers referenced match
      your own understanding.
- [ ] `gap-multistate`, `gap-other-state`: the multi-state framing is a
      structural/general principle, not a single statute citation. The
      `gap-other-state` item explicitly tells a non-California visitor that
      the rest of the report is CA-anchored, confirm that honesty is the
      right call rather than a softer framing.
- [ ] **Industry lawsuit anchor** (`INDUSTRY_LAWSUIT_ANCHOR`, $200,000):
      confirm this still matches the current pitch deck figure in
      `btc-source-of-truth.md` and that the "industry figure, not a BTC
      guarantee" framing is exactly how you want it worded everywhere it
      appears (on-page context is not shown here, only in the hosted
      report and nurture email 2).

## BTC claims and copy to eyeball confirm

- [ ] **Credibility strip** (`components/CredibilityStrip.tsx`): only
      carries two confirmed facts (15+ years HR Pros, nationwide service).
      No testimonial quote is included. See below.
- [ ] **Missing testimonial**: `content/emails/nurture-3-proof.txt` has an
      explicit `[TESTIMONIAL PLACEHOLDER]` because no approved client
      testimonial text was found in the reviewed source files. Do not
      publish that email until a real, approved testimonial is inserted.
- [ ] **Tool name**: built as "California HR Risk Audit," recommended for
      consistency with the internal working name already used in
      `btc-reverse-magnet-tech-stack-and-flows-2026-07-06.md`. Confirm or
      choose one of the runner-up names listed in `CLAUDE.md`.
- [ ] **Disclaimer wording** (`RESULT_DISCLAIMER` in
      `lib/recommendation/copy.ts`): confirm the exact "not legal advice"
      phrasing is acceptable.
- [ ] **Booking link**: confirm
      `https://meetings.hubspot.com/bethechangehr/discoverycall` is still
      correct and current.
- [ ] **Booking link UTM attribution** (added 2026-07-09): the on-page CTA,
      hosted report, and transactional email now append
      `utm_campaign=ca-hr-risk-audit` plus a per-touchpoint `utm_source`/
      `utm_medium` to the booking link, so a booked call rolls up in
      HubSpot's native `engagements_last_meeting_booked_campaign/source/
      medium` properties. See `ops/n8n-workflow.md` "Booked-call
      attribution" for the full mapping and the 4 literal nurture-email
      URLs that still need to be pasted in once that HubSpot workflow is
      built. No sign-off action needed here beyond confirming the
      `ca-hr-risk-audit` campaign name reads correctly in HubSpot reporting.
- [ ] **Slack submission alerts** (added 2026-07-09): `#btc-risk-audit-alerts`
      channel created, and an n8n node posting new-submission details to it
      is built but disabled and unpublished, see `ops/n8n-workflow.md`.
      Confirm the message format and that this is the right channel before
      it's enabled.
- [ ] **Transactional email and 4-email nurture sequence**
      (`content/emails/`): read all 5 for tone, and confirm the send-window
      timing (immediate, day 1-2, day 3-4, day 6-7, day 9-10) matches how
      you want the cadence to feel.

## Structural checks

- [x] Confirmed zero em dashes or en dashes anywhere in the repo (code, UI
      copy, email copy), including `&mdash;`/`&ndash;` entities, other than
      the two literal mentions of those entity names inside `CLAUDE.md`'s
      own rule text describing the ban. See `VERIFICATION.md`.
- [x] Confirmed zero BTC pricing, tier, retainer, or fee figures anywhere in
      the repo. The only dollar figures present are the $70,304 CA exempt
      salary floor and the $200,000 industry lawsuit anchor, both real,
      sourced, non-BTC-pricing legal/industry figures. See
      `VERIFICATION.md`.
- [x] Confirmed the tool can award an honest A grade to a genuinely clean
      business (score 0 of 49, zero triggered gaps). See the golden-master
      "genuinely clean business" scenario in `VERIFICATION.md`.
- [ ] Confirm the webhook payload shape in `channels/types.ts`
      (`SubmitPayload`) matches what the real n8n workflow expects once
      built, adjust field names in `ops/n8n-workflow.md` if needed before
      wiring it live.
- [ ] Exercise the tool end to end in a real browser (not just curl/dev
      server, see `VERIFICATION.md` for the curl-based evidence already
      captured): all 8 questions, the gate, the grade reveal, the booking
      embed, and the hosted report link.

## Sign-off

- [ ] LeiLani or Genevieve has reviewed the scoring model and every gap-item
      wording above and approves the compliance content for public launch.
- [ ] Noah has reviewed the structural checks and environment setup above
      and approves this tool for public launch.

Date: ______________ Signed: ______________
