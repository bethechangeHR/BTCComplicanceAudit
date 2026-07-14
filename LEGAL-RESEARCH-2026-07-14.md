# CA HR Compliance Risk Audit, Legal Research Pass

lastVerified: 2026-07-14
Researcher: Noah (via assistant), for the compliance-risk-check tool revision
Purpose: source-of-truth legal facts for the VS Code fix pass. Every figure and
citation the tool renders must trace to an entry here. Do not re-derive numbers
from memory. CONFIRMED means verified against a current primary or named source
on 2026-07-14. FLAG means still needs an HR-Pro or attorney sign-off before it
reaches a real prospect.

No em dashes or en dashes anywhere, per project rules.

---

## 1. Exempt / salaried classification (fixes gap-exempt-all, gap-exempt-mix)

CONFIRMED. To be exempt from overtime in California a role must pass BOTH tests,
this is conjunctive, one without the other does not establish the exemption:

1. Salary basis test: paid a fixed monthly salary of at least twice the state
   minimum wage for full-time work. For 2026 that floor is $70,304 per year
   ($16.90/hr x 2 x 40 x 52).
2. Duties test: the employee must be "primarily engaged in" exempt work,
   meaning MORE THAN 50 percent of actual work time is spent on exempt duties.
   This is a strict quantitative test, stricter than the federal FLSA "primary
   duty" test, which has no fixed time percentage.

Correct order in practice: check the salary basis test first (it is the
bright-line gate), then the duties test. The current tool copy says only "Run
the California duties test" and omits the salary basis test as a step. That is
incomplete and misordered. LeiLani's correction is right.

- Source: Cal. Labor Code Section 515(a); CA DIR News Release 2025-118
  (dir.ca.gov) confirming 2026 min wage $16.90/hr. CalChamber and SHRM on the
  conjunctive salary + duties test and the >50% quantitative duties standard.
- 2027 figure: NOT YET PUBLISHED as of 2026-07-14. California announces the next
  year's minimum wage (and therefore the exempt floor) by August 1, effective
  Jan 1. Do NOT state a 2027 dollar figure. Add a reminder to update after the
  CA DIR announcement expected around 2026-08-01.

## 2. Independent contractor / ABC test (fixes gap-1099-mostly, gap-1099-some)

CONFIRMED and current. Cal. Labor Code Section 2775 (the ABC test, originally
AB 5 2019, reenacted by AB 2257 2020). A worker is presumed an employee unless
the hiring entity proves all three prongs (A: free from control, B: work outside
the usual course of business, C: independently established trade). Some
occupations fall under statutory exemptions (Labor Code 2776-2787) and are
judged by the older Borello multifactor test instead.

- 2026 update to note: AB 1514 (effective Jan 1, 2026) adjusted some
  professional-services exemptions (creative, consulting, tech). It did NOT
  relax the ABC standard for construction/field trades. Worth a one-line note
  that exemptions shift; the core test is unchanged.
- CA-SPECIFIC: the ABC test is California law. If the user answered one_other_state
  or multi_state, the report must say the ABC test may not apply in their state.
- Source: leginfo.legislature.ca.gov (Section 2775); CA DIR
  faq_independentcontractor.htm; FTB AB 5 FAQ. This resolves the prior
  UNVERIFIED flag about post-2020 amendments: AB 1514 is the 2026 amendment.

## 3. Harassment-prevention training (fixes gap-training-none, gap-training-unsure)

CONFIRMED. SB 1343 (Gov Code Section 12950.1): employers with 5 or more
employees, including temporary and seasonal, must provide sexual harassment
prevention training, 2 hours for supervisors and 1 hour for nonsupervisory
staff, and repeat every 2 years. Supervisors must be trained within 6 months of
assuming the role.

Additions the team asked for, both now CONFIRMED:
- "CRD" must be defined. CRD = California Civil Rights Department, the state
  agency that enforces this (formerly DFEH, the Department of Fair Employment
  and Housing, renamed July 2022). Define on first use, then "CRD" is fine.
- Supervisor point (Genevieve): under FEHA (Gov Code Section 12940(j)(3)),
  individual supervisors can be held PERSONALLY liable for harassment. This is
  unlike discrimination and retaliation claims (no individual liability) and
  unlike federal Title VII (no individual liability). Supervisors also carry the
  higher 2-hour training requirement. This is a strong, accurate hook.
- Fix the gap-training-unsure diagnosis. The current line ("Not knowing whether
  your training meets the state's standard carries the same exposure as skipping
  it") is not accurate, the training could be fine. Reframe to: harassment
  training is a legal requirement for CA employers with 5+ employees, and the
  burden of PROVING compliant, documented training sits with the employer, so
  "not sure" means you cannot currently prove it.
- Source: leginfo (SB 1343 / Gov Code 12950.1); Gov Code 12940(j)(3) and CACI
  2521 on individual harassment liability; CRD (calcivilrights.ca.gov).

## 4. Handbook / written policies (fixes gap-handbook-none, gap-handbook-stale)

Component requirements CONFIRMED individually:
- Harassment prevention policy: 2 CCR Section 11023 + Gov Code 12950.1.
- Paid sick leave: Labor Code Sections 245-249.
- Wage notice at hire: Labor Code Section 2810.5 (Wage Theft Prevention Act).
- Workers' comp rights notice: Labor Code Section 3550.
- Workplace Know Your Rights notice: SB 294, see item 5.

CORRECTION REQUIRED, sick-leave bill citations are wrong:
- The tool currently lists paid sick leave changes as "AB 2288 2024, SB 616,
  AB 406 2025." AB 2288 is NOT a sick-leave law. AB 2288 (2024) is the PAGA
  reform bill. Remove it from the sick-leave citation entirely.
- SB 616 (2023, effective Jan 1, 2024) is the correct sick-leave expansion:
  raised paid sick leave from 3 days/24 hours to 5 days/40 hours.
- AB 406 (2025, signed Oct 1, 2025) expanded protected leave for victims of
  violence and amended Labor Code 246.5 to allow paid sick leave use for jury
  duty and appearing as a subpoenaed witness. It is really a crime-victim /
  sick-leave-USE bill. Cite it precisely or drop it, do not lump it as a generic
  "sick leave change."
- Source: leginfo and Gov's office (AB 2288 PAGA reform, signed 2024-07-01);
  leginfo SB 616; leginfo / Payne & Fears / Ogletree on AB 406.

"Know Your Rights taking effect February 2026" must change, see item 5.
"No handbook mandate" negative framing: STILL A FLAG. The individual policy
requirements are each well sourced, but the statement that CA has "no single
handbook mandate" is an absence-of-law finding, not one citation. Keep it soft.

## 5. Workplace Know Your Rights Act (SB 294), reframe everywhere

CONFIRMED REAL and IN EFFECT. This is not future-dated anymore.
- SB 294, the Workplace Know Your Rights Act, signed by the Governor Oct 12,
  2025. Employers must give each employee a stand-alone written notice of
  specified rights by February 1, 2026 AND ANNUALLY thereafter, and to each new
  hire on hire. The Labor Commissioner posted the model notice by Jan 1, 2026.
- Every place the tool says the notice is "taking effect February 2026" or
  "starting February 2026" must change to reflect that it is already a current,
  recurring annual obligation as of 2026. It is past its first deadline.
- Source: leginfo SB 294 (2025-2026 session); CA Labor Commissioner model
  notice (californiaworkplacelawblog.com, Jan 2026); Cooley, Davis Wright
  Tremaine, Hanson Bridgett client alerts (Jan 2026).

## 6. Leave process (gap-leave-none), already correct, keep

CONFIRMED. Paid sick leave at any size (LC 245-249); CFRA and pregnancy
disability leave at 5+ employees (Gov Code 12945.2 and 12945, SB 1383 2021);
federal FMLA at 50+ (29 U.S.C. 2611). The current diagnosis is accurate. This
matches LeiLani's own corrected wording, keep it.
- ADD (Yaz): a line that be the change HR provides the legally mandated forms
  for any type of leave of absence. This is a service-scope statement, keep it
  in scopeOfWork, not a legal claim.

## 7. New-hire paperwork (gap-newhire-none, gap-newhire-partial)

Core facts CONFIRMED: Form I-9 required for every hire (8 U.S.C. 1324a); CA
wage notice at hire (LC 2810.5). STILL A FLAG: the exact statutory citation for
California's specific workplace-poster mandate was not pinned to one code
section, it is referenced generally as CA DIR poster requirements. Keep the
poster line general until an attorney pins the citation.

## 8. NEW question A: Wage and hour (meal/rest breaks, overtime, timekeeping)

CONFIRMED, this is the single highest-volume CA wage-and-hour litigation area,
Yaz is right to want it. Facts for the new gap items:
- Meal breaks (Labor Code Section 512): a 30-minute unpaid meal break must start
  before the end of the 5th hour when a shift exceeds 5 hours; a second 30-minute
  meal before the end of the 10th hour when a shift exceeds 10 hours. The first
  meal can be waived by mutual consent only if the shift is 6 hours or less.
- Rest breaks (IWC Wage Orders, enforced with LC 226.7): a paid 10-minute rest
  break per 4 hours worked or major fraction thereof.
- Premium pay (Labor Code Section 226.7): one additional hour of pay at the
  "regular rate of compensation" for each day a compliant meal or rest break is
  not provided. Per Ferra v. Loews (Cal. 2021), that regular rate includes
  nondiscretionary bonuses and incentives, not just base hourly, and is
  recoverable for a 4-year window.
- Overtime and accurate timekeeping records feed all of the above. No compliant
  time records is itself exposure.
- Source: leginfo LC 512, 226.7; DIR faq_mealperiods.htm; Ferra v. Loews
  Hollywood Hotel (2021) via ArentFox Schiff / WSHB alerts.

## 9. NEW question B: Workers' compensation coverage

CONFIRMED. Yaz is right, this is a bright-line mandate with hard penalties.
- Labor Code Section 3700: EVERY California employer with at least one employee
  must carry workers' compensation insurance, including part-time, temporary,
  and family-member employees. No small-employer exemption.
- Being uninsured is a misdemeanor (LC 3700.5): minimum $10,000 fine or up to a
  year in county jail, or both. Civil/administrative penalties up to $100,000.
  If an injury occurs while uninsured, $10,000 per employee on payroll if the
  claim is compensable ($2,000 if not), up to $100,000. DLSE can issue a Stop
  Order halting all use of employee labor until coverage is secured.
- 2026 update: SB 291 (effective Jan 1, 2026) raised minimum penalties for
  uninsured contractors ($10,000 sole-owner, $20,000 other).
- Source: leginfo / FindLaw LC 3700 and 3700.5; CA DIR DWC employer FAQ; SB 291.

## 10. Industry lawsuit-cost anchor ($200,000 line), re-source it

The current tool sources the "$200,000 average employment lawsuit" only to BTC's
own pitch deck. Genevieve correctly questioned it. Options with real, citable
third-party sources:
- Hiscox Guide to Employee Lawsuits: among small and mid-size employers (under
  500), 24 percent of employment charges resulted in defense and settlement
  costs averaging $160,000. NOTE: Hiscox study data is from 2015-2017, flag as
  somewhat dated.
- Novian Law (2026): defending an employment claim commonly reaches six figures;
  hiring defense counsel directly averages about $200,000, and taking a case to
  trial can reach $245,000.
- RECOMMENDATION: stop citing the pitch deck. Reframe as a sourced range, e.g.
  "Industry analyses put the cost of defending and resolving an employment claim
  in the six figures, commonly $160,000 or more (Hiscox), and defending a case
  through trial can exceed $200,000 (Novian Law, 2026)." Keep the existing
  "industry-wide figure, not a prediction about your business" hedge. If BTC
  wants one clean number, $160,000 (Hiscox, SME-specific) is the most defensible.
- Source: hiscox.com Guide to Employee Lawsuits (2015/2017); novianlaw.com
  cost-to-defend / cost-of-defense-settlement (2026).

## 11. Local ordinances disclaimer (Yaz), add to report

CONFIRMED as a real gap. Many California cities and counties set their own
higher minimum wages and their own paid-sick-leave rules (e.g. Los Angeles, San
Francisco, San Diego, West Hollywood and others). A report built on statewide
law does not capture local ordinances. Add a short disclaimer that local
city/county rules may impose additional requirements based on where the business
operates, and that the audit reflects statewide California law only.

## 12. Multi-state, LeiLani's concern is already partly built

The states question already offers california_only / one_other_state /
multi_state, and gap-multistate and gap-other-state items already exist. LeiLani
could not confirm this because there is NO BACK BUTTON to review prior answers.
So the fixes are: (1) add a back button, (2) make the CA-specific caveats
explicit in the report text (ABC test, exempt floor, SB 294 etc. are CA law).
No large multi-state rebuild is needed, keep it California-first as designed.
