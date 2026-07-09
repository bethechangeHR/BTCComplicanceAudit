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

export const GAP_LIBRARY: GapItem[] = [
  {
    id: "gap-1099-mostly",
    category: "Worker Classification",
    jurisdiction: "CA",
    severity: "high",
    onPageStatement: "Independent contractor classification",
    reportDiagnosis:
      "Under California's ABC test (Labor Code Section 2775, enacted by AB 5 in 2019 and refined by AB 2257 in 2020), a worker is presumed to be an employee, not an independent contractor, unless the hiring business can prove all three of the following: the worker is free from the company's control and direction, the work performed falls outside the company's usual course of business, and the worker is customarily engaged in an independently established trade of the same nature. Companies that rely mostly on 1099 contractors for their core work generally carry meaningful reclassification exposure, since misclassification can trigger back pay, unpaid payroll taxes, penalties, and unemployment insurance liability.",
    scopeOfWork: [
      "Audit every current 1099 relationship against the three-part ABC test, not against industry convention alone",
      "Identify which roles fall outside the narrow statutory exemptions in Labor Code Sections 2776 to 2787",
      "Determine which contractor relationships need to convert to W-2 employment and on what timeline",
      "Build a documented classification policy for all future hires and contractor engagements",
    ],
    complianceAngle:
      "California classification / exempt vs non-exempt errors that trigger back pay (btc-kb-lead-magnets.md section 6)",
    sourceRef:
      "Cal. Labor Code Section 2775 (AB 5, 2019; amended by AB 2257, 2020), leginfo.legislature.ca.gov, enforced by CA DIR / Labor Commissioner. lastVerified 2026-07-08.",
  },
  {
    id: "gap-1099-some",
    category: "Worker Classification",
    jurisdiction: "CA",
    severity: "medium",
    onPageStatement: "Independent contractor classification",
    reportDiagnosis:
      "California's ABC test (Labor Code Section 2775) applies to every 1099 relationship, not just companies built primarily around contractors. Even limited use of contractors carries the same reclassification exposure for those specific roles: the worker is presumed an employee unless the company proves all three prongs of the test, and a single misclassified role can still trigger back pay, unpaid payroll taxes, and penalties.",
    scopeOfWork: [
      "Audit every current 1099 relationship, even a small number, against the three-part ABC test",
      "Confirm which roles, if any, fall within the narrow statutory exemptions in Labor Code Sections 2776 to 2787",
      "Document the classification rationale for each contractor relationship in case it is ever challenged",
    ],
    complianceAngle:
      "California classification / exempt vs non-exempt errors that trigger back pay (btc-kb-lead-magnets.md section 6)",
    sourceRef:
      "Cal. Labor Code Section 2775 (AB 5, 2019; amended by AB 2257, 2020), leginfo.legislature.ca.gov, enforced by CA DIR / Labor Commissioner. lastVerified 2026-07-08.",
  },
  {
    id: "gap-exempt-all",
    category: "Worker Classification",
    jurisdiction: "CA",
    severity: "high",
    onPageStatement: "Exempt / salaried classification",
    reportDiagnosis:
      "California sets a stricter bar for exempt, no-overtime status than federal law. Beyond meeting a duties test, an exempt employee must earn a salary of at least twice the state minimum wage for full-time work, which is $70,304 per year as of January 1, 2026 under Labor Code Section 515(a) and the applicable Industrial Welfare Commission Wage Order. Businesses that classify most or all staff as salaried based on federal assumptions alone commonly fall short of California's higher salary floor, its separate duties test, or both, and back-overtime exposure compounds for every misclassified employee over time.",
    scopeOfWork: [
      "Run the California duties test, not the federal test alone, against every current exempt role",
      "Confirm every exempt employee's actual annual salary meets the current $70,304 California floor",
      "Identify which roles are misclassified and estimate the back-overtime exposure window",
      "Build a documented, defensible classification rationale for every exempt role going forward",
    ],
    complianceAngle:
      "California classification / exempt vs non-exempt errors that trigger back pay, BTC's own June 2026 blog post: Are Your Salaried Employees Really Exempt? The FLSA Error That Triggers Back Pay (btc-kb-lead-magnets.md section 6)",
    sourceRef:
      "Cal. Labor Code Section 515(a); CA DIR News Release 2025-118 confirming the 2026 minimum wage increase to $16.90/hr, dir.ca.gov. lastVerified 2026-07-08.",
  },
  {
    id: "gap-exempt-mix",
    category: "Worker Classification",
    jurisdiction: "CA",
    severity: "medium",
    onPageStatement: "Exempt / salaried classification",
    reportDiagnosis:
      "For the salaried portion of a mixed team, the same California standard applies: exempt status requires both a duties test and a minimum salary of twice the state minimum wage for full-time work, currently $70,304 per year under Labor Code Section 515(a). A mixed hourly-and-salaried workforce still needs every salaried role individually confirmed against this standard, since partial adoption of salaried classification is exactly where inconsistent or undocumented decisions tend to accumulate.",
    scopeOfWork: [
      "Run the California duties test against each currently salaried role individually",
      "Confirm each salaried employee's annual salary meets the current $70,304 California floor",
      "Document why each salaried role qualifies as exempt, distinct from the hourly roles",
    ],
    complianceAngle:
      "California classification / exempt vs non-exempt errors that trigger back pay (btc-kb-lead-magnets.md section 6)",
    sourceRef:
      "Cal. Labor Code Section 515(a); CA DIR News Release 2025-118. lastVerified 2026-07-08.",
  },
  {
    id: "gap-handbook-none",
    category: "Handbook & Written Policies",
    jurisdiction: "CA",
    severity: "high",
    onPageStatement: "No employee handbook",
    reportDiagnosis:
      "California does not require a handbook by that name, but it does require several specific written notices and policies regardless of format: a harassment, discrimination, and retaliation prevention policy with a complaint procedure (2 CCR Section 11023, enforced by the Civil Rights Department), a paid sick leave policy (Labor Code Sections 245 to 249), wage and hour details provided at hire under the Wage Theft Prevention Act (Labor Code Section 2810.5), and a workers' compensation rights notice (Labor Code Section 3550). Starting February 1, 2026, a new standalone Workplace Know Your Rights notice is also required at hire and annually under SB 294. Without a handbook or equivalent written policies, a business has no consistent, documented way to show it has met any of these requirements if a claim is ever filed.",
    scopeOfWork: [
      "Draft the legally required written policies: harassment prevention, paid sick leave, wage notice, workers' compensation rights, and the new 2026 Know Your Rights notice",
      "Add the practice-level policies that meaningfully reduce dispute risk even though they are not independently mandated: meal and rest breaks, PTO, discipline, and termination procedures",
      "Establish a review cadence so the handbook stays current as California employment law changes, which happens most years",
      "Roll out acknowledgment and signature tracking for every current and future employee",
    ],
    complianceAngle:
      "Outdated or missing handbook exposure (btc-kb-lead-magnets.md section 6)",
    sourceRef:
      "Cal. Gov Code Section 12950.1 and 2 CCR Section 11023 (CRD, calcivilrights.ca.gov); Cal. Labor Code Sections 245-249, 2810.5, 3550; SB 294 Workplace Know Your Rights Act, effective 2026-02-01 (The Employer Report, Jan 2026). lastVerified 2026-07-08.",
  },
  {
    id: "gap-handbook-stale",
    category: "Handbook & Written Policies",
    jurisdiction: "CA",
    severity: "medium",
    onPageStatement: "Outdated employee handbook",
    reportDiagnosis:
      "A handbook that has not been reviewed in two or more years is very likely missing recent California requirements. Paid sick leave rules were amended in 2024 (AB 2288, SB 616) with further technical changes in 2025 (AB 406), and a new standalone Workplace Know Your Rights notice takes effect February 1, 2026 under SB 294. California employment law changes at this pace most years, so a handbook's age is a direct, measurable proxy for how many current requirements it is missing.",
    scopeOfWork: [
      "Compare the existing handbook against every California requirement that has changed since its last update",
      "Update the paid sick leave, wage notice, and any 2026 Know Your Rights language to current law",
      "Establish an annual (at minimum) review cadence going forward, tied to California's legislative calendar",
      "Redistribute the updated handbook with fresh acknowledgment and signature tracking",
    ],
    complianceAngle:
      "Outdated or missing handbook exposure (btc-kb-lead-magnets.md section 6)",
    sourceRef:
      "Cal. Labor Code Sections 245-249 (AB 2288 2024, AB 406 2025 amendments); SB 294, effective 2026-02-01 (The Employer Report, Jan 2026). lastVerified 2026-07-08.",
  },
  {
    id: "gap-training-none",
    category: "Harassment Prevention Training",
    jurisdiction: "CA",
    severity: "high",
    onPageStatement: "Harassment-prevention training",
    reportDiagnosis:
      "California employers with five or more employees, counting everyone on payroll anywhere including temporary and seasonal staff, are required by Government Code Section 12950.1 to provide sexual harassment prevention training to every supervisor (2 hours) and every non-supervisory employee (1 hour) at least once every two years, with new hires and newly promoted supervisors trained within six months. This requirement, expanded from an earlier 50-employee, supervisors-only version by SB 1343 in 2018, is enforced by the California Civil Rights Department. Employers with no completed training have no documented record of taking this legally required step, and the CRD and courts can treat that absence as evidence the employer failed to take reasonable steps to prevent harassment if a claim is ever filed.",
    scopeOfWork: [
      "Confirm current headcount against the 5-employee threshold, counting all locations and temporary staff",
      "Deliver CRD-compliant training to every supervisor (2 hours) and every non-supervisory employee (1 hour)",
      "Document completion records for every employee, since the burden of proof falls on the employer",
      "Build a recurring 2-year retraining cadence and a new-hire, new-supervisor onboarding trigger",
    ],
    complianceAngle:
      "Harassment-prevention training requirements, CA, 5+ employees (btc-kb-lead-magnets.md section 6)",
    sourceRef:
      "Cal. Gov Code Section 12950.1 (SB 1343, 2018, compliance deadline 2020-01-01); CRD Sexual Harassment Prevention Training FAQ, calcivilrights.ca.gov. lastVerified 2026-07-08.",
  },
  {
    id: "gap-training-unsure",
    category: "Harassment Prevention Training",
    jurisdiction: "CA",
    severity: "medium",
    onPageStatement: "Harassment-prevention training",
    reportDiagnosis:
      "Not knowing whether current training meets the state's requirements carries the same practical exposure as never having completed it. Government Code Section 12950.1 requires employers with five or more employees to train every supervisor (2 hours) and non-supervisory employee (1 hour) every two years, and the burden of proving compliance sits with the employer. Without a clear, documented completion record for every employee, that burden cannot be met even if some training happened informally at some point.",
    scopeOfWork: [
      "Pull whatever training records currently exist and confirm they cover every employee, the correct hours, and the correct content",
      "Identify any employee or supervisor missing documented, CRD-compliant training within the last two years",
      "Close any gaps found and put a documented completion record in place going forward",
      "Build a recurring 2-year retraining cadence tied to actual completion dates, not assumptions",
    ],
    complianceAngle:
      "Harassment-prevention training requirements, CA, 5+ employees (btc-kb-lead-magnets.md section 6)",
    sourceRef:
      "Cal. Gov Code Section 12950.1 (SB 1343, 2018); CRD Sexual Harassment Prevention Training FAQ. lastVerified 2026-07-08.",
  },
  {
    id: "gap-leave-none",
    category: "Leave & Accommodation Process",
    jurisdiction: "CA",
    severity: "high",
    onPageStatement: "Documented leave process",
    reportDiagnosis:
      "California layers several leave laws that attach at different headcount levels: paid sick leave (Labor Code Sections 245-249) applies to every employer regardless of size, the California Family Rights Act (Government Code Section 12945.2, expanded to employers with 5 or more employees by SB 1383 in 2021) and Pregnancy Disability Leave (Government Code Section 12945) both apply at 5 or more employees, and federal FMLA layers on top at 50 or more employees within 75 miles. Without a documented process for handling leave requests, tracking eligibility, and administering job protection, a growing business is exposed to claims under whichever of these laws applies at its current size, and the applicable combination changes as headcount grows.",
    scopeOfWork: [
      "Map current headcount against every leave-law threshold that applies: paid sick leave at any size, CFRA and pregnancy disability leave at 5 or more employees, federal FMLA at 50 or more",
      "Build a documented intake and eligibility-tracking process for every leave request",
      "Train managers on job-protection obligations during leave, since undocumented manager decisions are a common source of claims",
      "Set a review trigger tied to headcount growth, since crossing 5 or 50 employees changes which laws apply",
    ],
    complianceAngle:
      "Leave-law exposure, FMLA at 50+, plus more generous state laws that hit small employers (btc-kb-lead-magnets.md section 6)",
    sourceRef:
      "Cal. Labor Code Sections 245-249; Cal. Gov Code Sections 12945 and 12945.2 (SB 1383, 2021), calcivilrights.ca.gov; 29 U.S.C. Section 2611 / 29 CFR Section 825.105, US DOL Fact Sheet #28. lastVerified 2026-07-08.",
  },
  {
    id: "gap-multistate",
    category: "Multi-State Compliance",
    jurisdiction: "multi-state",
    severity: "high",
    onPageStatement: "Multi-state compliance exposure",
    reportDiagnosis:
      "U.S. employment law is set primarily at the state level, not federally, covering minimum wage, overtime rules, paid sick leave accrual, final paycheck timing, and required workplace notices. A policy that is fully compliant in one state is frequently non-compliant in another for the exact same class of employees. As a business adds employees in additional states, the number of separate, overlapping compliance regimes it must simultaneously satisfy grows with each new state added, not just with total headcount.",
    scopeOfWork: [
      "Inventory every state where the business currently has an employee, not just where the business is legally registered",
      "Build a state-by-state compliance matrix covering wage and hour, leave, and required notices",
      "Identify which policies, including handbook, leave, and classification, need state-specific versions rather than a single California-only policy",
      "Establish a process for evaluating compliance requirements before hiring in any new state",
    ],
    complianceAngle:
      "Multi-state exposure as headcount grows (btc-kb-lead-magnets.md section 6)",
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
      "Every employer, regardless of state, must complete a federal Form I-9 employment eligibility verification for each new hire under the Immigration Reform and Control Act (8 U.S.C. Section 1324a; Immigration and Nationality Act Section 274A). California additionally requires a written Wage Theft Prevention Act notice at the time of hire, covering pay rate, payday, and employer information (Labor Code Section 2810.5), and requires current state and federal workplace posters to be displayed. A business with no consistent new-hire paperwork process has no reliable record it has met any of these separately enforced requirements for a given hire, and Form I-9 violations in particular carry per-form penalties regardless of whether the underlying hire was authorized to work.",
    scopeOfWork: [
      "Establish a documented new-hire checklist covering Form I-9 completion and reverification timing for every hire",
      "Confirm the Wage Theft Prevention Act written notice (Labor Code Section 2810.5) is issued at time of hire for every non-exempt employee",
      "Audit current state and federal workplace posters against what is currently required and update as needed",
      "Build a retained, audit-ready recordkeeping process for every new-hire document going forward",
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
      "Inconsistent new-hire paperwork carries the same underlying exposure as having no process at all, for whichever hires it was skipped on. Form I-9 (8 U.S.C. Section 1324a) must be completed for every hire, not most; California's Wage Theft Prevention Act notice (Labor Code Section 2810.5) is required at hire for every non-exempt employee; and posted workplace notices must stay current regardless of how many hires have gone through a complete process. A business that only completes this some of the time has no way to identify, without an audit, exactly which employees are missing which document.",
    scopeOfWork: [
      "Audit existing personnel files to identify which hires are missing a completed Form I-9, a Wage Theft Prevention Act notice, or both",
      "Close any gaps found for current employees",
      "Standardize the new-hire paperwork process so it runs the same way for every future hire",
      "Confirm current state and federal workplace posters are up to date",
    ],
    complianceAngle:
      "New-hire onboarding and required-notice exposure. Added 2026-07-09 as part of the Part A scoring rework (question 8, newHirePaperwork). Not part of the original 2026-07-08 btc-kb-lead-magnets.md section 6 research pass, flagged for a fresh HR-Pro/legal review before launch, see UNVERIFIED_RESEARCH_FLAGS below.",
    sourceRef:
      "Federal Form I-9 requirement under the Immigration Reform and Control Act, 8 U.S.C. Section 1324a, INA Section 274A, uscis.gov; Cal. Labor Code Section 2810.5 (Wage Theft Prevention Act written notice at hire), leginfo.legislature.ca.gov; required state and federal workplace posters, CA DIR (dir.ca.gov) and US DOL. lastVerified 2026-07-09. This is a new addition made after the 2026-07-08 research pass and has not been through the same legal-pass rigor as the rest of this file, see UNVERIFIED_RESEARCH_FLAGS.",
  },
  {
    id: "gap-other-state",
    category: "Multi-State Compliance",
    jurisdiction: "not-legal-requirement",
    severity: "medium",
    onPageStatement: "Primary-state compliance alignment",
    reportDiagnosis:
      "This report is built around California's compliance framework, currently the most demanding in the country and the reason it anchors this tool. A business operating in a single state other than California is governed by that state's own wage and hour, leave, and notice requirements instead, and they can differ meaningfully from anything else referenced here. Relying on general or California-specific assumptions in a different state creates its own, separate gap.",
    scopeOfWork: [
      "Confirm which state's laws actually govern the business's employees",
      "Replace any California-specific assumptions in current policies with the correct state's own requirements",
      "Identify which of this report's general risk areas, classification, leave, training, and handbook, still apply and how, under the correct state's laws",
    ],
    complianceAngle:
      "State-aware framing, per the 2026-07-08 buildspec geo decision: the tool is built California-first and must generalize honestly for a non-California, single-state answer",
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
 * The industry lawsuit-cost anchor. Always shown as an industry figure
 * sourced to BTC's own pitch deck, never a claim about this specific
 * business's likely exposure. Not tied to any answer, always included in
 * the hosted report's cost-context section.
 */
export const INDUSTRY_LAWSUIT_ANCHOR = {
  amountUsd: 200000,
  framing:
    "The average employment lawsuit costs an estimated $200,000. This is an industry-wide figure, not a prediction about this business specifically and not a BTC guarantee.",
  source:
    "Be the Change HR pitch deck (2026 Pitch Deck v2), citing an industry-wide average. See btc-source-of-truth.md. lastVerified 2026-07-06.",
};

/**
 * Legal facts flagged UNVERIFIED during the 2026-07-08 research pass.
 * Excluded from any confident claim in the gap library above. Kept here so
 * they are visible to the HR-Pro reviewer rather than silently dropped.
 */
export const UNVERIFIED_RESEARCH_FLAGS = [
  "Whether Cal. Labor Code Section 2775 (the ABC test) received any material 2025 or 2026 amendment beyond the 2020 AB 2257 exemption update. No new amendment was found, but the research pass did not exhaustively review every 2025-2026 bill. Recommend a final legal pass before asserting the ABC test is unchanged.",
  "The current federal FLSA exempt salary threshold. It has been in active litigation flux since the US DOL's 2024 rule was vacated. This tool deliberately does not state a federal dollar figure anywhere, only the confirmed California figure ($70,304/yr, DIR News Release 2025-118).",
  "Whether any single CRD or DIR source states in so many words that California has 'no handbook mandate.' The individual component requirements (harassment policy, paid sick leave policy, wage notice, workers' comp notice) are each independently well-sourced; the negative framing itself is an absence-of-law finding, not a single citation.",
  "gap-newhire-none and gap-newhire-partial (added 2026-07-09, not part of the 2026-07-08 research pass): the federal Form I-9 requirement (8 U.S.C. Section 1324a, INA Section 274A) and the CA Wage Theft Prevention Act notice at hire (Labor Code Section 2810.5) are both well-established, but this build did not independently confirm the exact current statutory or regulatory citation for California's specific workplace-poster mandate (referenced here only generally as 'CA DIR poster requirements'). Recommend a final legal pass confirming the precise poster-requirement citation before these two gap items reach a real prospect.",
];
