/**
 * data/gap-library.ts
 *
 * The human-vetted gap-item library. Pending HR-Pro sign-off (LeiLani or
 * Genevieve) before any real prospect sees this content, see REVIEW.md.
 *
 * Every item has three layers, only two are ever rendered (see CLAUDE.md,
 * "Report philosophy"):
 *   - onPageStatement: shown on the instant, gated result screen. Named
 *     category framing only, no explanation.
 *   - reportDiagnosis + scopeOfWork: shown in full on the hosted, emailed
 *     audit report. The complete problem and the complete named remediation
 *     scope, written as general risk-area information, never as a claim
 *     that this specific company is violating a specific law.
 *   - The actual fix (compliant handbook language, reclassification
 *     mechanics, policy text, training delivery) is intentionally absent
 *     from every item below. That is the paid deliverable.
 *
 * Every legal claim cites a named statute/regulation, the enforcing agency,
 * and a lastVerified date from the 2026-07-08 research pass. Where the
 * research flagged something as not independently confirmed, it is marked
 * UNVERIFIED here too and excluded from confident claims. gap-newhire-none
 * and gap-newhire-partial were added 2026-07-09, after the original
 * research pass, for the new question 8 (newHirePaperwork); they are cited
 * to real, dated sources but flagged separately in
 * UNVERIFIED_RESEARCH_FLAGS for a fresh legal pass before launch.
 */

import type {
  GapCategory,
  GapJurisdiction,
  GapSeverity,
} from "@/lib/engine/types";

export interface GapItem {
  id: string;
  category: GapCategory;
  jurisdiction: GapJurisdiction;
  severity: GapSeverity;
  /** Short, named-category line for the on-page gated result. No explanation. */
  onPageStatement: string;
  /** Full diagnosis for the hosted report: what it is, why it matters. */
  reportDiagnosis: string;
  /** Full named scope of remediation work for the hosted report. No how-to. */
  scopeOfWork: string[];
  /** Which btc-kb-lead-magnets.md section 6 angle this traces to. */
  complianceAngle: string;
  /** Named source(s) and enforcing agency, with a lastVerified date. */
  sourceRef: string;
}

/**
 * ANNUAL MAINTENANCE: the CA exempt salary floor and the CA state minimum
 * wage, its basis, change every year. CA DIR announces the next year's
 * minimum wage by August 1, effective the following January 1. The 2026
 * floor is $70,304/year. LeiLani supplied the 2027 figure on 2026-07-15,
 * ahead of CA DIR's usual August announcement: $74,672/year
 * ($6,222.67/month), effective January 1, 2027. Flagged for legal
 * confirmation against a CA DIR source once published, see
 * UNVERIFIED_RESEARCH_FLAGS. Update both gap items and this comment again
 * once the 2028 figure is announced, expected around 2027-08-01.
 */
export const GAP_LIBRARY: GapItem[] = [
  {
    id: "gap-1099-mostly",
    category: "Worker Classification",
    jurisdiction: "CA",
    severity: "high",
    onPageStatement: "Independent contractor classification",
    reportDiagnosis:
      "California's ABC test (Labor Code Section 2775) presumes every worker is an employee, not a contractor, unless you prove all three prongs: they control their own work, the work falls outside your usual business, and they run an independent trade. Businesses built mainly on 1099 contractors carry serious reclassification exposure, back pay, unpaid payroll taxes, and penalties, if that test is not met. AB 1514 (effective January 1, 2026) adjusted some professional-services exemptions to the test, but the core ABC standard itself is unchanged. The ABC test is California law. If your employees are governed by a different state, it may not apply the same way there.",
    scopeOfWork: [
      "Audit every 1099 relationship against the ABC test, not industry convention",
      "Check which roles fall within the narrow exemptions (Labor Code Sections 2776-2787)",
      "Determine which contractors need to convert to W-2 and on what timeline",
      "Document a classification policy for all future hires",
    ],
    complianceAngle:
      "California classification / exempt vs non-exempt errors that trigger back pay (btc-kb-lead-magnets.md section 6)",
    sourceRef:
      "Cal. Labor Code Section 2775 (AB 5, 2019; amended by AB 2257, 2020), leginfo.legislature.ca.gov, enforced by CA DIR / Labor Commissioner; AB 1514 (2026), leginfo.legislature.ca.gov. lastVerified 2026-07-14.",
  },
  {
    id: "gap-1099-some",
    category: "Worker Classification",
    jurisdiction: "CA",
    severity: "medium",
    onPageStatement: "Independent contractor classification",
    reportDiagnosis:
      "The same ABC test (Labor Code Section 2775) applies to every 1099 relationship, even a single one. One misclassified contractor can still trigger back pay, unpaid payroll taxes, and penalties. AB 1514 (effective January 1, 2026) adjusted some professional-services exemptions to the test, but the core ABC standard itself is unchanged. The ABC test is California law. If your employees are governed by a different state, it may not apply the same way there.",
    scopeOfWork: [
      "Audit every current 1099 relationship against the ABC test",
      "Confirm which roles fall within the statutory exemptions (Labor Code Sections 2776-2787)",
      "Document the classification rationale for each contractor",
    ],
    complianceAngle:
      "California classification / exempt vs non-exempt errors that trigger back pay (btc-kb-lead-magnets.md section 6)",
    sourceRef:
      "Cal. Labor Code Section 2775 (AB 5, 2019; amended by AB 2257, 2020), leginfo.legislature.ca.gov, enforced by CA DIR / Labor Commissioner; AB 1514 (2026), leginfo.legislature.ca.gov. lastVerified 2026-07-14.",
  },
  {
    id: "gap-exempt-all",
    category: "Worker Classification",
    jurisdiction: "CA",
    severity: "high",
    onPageStatement: "Exempt / salaried classification",
    reportDiagnosis:
      "California's bar for exempt, no-overtime status is stricter than federal law and requires passing both of two tests. First, the salary basis test: a fixed salary of at least twice the state minimum wage, $70,304 per year as of January 1, 2026, rising to $74,672 per year ($6,222.67 per month) effective January 1, 2027 (Labor Code Section 515(a); this floor changes annually, see the maintenance note below). Second, the duties test: more than half of actual work time spent on exempt duties, a strict quantitative standard, stricter than the federal test. Businesses that classify staff as exempt using only federal assumptions or salary alone often miss one of these two requirements, and back-overtime exposure compounds for every misclassified employee.",
    scopeOfWork: [
      "Confirm every exempt salary meets the current $70,304 California floor for 2026, and the $74,672 floor taking effect January 1, 2027 (the salary basis test)",
      "Run the California duties test against every exempt role: confirm more than half of actual work time is spent on exempt duties",
      "Write down an exempt or nonexempt designation for every role, not just salaried ones",
      "Identify misclassified roles and estimate the back-overtime exposure window",
      "Document a defensible classification rationale for every exempt role",
    ],
    complianceAngle:
      "California classification / exempt vs non-exempt errors that trigger back pay, BTC's own June 2026 blog post: Are Your Salaried Employees Really Exempt? The FLSA Error That Triggers Back Pay (btc-kb-lead-magnets.md section 6)",
    sourceRef:
      "Cal. Labor Code Section 515(a); CA DIR News Release 2025-118 confirming the 2026 minimum wage increase to $16.90/hr, dir.ca.gov; 2027 figure ($74,672/yr) per LeiLani, 2026-07-15, not yet independently confirmed against a published CA DIR release, see UNVERIFIED_RESEARCH_FLAGS. lastVerified 2026-07-15.",
  },
  {
    id: "gap-exempt-mix",
    category: "Worker Classification",
    jurisdiction: "CA",
    severity: "medium",
    onPageStatement: "Exempt / salaried classification",
    reportDiagnosis:
      "For your salaried staff, the same two-part standard applies. First, the salary basis test: a fixed salary of at least twice the state minimum wage, currently $70,304 per year, rising to $74,672 per year ($6,222.67 per month) effective January 1, 2027 (Labor Code Section 515(a)). Second, the duties test: more than half of actual work time spent on exempt duties, a strict quantitative standard. Mixed teams need every salaried role checked individually against both tests, partial rollouts are where undocumented exceptions tend to hide. Nonexempt roles in a mixed team also carry meal, rest break, and overtime obligations.",
    scopeOfWork: [
      "Confirm each salaried role's salary meets the current $70,304 California floor for 2026, and the $74,672 floor taking effect January 1, 2027 (the salary basis test)",
      "Run the California duties test against each salaried role individually",
      "Write down an exempt or nonexempt designation for every role",
      "Document why each role qualifies as exempt",
    ],
    complianceAngle:
      "California classification / exempt vs non-exempt errors that trigger back pay (btc-kb-lead-magnets.md section 6)",
    sourceRef:
      "Cal. Labor Code Section 515(a); CA DIR News Release 2025-118; 2027 figure ($74,672/yr) per LeiLani, 2026-07-15, not yet independently confirmed against a published CA DIR release, see UNVERIFIED_RESEARCH_FLAGS. lastVerified 2026-07-15.",
  },
  {
    id: "gap-handbook-none",
    category: "Handbook & Written Policies",
    jurisdiction: "CA",
    severity: "high",
    onPageStatement: "No employee handbook",
    reportDiagnosis:
      "California requires several written policies regardless of format: harassment prevention (2 CCR Section 11023), paid sick leave (Labor Code Sections 245-249), a wage notice at hire (Labor Code Section 2810.5), a workers' compensation rights notice (Labor Code Section 3550), and a Workplace Know Your Rights notice (SB 294), a current, recurring annual obligation, not a future requirement: employers must give each employee a stand-alone written notice by February 1 each year and to every new hire on hire. Without a handbook, you have no consistent record of meeting any of them.",
    scopeOfWork: [
      "Draft the required policies: harassment prevention, sick leave, wage notice, workers' comp rights, Know Your Rights notice",
      "Add practice-level policies that reduce dispute risk: meal and rest breaks, PTO, discipline, termination",
      "Set a review cadence to keep the handbook current, including the annual Know Your Rights notice",
      "Roll out acknowledgment and signature tracking for every employee",
    ],
    complianceAngle:
      "Outdated or missing handbook exposure (btc-kb-lead-magnets.md section 6)",
    sourceRef:
      "Cal. Gov Code Section 12950.1 and 2 CCR Section 11023 (CRD, calcivilrights.ca.gov); Cal. Labor Code Sections 245-249, 2810.5, 3550; SB 294 Workplace Know Your Rights Act (2025-2026 session), leginfo.legislature.ca.gov, CA Labor Commissioner model notice. lastVerified 2026-07-14.",
  },
  {
    id: "gap-handbook-stale",
    category: "Handbook & Written Policies",
    jurisdiction: "CA",
    severity: "medium",
    onPageStatement: "Outdated employee handbook",
    reportDiagnosis:
      "A handbook untouched for two or more years is very likely missing recent law: the paid sick leave expansion to five days or 40 hours (SB 616, 2023) and the added sick-leave-use rights for crime victims and jury or witness duty (AB 406, 2025), plus the Workplace Know Your Rights notice (SB 294), a current, recurring annual obligation, not a future requirement. Its age is a direct measure of how much it is missing.",
    scopeOfWork: [
      "Compare the handbook against every California requirement that has changed",
      "Update paid sick leave and wage notice language",
      "Add the annual Know Your Rights notice to the review cadence",
      "Set an annual review cadence tied to California's legislative calendar",
      "Redistribute with fresh acknowledgment and signature tracking",
    ],
    complianceAngle:
      "Outdated or missing handbook exposure (btc-kb-lead-magnets.md section 6)",
    sourceRef:
      "Cal. Labor Code Sections 245-249 (SB 616, 2023, effective 2024-01-01) and Labor Code Section 246.5 (AB 406, 2025); SB 294 Workplace Know Your Rights Act (2025-2026 session), leginfo.legislature.ca.gov. lastVerified 2026-07-14.",
  },
  {
    id: "gap-training-none",
    category: "Harassment Prevention Training",
    jurisdiction: "CA",
    severity: "high",
    onPageStatement: "Harassment-prevention training",
    reportDiagnosis:
      "California employers with five or more employees, including temporary and seasonal staff, must provide sexual harassment prevention training through the California Civil Rights Department (CRD, formerly DFEH), two hours for supervisors and one hour for staff, every two years (Government Code Section 12950.1). New employees must be trained within six months of hire, and temporary or seasonal employees within 30 calendar days or 100 hours worked, whichever comes first. Supervisors carry the higher two-hour requirement, and under FEHA (Government Code Section 12940(j)(3)) an individual supervisor can be held personally liable for harassment, unlike discrimination or retaliation claims and unlike federal law. With no training on record, you have no documented proof of this legally required step, and that absence can count against you if a claim is filed.",
    scopeOfWork: [
      "Confirm headcount against the five-employee threshold, all locations and temp staff",
      "Deliver California Civil Rights Department (CRD)-compliant training: two hours for supervisors, one hour for staff",
      "Train new hires within six months of hire, and temporary or seasonal staff within 30 calendar days or 100 hours worked, whichever comes first",
      "Document completion records for every employee",
      "Build a recurring two-year retraining cadence",
    ],
    complianceAngle:
      "Harassment-prevention training requirements, CA, 5+ employees (btc-kb-lead-magnets.md section 6)",
    sourceRef:
      "Cal. Gov Code Section 12950.1 (SB 1343, 2018, compliance deadline 2020-01-01); 2 CCR Section 11024 (new-hire and temp/seasonal training deadlines); Gov Code Section 12940(j)(3) and CACI 2521 on individual harassment liability; CRD Sexual Harassment Prevention Training FAQ, calcivilrights.ca.gov. lastVerified 2026-07-14. New-hire timing line added 2026-07-15 per LeiLani's feedback, not yet through a fresh legal pass, see UNVERIFIED_RESEARCH_FLAGS.",
  },
  {
    id: "gap-training-unsure",
    category: "Harassment Prevention Training",
    jurisdiction: "CA",
    severity: "medium",
    onPageStatement: "Harassment-prevention training",
    reportDiagnosis:
      "Harassment-prevention training is a legal requirement for California employers with five or more employees, through the California Civil Rights Department (CRD, formerly DFEH). New employees must be trained within six months of hire, and temporary or seasonal employees within 30 calendar days or 100 hours worked, whichever comes first. The burden of proving compliant, documented training sits with the employer (Government Code Section 12950.1), so answering 'not sure' means you cannot currently prove it, even if the training itself turns out to be fine. Supervisors carry a higher two-hour requirement and, under FEHA (Government Code Section 12940(j)(3)), can be held personally liable for harassment, unlike federal law.",
    scopeOfWork: [
      "Pull existing training records and confirm hours and content for every employee",
      "Identify anyone missing documented, California Civil Rights Department (CRD)-compliant training within two years",
      "Confirm every new hire is trained within six months of hire, and every temp or seasonal hire within 30 calendar days or 100 hours worked",
      "Close any gaps and document completion going forward",
      "Build a recurring two-year retraining cadence",
    ],
    complianceAngle:
      "Harassment-prevention training requirements, CA, 5+ employees (btc-kb-lead-magnets.md section 6)",
    sourceRef:
      "Cal. Gov Code Section 12950.1 (SB 1343, 2018); 2 CCR Section 11024 (new-hire and temp/seasonal training deadlines); Gov Code Section 12940(j)(3) and CACI 2521 on individual harassment liability; CRD Sexual Harassment Prevention Training FAQ. lastVerified 2026-07-14. New-hire timing line added 2026-07-15 per LeiLani's feedback, not yet through a fresh legal pass, see UNVERIFIED_RESEARCH_FLAGS.",
  },
  {
    id: "gap-leave-none",
    category: "Leave & Accommodation Process",
    jurisdiction: "CA",
    severity: "high",
    onPageStatement: "Documented leave process",
    reportDiagnosis:
      "California leave law stacks by headcount, and it runs deeper than the handful of leaves most owners know by name. Paid sick leave, jury duty and witness leave, and kin care apply at any size (Labor Code Sections 245-249, 230, and 233). CFRA, pregnancy disability leave, bereavement leave, and reproductive loss leave apply at five or more employees (Government Code Sections 12945.2, 12945, 12945.7, and 12945.6). Organ and bone marrow donor leave applies at 15 or more (Labor Code Sections 1508-1513). School-activity leave and military spouse leave apply at 25 or more (Labor Code Sections 230.8 and 395.10). Federal FMLA layers on at 50 or more (29 U.S.C. Section 2611), running alongside CFRA rather than replacing it. Separately, employees who are victims of domestic violence, sexual assault, stalking, or other qualifying violent crimes have a protected right to leave and workplace accommodation regardless of your headcount (Government Code Section 12945.8). Without a documented process for requests, eligibility, and job protection, you are exposed under whichever combination applies at your current size, and that combination changes as you grow.",
    scopeOfWork: [
      "Map headcount against every California leave-law threshold that applies, not just the ones you already know about",
      "Build a documented intake and eligibility-tracking process",
      "Train managers on job-protection obligations during leave",
      "Set a review trigger tied to headcount growth",
      "Be the Change HR provides the legally mandated forms for any type of leave of absence",
    ],
    complianceAngle:
      "Leave-law exposure. Expanded 2026-07-14 (second pass) per LeiLani's direct feedback that the original four-leave framing understated the actual stack (btc-kb-lead-magnets.md section 6, LEGAL-RESEARCH-2026-07-14.md follow-up)",
    sourceRef:
      "Cal. Labor Code Sections 245-249 (paid sick leave, SB 616 2023) and Section 230(a)-(b) (jury duty and witness leave, re-enacted by AB 2499 2024) and Section 233 (kin care); Cal. Gov Code Sections 12945.2 (CFRA) and 12945 (pregnancy disability leave); Cal. Gov Code Section 12945.7 (bereavement leave, AB 1949, effective 2023-01-01) and Section 12945.6 (reproductive loss leave, SB 848, effective 2024-01-01); Cal. Labor Code Sections 1508-1513 (organ and bone marrow donor leave, 15+ employees); Cal. Labor Code Section 230.8 (school-activity leave, 25+ employees) and Cal. Mil. and Vet. Code Section 395.10 (military spouse leave, 25+ employees); Cal. Gov Code Section 12945.8 (victims of qualifying acts of violence leave and accommodation, AB 2499, effective 2025-01-01, replaced former Labor Code Sections 230/230.1); 29 U.S.C. Section 2611 / 29 CFR Section 825.105 (federal FMLA, 50+ employees), US DOL Fact Sheet #28. Verified against leginfo.legislature.ca.gov, calcivilrights.ca.gov, and dir.ca.gov current text. lastVerified 2026-07-14.",
  },
  {
    id: "gap-multistate",
    category: "Multi-State Compliance",
    jurisdiction: "multi-state",
    severity: "high",
    onPageStatement: "Multi-state compliance exposure",
    reportDiagnosis:
      "Employment law is set mostly at the state level, not federally, covering minimum wage, overtime, sick leave accrual, final pay, and required notices. A policy compliant in one state is often non-compliant in another. Each new state you hire in adds its own separate compliance regime.",
    scopeOfWork: [
      "Inventory every state where you actually have an employee",
      "Build a state-by-state compliance matrix: wage and hour, leave, notices",
      "Identify which policies need state-specific versions",
      "Confirm the employee handbook covers every state where you have employees, with policies identified by state",
      "Confirm each employee's new-hire and ongoing paperwork meets their own state's and city's requirements, California included",
      "Set a process for checking requirements before hiring in a new state",
    ],
    complianceAngle:
      "Multi-state exposure as headcount grows (btc-kb-lead-magnets.md section 6). State/city paperwork and by-state handbook bullets added 2026-07-15 per LeiLani's feedback.",
    sourceRef:
      "General principle of state-level employment law primacy, SHRM State and Local Updates (shrm.org). This is a structural, cross-jurisdictional fact rather than a single statute citation. lastVerified 2026-07-08.",
  },
  {
    id: "gap-newhire-none",
    category: "New-Hire Paperwork & Notices",
    jurisdiction: "CA",
    severity: "high",
    onPageStatement: "New-hire paperwork and required notices",
    reportDiagnosis:
      "Every employer must complete Form I-9 for each hire (8 U.S.C. Section 1324a). California also requires a written wage notice at hire (Labor Code Section 2810.5) and current workplace posters. Without a consistent process, you have no reliable record you have met any of it, and I-9 violations carry per-form penalties regardless of whether the hire was authorized.",
    scopeOfWork: [
      "Build a new-hire checklist covering Form I-9 completion and reverification",
      "Confirm the wage notice (Labor Code Section 2810.5) is issued at hire for every non-exempt employee",
      "Audit current workplace posters against what is required",
      "Build an audit-ready recordkeeping process for every new-hire document",
    ],
    complianceAngle:
      "New-hire onboarding and required-notice exposure. Added 2026-07-09 as part of the Part A scoring rework (question 8, newHirePaperwork). Not part of the original 2026-07-08 btc-kb-lead-magnets.md section 6 research pass, flagged for a fresh HR-Pro/legal review before launch, see UNVERIFIED_RESEARCH_FLAGS below.",
    sourceRef:
      "Federal Form I-9 requirement under the Immigration Reform and Control Act, 8 U.S.C. Section 1324a, INA Section 274A, uscis.gov; Cal. Labor Code Section 2810.5 (Wage Theft Prevention Act written notice at hire), leginfo.legislature.ca.gov; required state and federal workplace posters, CA DIR (dir.ca.gov) and US DOL. lastVerified 2026-07-09. This is a new addition made after the 2026-07-08 research pass and has not been through the same legal-pass rigor as the rest of this file, see UNVERIFIED_RESEARCH_FLAGS.",
  },
  {
    id: "gap-newhire-partial",
    category: "New-Hire Paperwork & Notices",
    jurisdiction: "CA",
    severity: "medium",
    onPageStatement: "New-hire paperwork and required notices",
    reportDiagnosis:
      "Inconsistent new-hire paperwork carries the same risk as having none. Form I-9 (8 U.S.C. Section 1324a) and California's wage notice (Labor Code Section 2810.5) are required for every hire, not most, and without an audit you cannot tell which employees are missing which document.",
    scopeOfWork: [
      "Audit personnel files for missing Form I-9s or wage notices",
      "Close any gaps for current employees",
      "Standardize the process for every future hire",
      "Confirm workplace posters are current",
    ],
    complianceAngle:
      "New-hire onboarding and required-notice exposure. Added 2026-07-09 as part of the Part A scoring rework (question 8, newHirePaperwork). Not part of the original 2026-07-08 btc-kb-lead-magnets.md section 6 research pass, flagged for a fresh HR-Pro/legal review before launch, see UNVERIFIED_RESEARCH_FLAGS below.",
    sourceRef:
      "Federal Form I-9 requirement under the Immigration Reform and Control Act, 8 U.S.C. Section 1324a, INA Section 274A, uscis.gov; Cal. Labor Code Section 2810.5 (Wage Theft Prevention Act written notice at hire), leginfo.legislature.ca.gov; required state and federal workplace posters, CA DIR (dir.ca.gov) and US DOL. lastVerified 2026-07-09. This is a new addition made after the 2026-07-08 research pass and has not been through the same legal-pass rigor as the rest of this file, see UNVERIFIED_RESEARCH_FLAGS.",
  },
  {
    id: "gap-wage-hour-none",
    category: "Wage & Hour",
    jurisdiction: "CA",
    severity: "high",
    onPageStatement: "Wage and hour practices",
    reportDiagnosis:
      "Meal and rest breaks and overtime are the single highest-volume area of California wage-and-hour litigation. A compliant meal break is a 30-minute unpaid break starting before the end of the fifth hour when a shift exceeds five hours, and a second 30-minute meal before the end of the tenth hour when a shift exceeds ten hours (Labor Code Section 512). A paid 10-minute rest break is owed for every four hours worked or major fraction of it. Missing a compliant meal or rest break on a given day owes one additional hour of pay at the regular rate of compensation, per missed break type (Labor Code Section 226.7), and per Ferra v. Loews Hollywood Hotel (Cal. 2021) that regular rate includes nondiscretionary bonuses and incentives, not just base hourly pay, recoverable for a four-year window. With no consistent process, and no accurate timekeeping records to show otherwise, this exposure compounds across every shift for every employee.",
    scopeOfWork: [
      "Audit current meal and rest break practices against the fifth-hour and tenth-hour meal triggers and the four-hour rest-break interval",
      "Confirm timekeeping records accurately capture meal and rest break timing",
      "Identify any history of missed or short breaks and estimate the premium-pay exposure window",
      "Build a documented, consistent timekeeping and overtime process",
    ],
    complianceAngle:
      "Wage and hour exposure, the highest-volume CA litigation area (LEGAL-RESEARCH-2026-07-14.md item 8, question A, added 2026-07-14)",
    sourceRef:
      "Cal. Labor Code Section 512 (meal breaks); IWC Wage Orders and Labor Code Section 226.7 (rest breaks, premium pay), leginfo.legislature.ca.gov, DIR faq_mealperiods.htm; Ferra v. Loews Hollywood Hotel, LLC (Cal. 2021). lastVerified 2026-07-14. Added 2026-07-14, not part of the original 2026-07-08 research pass, flagged for a fresh HR-Pro/legal review before launch, see UNVERIFIED_RESEARCH_FLAGS below.",
  },
  {
    id: "gap-wage-hour-partial",
    category: "Wage & Hour",
    jurisdiction: "CA",
    severity: "medium",
    onPageStatement: "Wage and hour practices",
    reportDiagnosis:
      "An informal or inconsistent meal and rest break and timekeeping process still carries real exposure. The meal break rule (30 minutes before the end of the fifth hour, a second before the end of the tenth hour on longer shifts, Labor Code Section 512), the rest break rule (paid 10 minutes per four hours, Labor Code Section 226.7), and accurate overtime records apply to every shift, not most. Missing a compliant break owes one additional hour of pay at the regular rate, including nondiscretionary bonuses per Ferra v. Loews Hollywood Hotel (Cal. 2021), recoverable for a four-year window, and inconsistent practices make it hard to show which shifts were compliant.",
    scopeOfWork: [
      "Audit current timekeeping and break records for consistency across employees and shifts",
      "Identify where the fifth-hour and tenth-hour meal triggers and the four-hour rest-break interval are not being met",
      "Standardize the process for every future shift",
      "Document a consistent overtime calculation method",
    ],
    complianceAngle:
      "Wage and hour exposure, the highest-volume CA litigation area (LEGAL-RESEARCH-2026-07-14.md item 8, question A, added 2026-07-14)",
    sourceRef:
      "Cal. Labor Code Section 512 (meal breaks); IWC Wage Orders and Labor Code Section 226.7 (rest breaks, premium pay), leginfo.legislature.ca.gov, DIR faq_mealperiods.htm; Ferra v. Loews Hollywood Hotel, LLC (Cal. 2021). lastVerified 2026-07-14. Added 2026-07-14, not part of the original 2026-07-08 research pass, flagged for a fresh HR-Pro/legal review before launch, see UNVERIFIED_RESEARCH_FLAGS below.",
  },
  {
    id: "gap-workerscomp-none",
    category: "Workers' Compensation",
    jurisdiction: "CA",
    severity: "high",
    onPageStatement: "Workers' compensation coverage",
    reportDiagnosis:
      "Every California employer with one or more employees, including part-time, temporary, and family-member employees, must carry workers' compensation insurance (Labor Code Section 3700). There is no small-employer exemption. Being uninsured is a misdemeanor (Labor Code Section 3700.5), carrying a minimum $10,000 fine or up to a year in county jail, or both, plus civil and administrative penalties up to $100,000. If an injury occurs while uninsured, penalties run $10,000 per employee on payroll for a compensable claim, up to $100,000. The Division of Labor Standards Enforcement can issue a Stop Order halting all use of employee labor until coverage is secured. SB 291 (effective January 1, 2026) raised the minimum penalties for uninsured contractors further. Coverage alone is not the full picture: once a workplace injury actually happens, you must hand the injured employee a claim form (DWC-1) within one working day of learning about the injury, keep a workers' comp poster and the Time of Hire pamphlet current and visible, and run a return-to-work or interactive process once the employee is cleared to come back. Without insurance, none of that process exists yet either.",
    scopeOfWork: [
      "Confirm current headcount, including part-time, temporary, and family-member employees, against the coverage requirement",
      "Secure workers' compensation coverage for every employee",
      "Document proof of coverage and keep it current",
      "Build a process to confirm coverage stays active as headcount changes",
      "Build a documented workplace-injury process: DWC-1 claim form issued within one working day, current workers' comp poster and Time of Hire pamphlet, and a return-to-work or interactive process",
    ],
    complianceAngle:
      "Workers' compensation coverage, a bright-line legal mandate with hard penalties (LEGAL-RESEARCH-2026-07-14.md item 9, question B, added 2026-07-14). Injury-process content added 2026-07-15 per LeiLani's feedback that Yaz's original request was about the injury-handling process, not just insurance.",
    sourceRef:
      "Cal. Labor Code Sections 3700 and 3700.5, leginfo.legislature.ca.gov; CA DIR Division of Workers' Compensation employer FAQ, dir.ca.gov; SB 291 (2026); Labor Code Section 5401 and 8 CCR Section 10118 (DWC-1 claim form, one-working-day deadline); Labor Code Section 3550 (workers' comp notice and Time of Hire pamphlet). lastVerified 2026-07-14 for the coverage facts; injury-process facts added 2026-07-15, not yet through a fresh legal pass, see UNVERIFIED_RESEARCH_FLAGS below.",
  },
  {
    id: "gap-workerscomp-unsure",
    category: "Workers' Compensation",
    jurisdiction: "CA",
    severity: "medium",
    onPageStatement: "Workers' compensation coverage",
    reportDiagnosis:
      "Every California employer with one or more employees must carry workers' compensation insurance (Labor Code Section 3700), no small-employer exemption, and being uninsured is a misdemeanor with penalties up to $100,000 (Labor Code Section 3700.5). Not knowing whether every employee, including part-time, temporary, and family-member employees, is actually covered means you cannot currently confirm you meet this bright-line requirement. Coverage is also only half of it: once a workplace injury happens, the employer must hand the injured employee a claim form (DWC-1) within one working day of learning about the injury, keep a workers' comp poster and Time of Hire pamphlet current, and run a return-to-work process. Answering 'not sure' on coverage usually means that process is not documented either.",
    scopeOfWork: [
      "Confirm current coverage actually extends to every employee, including part-time, temporary, and family-member employees",
      "Pull proof of coverage and confirm it is active",
      "Close any coverage gaps immediately",
      "Build a process to confirm coverage stays current as headcount changes",
      "Build a documented workplace-injury process: DWC-1 claim form issued within one working day, current workers' comp poster and Time of Hire pamphlet, and a return-to-work or interactive process",
    ],
    complianceAngle:
      "Workers' compensation coverage, a bright-line legal mandate with hard penalties (LEGAL-RESEARCH-2026-07-14.md item 9, question B, added 2026-07-14). Injury-process content added 2026-07-15 per LeiLani's feedback that Yaz's original request was about the injury-handling process, not just insurance.",
    sourceRef:
      "Cal. Labor Code Sections 3700 and 3700.5, leginfo.legislature.ca.gov; CA DIR Division of Workers' Compensation employer FAQ, dir.ca.gov; SB 291 (2026); Labor Code Section 5401 and 8 CCR Section 10118 (DWC-1 claim form, one-working-day deadline); Labor Code Section 3550 (workers' comp notice and Time of Hire pamphlet). lastVerified 2026-07-14 for the coverage facts; injury-process facts added 2026-07-15, not yet through a fresh legal pass, see UNVERIFIED_RESEARCH_FLAGS below.",
  },
  {
    id: "gap-other-state",
    category: "Multi-State Compliance",
    jurisdiction: "not-legal-requirement",
    severity: "medium",
    onPageStatement: "Primary-state compliance alignment",
    reportDiagnosis:
      "This report is built on California's framework, the most demanding in the country. If your employees are actually governed by a different state's laws, its own wage, leave, and notice rules apply instead, and they can differ meaningfully from what is referenced here.",
    scopeOfWork: [
      "Confirm which state's laws actually govern your employees",
      "Replace California-specific assumptions with that state's requirements",
      "Identify which risk areas here still apply, and how, under that state's law",
      "Confirm the employee handbook covers every state where you have employees, with policies identified by state",
      "Confirm each employee's new-hire and ongoing paperwork meets their own state's and city's requirements",
    ],
    complianceAngle:
      "State-aware framing, per the 2026-07-08 buildspec geo decision: the tool is built California-first and must generalize honestly for a non-California, single-state answer. State/city paperwork and by-state handbook bullets added 2026-07-15 per LeiLani's feedback.",
    sourceRef:
      "btc-paid-ads-campaign-buildspec-v1-2026-07-08.md (geo decision); general principle of state-level employment law primacy. lastVerified 2026-07-08.",
  },
];

export function getGapItem(id: string): GapItem {
  const item = GAP_LIBRARY.find((g) => g.id === id);
  if (!item) {
    throw new Error(`Unknown gap item id: ${id}`);
  }
  return item;
}

/**
 * The industry lawsuit-cost anchor. Re-sourced 2026-07-14 away from BTC's own
 * pitch deck (Genevieve flagged the prior self-citation) to two named,
 * citable third-party sources, per LEGAL-RESEARCH-2026-07-14.md item 10 and
 * Noah's FLAG 2 decision: keep the $200,000 headline, re-source it. TODO
 * confirm with BTC that this framing (Novian Law's through-trial figure, with
 * Hiscox's SME-specific average as supporting context) is the final wording.
 * Always shown as an industry figure, never a claim about this specific
 * business's likely exposure. Not tied to any answer, always included in the
 * hosted report's cost-context section.
 */
export const INDUSTRY_LAWSUIT_ANCHOR = {
  amountUsd: 200000,
  framing:
    "Defending an employment claim through trial can exceed $200,000 (Novian Law, 2026). Among small and mid-size employers, defense and settlement costs average an estimated $160,000 (Hiscox). These are industry-wide figures, not a prediction about this business specifically and not a guarantee.",
  source:
    "novianlaw.com, cost of defending and resolving an employment claim (2026); Hiscox Guide to Employee Lawsuits, average defense and settlement costs among small and mid-size employers (2015-2017 data, flagged as dated). lastVerified 2026-07-14.",
};

/**
 * Legal facts flagged UNVERIFIED during the 2026-07-08 research pass.
 * Excluded from any confident claim in the gap library above. Kept here so
 * they are visible to the HR-Pro reviewer rather than silently dropped.
 *
 * RESOLVED 2026-07-14 and removed from this list: whether Cal. Labor Code
 * Section 2775 (the ABC test) received a material 2025/2026 amendment. AB
 * 1514 (effective 2026-01-01) is that amendment, it adjusts some
 * professional-services exemptions and leaves the core ABC standard
 * unchanged. See gap-1099-mostly and gap-1099-some sourceRef.
 */
export const UNVERIFIED_RESEARCH_FLAGS = [
  "The current federal FLSA exempt salary threshold. It has been in active litigation flux since the US DOL's 2024 rule was vacated. This tool deliberately does not state a federal dollar figure anywhere, only the confirmed California figure ($70,304/yr, DIR News Release 2025-118).",
  "Whether any single CRD or DIR source states in so many words that California has 'no handbook mandate.' The individual component requirements (harassment policy, paid sick leave policy, wage notice, workers' comp notice) are each independently well-sourced; the negative framing itself is an absence-of-law finding, not a single citation.",
  "gap-newhire-none and gap-newhire-partial (added 2026-07-09, not part of the 2026-07-08 research pass): the federal Form I-9 requirement (8 U.S.C. Section 1324a, INA Section 274A) and the CA Wage Theft Prevention Act notice at hire (Labor Code Section 2810.5) are both well-established, but this build did not independently confirm the exact current statutory or regulatory citation for California's specific workplace-poster mandate (referenced here only generally as 'CA DIR poster requirements'). Recommend a final legal pass confirming the precise poster-requirement citation before these two gap items reach a real prospect.",
  "gap-wage-hour-none and gap-wage-hour-partial, and gap-workerscomp-none and gap-workerscomp-unsure (added 2026-07-14, questions A and B of the LEGAL-RESEARCH-2026-07-14.md pass): the underlying statutes (Labor Code Sections 512, 226.7, 3700, 3700.5; SB 291) are well-established and dated 2026-07-14, but these four items have not yet been through the same HR-Pro sign-off rigor as the original 11. Recommend a fresh legal pass before launch, see REVIEW.md.",
  "gap-leave-none (expanded 2026-07-14, second pass, per LeiLani's direct feedback that the original four-leave framing understated the real stack): nine additional CA leave laws were researched and added (paid sick leave already covered; new additions are jury duty and witness leave, kin care, bereavement leave, reproductive loss leave, organ and bone marrow donor leave, school-activity leave, military spouse leave, and victims of qualifying acts of violence leave). Each citation was cross-checked against leginfo.legislature.ca.gov and CRD/DIR primary guidance. Three items were deliberately left out of the report copy rather than risk overclaiming: (1) SB 590 (expands Paid Family Leave to 'designated persons') is enacted but not effective until 2028-07-01, including it would misstate it as a current obligation; (2) Elections Code Section 14000 (voting leave) has no independently confirmed enforcing agency for wage complaints and was left out of this leave-process gap to avoid a citation we could not verify; (3) Labor Code Sections 1025-1028 (alcohol/drug rehab) and 1040-1044 (adult literacy) are reasonable-accommodation duties, not scheduled leave entitlements, and were excluded from a 'leave' framing on that basis. Not yet through the same HR-Pro sign-off rigor as the original 11, see REVIEW.md.",
  "gap-training-none and gap-training-unsure (updated 2026-07-15 per LeiLani's feedback): added that new hires must be trained within six months of hire, and temp/seasonal staff within 30 calendar days or 100 hours worked, whichever comes first, citing 2 CCR Section 11024. This citation has not been independently cross-checked against leginfo.legislature.ca.gov or calcivilrights.ca.gov in this pass. Recommend confirming the exact regulation section and deadline language before a real prospect sees it, see REVIEW.md.",
  "gap-exempt-all and gap-exempt-mix (updated 2026-07-15 per LeiLani's feedback): the 2027 CA exempt-salary floor ($74,672/yr, $6,222.67/mo) was supplied directly by LeiLani, ahead of CA DIR's usual August announcement for the following year. Unlike every other dollar figure in this file, it has not been independently verified against a CA DIR news release or leginfo text. Recommend confirming against CA DIR once published (expected around 2026-08-01) before a real prospect sees it, see REVIEW.md.",
  "gap-workerscomp-none and gap-workerscomp-unsure (updated 2026-07-15 per LeiLani's feedback that Yaz's original request was about the workplace-injury process, not just insurance): added the DWC-1 claim form one-working-day deadline (Labor Code Section 5401, 8 CCR Section 10118) and the workers' comp notice / Time of Hire pamphlet requirement (Labor Code Section 3550). These citations have not been independently cross-checked against leginfo.legislature.ca.gov or dir.ca.gov in this pass. Recommend a fresh legal pass before launch, see REVIEW.md.",
];
