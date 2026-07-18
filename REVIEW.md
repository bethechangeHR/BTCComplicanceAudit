# REVIEW.md

One-screen checklist for an HR Pro (LeiLani or Genevieve) and Noah to sign
off on before this tool reaches a real prospect. This is the liability gate
named in `CLAUDE.md`: the scoring weights and every gap-item wording need a
human HR review, not just a correct build. See `VERIFICATION.md` first for
the full evidence-backed definition-of-done checklist.

## 2026-07-18 tool-changes pass, gate status

See `PLAN-tool-changes-2026-07-18.md` and `VERIFICATION.md`'s matching
2026-07-18 note for the full detail. Summary for this checklist:

- [x] Confirmed no item in this pass edits `data/gap-library.ts` gap-item
      wording (`onPageStatement`, `reportDiagnosis`, `scopeOfWork`) or any
      `data/scoring.ts` weight or `GRADE_BANDS` cutoff. The formal HR-Pro
      gap-item sign-off gate below is unaffected by this pass; every item
      already listed there still needs the same sign-off it needed before.
- [ ] **New liability-adjacent copy, not gap-item wording, but worth an
      HR-Pro eyeball before it ships to real traffic:** the results-page
      now-vs-could-be contrast (`components/RiskContrast.tsx`) and the
      cost-of-doing-nothing line (`components/CostAnchorLine.tsx`, reuses
      `INDUSTRY_LAWSUIT_ANCHOR`'s existing framing string verbatim, no new
      legal claim authored). Confirm the contrast's "clean profile"
      benchmark framing and the placement of the $200,000 anchor on the
      on-page result (previously report-only) both read as industry-general,
      never a company-specific claim, per `CLAUDE.md` rule 5.
- [ ] **Gate teaser sequencing, not gap wording, worth Noah's eyeball, not
      HR-Pro's:** the real letter grade now shows at the gate
      (`components/EmailGateStep.tsx`) before the visitor submits their
      email, rather than only after. Confirm this reveal order is the
      intended trade (curiosity plus honesty, versus the grade previously
      being the reward for submitting).
- [x] Confirmed the gate's phone field and SMS consent checkbox
      (`components/EmailGateStep.tsx`) were left completely unchanged: they
      are the registered Twilio A2P 10DLC opt-in surface for a campaign
      mid-resubmission (SID `CMc7a7d23fc58fa791da103bda48928036`, see
      `build/btc-a2p-resubmission-fix-v2-2026-07-17.md`). Only the `name`
      field lost its required flag. No A2P re-file needed.
- [ ] **P0 fix still needs the mandatory real-device confirmation** before
      real ad spend resumes: open the deployed preview inside the actual
      Facebook and Instagram in-app browsers and confirm question 1
      advances. This environment could not perform that test, see
      `VERIFICATION.md`.

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
      until the Meta pixel/CAPI Hard Gate clears, per `CLAUDE.md`. As of
      2026-07-09, client-side event firing (`components/MetaPixel.tsx`,
      `channels/pixel.ts`, the `ToolStart`/`Lead`/`ToolComplete` call sites
      in `components/ComplianceCheckApp.tsx`) is wired and confirmed to
      inject nothing into the rendered page while the flag is off. This
      does not close the gate: server-side CAPI is not built, and no real
      pixel ID has been tested end to end with the flag on.

## Scoring model: first-draft, needs HR-Pro calibration

**2026-07-09 update:** a 9th question (new-hire paperwork, question 8 in the
flow) was added, and the HR-support question (question 9) was changed to
contribute zero scoring weight (pure lead-fit tag, does not move the grade at
all, down from a prior max of 2). `MAX_POSSIBLE_SCORE` moved from 49 to 54.
This is a deliberate, reviewed spec change (Noah, 2026-07-09), not yet HR-Pro
reviewed. See `CLAUDE.md` and `VERIFICATION.md` section 2 for the
re-reconciled golden-master scenarios.

**2026-07-14 update:** two more scored questions were added per
`LEGAL-RESEARCH-2026-07-14.md` items 8 and 9 (Yaz's request), placed after
new-hire paperwork and before the HR-support qualifying screen (now the 11th
and last question): wage/hour practices (`wageHour`, `WAGE_HOUR_POINTS`:
`complete: 0, partial: 4, none: 7`) and workers' compensation coverage
(`workersComp`, `WORKERS_COMP_POINTS`: `yes: 0, unsure: 3, no: 8`).
`MAX_POSSIBLE_SCORE` moved from 54 to 69 and `GRADE_BANDS` was re-derived
proportionally. Not yet HR-Pro reviewed. See `VERIFICATION.md` section 2 for
the re-reconciled golden-master scenarios, including a scenario 3 result that
moved from band C to band B under the new max.

- [ ] **Every risk-point weight in `data/scoring.ts`** (headcount, states,
      contractor use, salaried classification, handbook status, harassment
      training, leave process, new-hire paperwork, wage/hour, workers'
      compensation) is a first-draft proposal by this build, not a finalized
      model. Review each weight against your actual experience of which gaps
      are riskiest relative to each other. HR support itself is intentionally
      excluded from this list: it no longer carries scoring weight, only a
      lead-fit tag.
- [ ] **NEW_HIRE_PAPERWORK_POINTS** (`data/scoring.ts`, `complete: 0,
partial: 4, none: 7`), added 2026-07-09, has not been calibrated
      against the other weights. Confirm the relative severity feels
      right against, for example, handbook status (`stale: 5, none: 8`).
- [ ] **WAGE_HOUR_POINTS** (`data/scoring.ts`, `complete: 0, partial: 4,
none: 7`), added 2026-07-14, proposed at the same weight as
      `NEW_HIRE_PAPERWORK_POINTS`, on the reasoning that it is a
      practice-level answer of the same family and scale. Confirm this feels
      right given meal/rest break exposure (Ferra v. Loews, a four-year
      recovery window) is arguably the single highest-volume CA litigation
      area named in `LEGAL-RESEARCH-2026-07-14.md` item 8.
- [ ] **WORKERS_COMP_POINTS** (`data/scoring.ts`, `yes: 0, unsure: 3, no: 8`),
      added 2026-07-14, proposed top-of-scale for "no" (matching
      `handbookStatus: none` and `contractorUse: mostly`) because it is a
      bright-line legal mandate (Labor Code Section 3700, every employer with
      one or more employees, no small-employer exemption) and being
      uninsured is a misdemeanor carrying penalties up to $100,000. Confirm
      this weight and the "unsure" mid-point feel right.
- [ ] **HR_SUPPORT_POINTS zeroed to `0, 0, 0`**, added 2026-07-09: confirm
      you are comfortable that HR support contributes nothing to the grade
      at all, purely a lead-fit tag via `buildQualificationTag()`.
- [ ] **The A-F band cutoffs** (`GRADE_BANDS` in `data/scoring.ts`, currently
      A: 0-9, B: 10-19, C: 20-33, D: 34-47, F: 48-69 out of a 69-point max,
      re-derived proportionally from the prior 54-point A: 0-7, B: 8-15,
      C: 16-26, D: 27-37, F: 38-54 bands after the 2026-07-14 rework, same
      method as the 2026-07-09 rework) are a first-draft proposal. Confirm
      these feel right, especially whether the C band is too wide or the A
      band too generous.
- [ ] Confirm you are comfortable that headcount and multi-state carry real
      scoring weight even when every practice-level answer is clean (see
      the design-principle comment at the top of `data/scoring.ts` and the
      golden-master scenario 3 reconciliation in `VERIFICATION.md`). Note
      this scenario (120-employee multi-state, every practice-level answer
      clean including the two new 2026-07-14 questions) now lands in band B,
      not C, under the new 69-point max: 10 of its 17 points still come from
      headcount tier and multi-state structure alone, an honest B, not a
      rigged one, but confirm you are comfortable with the band shift itself.
- [ ] **Question 2's three answer options** (`california_only`,
      `one_other_state`, `multi_state`) are this build's interpretation of
      the buildspec's ambiguous shorthand "(one / CA / multi-state)".
      Confirm this interpretation is what was intended, see `CLAUDE.md`
      "Discrepancies found in source material."
- [ ] **8 vs 9 vs 10 vs 11 questions**: `btc-kb-lead-magnets.md` and
      `btc-lead-magnets-sequences.html` both describe this tool as a
      "10-question checklist," while the 2026-07-08 buildspec specified 8.
      As of 2026-07-14 the tool has 11 questions (new-hire paperwork added
      2026-07-09 as question 8; wage/hour and workers' compensation added
      2026-07-14 as questions 9 and 10, per Yaz's request via
      `LEGAL-RESEARCH-2026-07-14.md`, not from either original source
      document). Confirm 11 is correct going forward and that the two source
      documents' "10-question" framing should be treated as stale or
      revisited.

## Every gap item's wording, source, and framing (data/gap-library.ts)

Review each of the 17 items (11 from the original 2026-07-08 pass, 2 added
2026-07-09, 4 added 2026-07-14) for: is the legal citation accurate, is the
"why this matters" framing honest rather than alarmist, and does the scope of
work list feel like the right level of detail (complete enough to show real
complexity, but with no actual fix given away). The items below marked
"reworded 2026-07-14" changed wording, not just a `lastVerified` date bump,
per `LEGAL-RESEARCH-2026-07-14.md`, and need a fresh read even if you already
reviewed the prior wording.

- [ ] **`gap-1099-mostly`, `gap-1099-some`** (reworded 2026-07-14): CA ABC
      test, Labor Code Section 2775. The prior `UNVERIFIED_RESEARCH_FLAGS`
      question (whether the ABC test received a 2025/2026 amendment) is now
      RESOLVED: AB 1514 (effective 2026-01-01) is that amendment, adjusting
      some professional-services exemptions while leaving the core ABC
      standard unchanged. Both items now also note the ABC test is CA-only
      and may not apply if the visitor answered a non-California state.
- [ ] **`gap-exempt-all`, `gap-exempt-mix`** (reworded 2026-07-14): CA exempt
      status now stated as conjunctive, both required: the salary basis test
      first (twice state minimum wage, $70,304/yr for 2026, Labor Code
      Section 515(a)), then the duties test (more than half of actual work
      time on exempt duties, a quantitative standard stricter than the
      federal "primary duty" test). The prior wording said only "run the
      California duties test," omitting the salary basis test as a step,
      per LeiLani's correction. `scopeOfWork` also now includes writing down
      an exempt/nonexempt designation for every role and, for `gap-exempt-mix`,
      a line connecting nonexempt roles to meal/rest breaks and overtime
      (now partly covered by the new wage/hour question). This tool
      deliberately never states a federal FLSA dollar figure, since that
      threshold is in active litigation flux, see `UNVERIFIED_RESEARCH_FLAGS`.
      Do not add a 2027 figure, not yet published as of 2026-07-14.
- [ ] **`gap-handbook-none`, `gap-handbook-stale`** (reworded 2026-07-14):
      the sick-leave citation was corrected, "AB 2288" removed (it is the
      PAGA reform bill, not sick leave, per LeiLani), the correct cite is now
      SB 616 (five days/40 hours, effective 2024-01-01) and AB 406 (2025,
      crime-victim leave and expanded sick-leave use). The Know Your Rights
      notice (SB 294) is reframed from "taking effect February 2026" to a
      current, recurring annual obligation, past its first 2026-02-01
      deadline. The claim that California has no standalone handbook mandate
      (only component written-policy requirements) is still an absence-of-law
      finding, not a single citation, kept soft, still a FLAG. Confirm you
      are comfortable with both the correction and the framing.
- [ ] **`gap-training-none`, `gap-training-unsure`** (reworded 2026-07-14):
      CA harassment training, five or more employees, Government Code
      Section 12950.1 (SB 1343). CRD is now defined on first use
      (California Civil Rights Department, formerly DFEH). Both items now
      note supervisors carry the higher two-hour training requirement AND
      can be held personally liable for harassment under FEHA (Gov Code
      Section 12940(j)(3)), unlike federal law, per Genevieve's request. The
      `gap-training-unsure` diagnosis dropped the inaccurate "carries the
      same exposure as skipping it" line and was reframed: the burden of
      proving compliant, documented training sits with the employer, so "not
      sure" means you cannot currently prove it, per LeiLani's correction.
- [ ] **`gap-leave-none`** (reworded 2026-07-14, second pass): LeiLani flagged
      the original four-leave framing (paid sick leave, CFRA, pregnancy
      disability leave, federal FMLA) as understating the real leave stack.
      Nine more CA leaves were researched and added: jury duty and witness
      leave and kin care (any size), bereavement leave and reproductive loss
      leave (5+), organ and bone marrow donor leave (15+), school-activity
      leave and military spouse leave (25+), and victims of qualifying acts
      of violence leave and accommodation (any size for the employee's own
      leave, regardless of headcount). Deliberately excluded: SB 590 (not
      effective until 2028-07-01), voting leave (Elections Code Section
      14000, no independently confirmed enforcing agency), and alcohol/drug
      rehab and adult literacy leave (accommodation duties, not scheduled
      leave entitlements). See `UNVERIFIED_RESEARCH_FLAGS` in
      `data/gap-library.ts` for the full reasoning. `scopeOfWork` still
      includes the line that be the change HR provides the legally mandated
      forms for any type of leave of absence (Yaz's request, a service-scope
      statement, not a legal claim). This has not been through the same
      HR-Pro sign-off rigor as the original 11 items, confirm every new
      citation and headcount tier before this reaches a real prospect.
- [ ] `gap-multistate`, `gap-other-state`: the multi-state framing is a
      structural/general principle, not a single statute citation. The
      `gap-other-state` item explicitly tells a non-California visitor that
      the rest of the report is CA-anchored, confirm that honesty is the
      right call rather than a softer framing.
- [ ] **`gap-newhire-none`, `gap-newhire-partial`** (added 2026-07-09, not
      part of the original 2026-07-08 research pass): federal Form I-9 /
      IRCA (8 U.S.C. Section 1324a, INA Section 274A), CA Wage Theft
      Prevention Act notice at hire (Labor Code Section 2810.5), and
      required state/federal workplace posters. The I-9 and WTPA citations
      are well-established; this build did **not** independently confirm
      the exact statutory/regulatory citation for California's specific
      poster mandate (cited here only generally as "CA DIR poster
      requirements"), flagged in `UNVERIFIED_RESEARCH_FLAGS`. Recommend a
      full legal pass on both new items, same rigor as the original 11,
      before launch.
- [ ] **`gap-wage-hour-none`, `gap-wage-hour-partial`** (new, added
      2026-07-14, question A per `LEGAL-RESEARCH-2026-07-14.md` item 8): meal
      breaks (Labor Code Section 512, 30 minutes before the fifth hour on
      shifts over five hours, a second before the tenth hour on shifts over
      ten hours), rest breaks (paid 10 minutes per four hours, Labor Code
      Section 226.7), and premium pay (one additional hour at the regular
      rate per missed break, including nondiscretionary bonuses per Ferra v.
      Loews Hollywood Hotel (Cal. 2021), a four-year recovery window). Not
      part of the original research pass, flagged in
      `UNVERIFIED_RESEARCH_FLAGS` for a fresh legal pass before launch.
- [ ] **`gap-workerscomp-none`, `gap-workerscomp-unsure`** (new, added
      2026-07-14, question B per `LEGAL-RESEARCH-2026-07-14.md` item 9):
      Labor Code Section 3700 (every employer with one or more employees
      must carry coverage, no small-employer exemption), Section 3700.5
      (uninsured is a misdemeanor, civil/administrative penalties up to
      $100,000, DLSE Stop Orders), and SB 291 (2026, higher uninsured-
      contractor penalties). Not part of the original research pass, flagged
      in `UNVERIFIED_RESEARCH_FLAGS` for a fresh legal pass before launch.
- [ ] **Industry lawsuit anchor** (`INDUSTRY_LAWSUIT_ANCHOR`, $200,000,
      re-sourced 2026-07-14): no longer cites BTC's own pitch deck
      (Genevieve flagged the self-citation). Re-sourced to Novian Law 2026
      (defending an employment claim through trial can exceed $200,000) and
      Hiscox (average defense and settlement costs among small and mid-size
      employers, an estimated $160,000, 2015-2017 data, flagged as dated).
      Confirm this framing is exactly how you want it worded everywhere it
      appears (hosted report and nurture email 2). See
      `LEGAL-RESEARCH-2026-07-14.md` item 10 for the two source options
      considered; a code comment in `data/gap-library.ts` flags this pending
      final BTC confirmation.

## BTC claims and copy to eyeball confirm

- [ ] **Brand naming** (`be the change HR`, corrected 2026-07-14 throughout
      the app, emails, and metadata per LeiLani's direct instruction: lower
      case "be the change", capital "HR"): every user-facing
      "Be the Change HR Pro" / "Be the Change HR" was replaced. Her literal
      instruction ("book a free 30-minute HR risk assessment with be the
      change HR") was followed by dropping "HR Pro" from the consultant/
      booking phrase everywhere (see `lib/recommendation/copy.ts`,
      `components/RiskAssessmentCTA.tsx`, `components/ReportView.tsx`,
      `components/EmailGateStep.tsx`, every `content/emails/*.txt`).
      Factual credibility claims that used "HR Pros" as a plural role
      descriptor, not the flagged booking phrase (`components/
CredibilityStrip.tsx`'s "Reviewed by HR Pros with 15+ years",
      `content/emails/nurture-3-proof.txt`'s "a team of HR Pros"), were left
      as-is since they are accurate and not the specific phrase LeiLani
      flagged. **Confirm this reading is correct**: LeiLani may still want
      the consultant referred to as "an HR Pro from be the change HR" rather
      than just the brand name, see the TODO comment in
      `lib/recommendation/copy.ts` near `RESULT_DISCLAIMER`.
- [ ] **Local ordinance disclaimer** (new, added 2026-07-14, Yaz's request
      per `LEGAL-RESEARCH-2026-07-14.md` item 11): the hosted report
      (`components/ReportView.tsx`, `LOCAL_ORDINANCE_DISCLAIMER` in
      `lib/recommendation/copy.ts`) now notes that many California cities
      and counties set their own higher minimum wage and paid sick leave
      rules, this audit reflects statewide California law only, and local
      requirements may add obligations. Report-only, never shown on the
      lead form. Confirm the wording.
- [ ] **Back button** (new, added 2026-07-14, per LeiLani's request that she
      could not confirm the multi-state framing without one): a "Back"
      control now lets a visitor step through prior questions and change an
      earlier answer, or return from the email gate to the last question,
      before submitting (`components/ComplianceCheckApp.tsx`,
      `components/QuestionStep.tsx`, `components/EmailGateStep.tsx`).
      Answers already given stay in state and can be overwritten by
      re-selecting. No change to the one-email-per-submission behavior.
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
      the three literal mentions of those entity names inside `CLAUDE.md`'s,
      `VERIFICATION.md`'s, and this file's own rule text describing the ban.
      Re-verified 2026-07-14 after the naming and legal-accuracy pass. See
      `VERIFICATION.md`.
- [x] Confirmed zero user-facing "BTC" string and zero BTC pricing, tier,
      retainer, or fee figures anywhere in the repo. The only dollar figures
      present are the $70,304 CA exempt salary floor and the $200,000
      industry lawsuit anchor (re-sourced 2026-07-14 away from BTC's pitch
      deck to Novian Law/Hiscox), both real, sourced, non-BTC-pricing
      legal/industry figures. Re-verified 2026-07-14. See `VERIFICATION.md`.
- [x] Confirmed the tool can award an honest A grade to a genuinely clean
      business (score 0 of 69 as of the 2026-07-14 rework, was 0 of 54
      before that and 0 of 49 before the 2026-07-09 rework, zero triggered
      gaps every time). See the golden-master "genuinely clean business"
      scenario in `VERIFICATION.md`.
- [ ] Confirm the webhook payload shape in `channels/types.ts`
      (`SubmitPayload`) matches what the real n8n workflow expects once
      built, adjust field names in `ops/n8n-workflow.md` if needed before
      wiring it live. Note the payload now carries 11 answers (`wageHour`
      and `workersComp` added 2026-07-14), the HubSpot `cc_*` property
      schema in `ops/n8n-workflow.md` predates this and needs two new
      properties added before real submissions are sent.
- [ ] Exercise the tool end to end in a real browser (not just curl/dev
      server, see `VERIFICATION.md` for the curl-based evidence already
      captured, which predates both the 2026-07-09 9-question rework and
      the 2026-07-14 11-question rework): all 11 questions including the
      new back button, the gate, the grade reveal, the booking embed, and
      the hosted report link with its new local-ordinance disclaimer.

## Sign-off

**2026-07-14 note:** this pass reworded eight existing gap items
(`gap-1099-mostly`, `gap-1099-some`, `gap-exempt-all`, `gap-exempt-mix`,
`gap-handbook-none`, `gap-handbook-stale`, `gap-training-none`,
`gap-training-unsure`) and added four new ones (`gap-wage-hour-none`,
`gap-wage-hour-partial`, `gap-workerscomp-none`, `gap-workerscomp-unsure`),
plus the re-sourced `INDUSTRY_LAWSUIT_ANCHOR` and two new scoring weights.
None of this has been through HR-Pro sign-off yet. Even gap items LeiLani or
Genevieve already reviewed once need a fresh read, since eight of the
original items' wording changed, not just their `lastVerified` date. This
tool does not reach real prospects until that sign-off happens.

- [ ] LeiLani or Genevieve has reviewed the scoring model (including the two
      new 2026-07-14 weights and the re-derived bands) and every gap-item
      wording above, including the eight reworded items and four new items
      dated 2026-07-14, and approves the compliance content for public
      launch.
- [ ] Noah has reviewed the structural checks and environment setup above
      and approves this tool for public launch.

Date: ______________ Signed: ______________
