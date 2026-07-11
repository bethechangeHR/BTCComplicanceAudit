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
      "California's ABC test (Labor Code Section 2775) presumes every worker is an employee, not a contractor, unless you prove all three prongs: they control their own work, the work falls outside your usual business, and they run an independent trade. Businesses built mainly on 1099 contractors carry serious reclassification exposure, back pay, unpaid payroll taxes, and penalties, if that test is not met.",
    scopeOfWork: [
      "Audit every 1099 relationship against the ABC test, not industry convention",
      "Check which roles fall within the narrow exemptions (Labor Code Sections 2776-2787)",
      "Determine which contractors need to convert to W-2 and on what timeline",
      "Document a classification policy for all future hires",
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
      "The same ABC test (Labor Code Section 2775) applies to every 1099 relationship, even a single one. One misclassified contractor can still trigger back pay, unpaid payroll taxes, and penalties.",
    scopeOfWork: [
      "Audit every current 1099 relationship against the ABC test",
      "Confirm which roles fall within the statutory exemptions (Labor Code Sections 2776-2787)",
      "Document the classification rationale for each contractor",
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
      "California's bar for exempt, no-overtime status is stricter than federal law: a duties test plus a minimum salary of twice the state minimum wage, $70,304 per year as of January 1, 2026 (Labor Code Section 515(a)). Businesses that classify staff as exempt using only federal assumptions often miss this higher floor, and back-overtime exposure compounds for every misclassified employee.",
    scopeOfWork: [
      "Run the California duties test, not the federal test, against every exempt role",
      "Confirm every exempt salary meets the current $70,304 California floor",
      "Identify misclassified roles and estimate the back-overtime exposure window",
      "Document a defensible classification rationale for every exempt role",
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
      "For your salaried staff, the same standard applies: a duties test plus a minimum salary of twice the state minimum wage, currently $70,304 per year (Labor Code Section 515(a)). Mixed teams need every salaried role checked individually, partial rollouts are where undocumented exceptions tend to hide.",
    scopeOfWork: [
      "Run the California duties test against each salaried role individually",
      "Confirm each salary meets the current $70,304 California floor",
      "Document why each role qualifies as exempt",
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
      "California requires several written policies regardless of format: harassment prevention (2 CCR Section 11023), paid sick leave (Labor Code Sections 245-249), a wage notice at hire (Labor Code Section 2810.5), a workers' compensation rights notice (Labor Code Section 3550), and, starting February 1, 2026, a Know Your Rights notice (SB 294). Without a handbook, you have no consistent record of meeting any of them.",
    scopeOfWork: [
      "Draft the required policies: harassment prevention, sick leave, wage notice, workers' comp rights, 2026 Know Your Rights notice",
      "Add practice-level policies that reduce dispute risk: meal and rest breaks, PTO, discipline, termination",
      "Set a review cadence to keep the handbook current",
      "Roll out acknowledgment and signature tracking for every employee",
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
      "A handbook untouched for two or more years is very likely missing recent law: paid sick leave changes (AB 2288 2024, SB 616, AB 406 2025) and the new Know Your Rights notice taking effect February 2026 (SB 294). Its age is a direct measure of how much it is missing.",
    scopeOfWork: [
      "Compare the handbook against every California requirement that has changed",
      "Update paid sick leave, wage notice, and 2026 Know Your Rights language",
      "Set an annual review cadence tied to California's legislative calendar",
      "Redistribute with fresh acknowledgment and signature tracking",
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
      "California employers with five or more employees, including temporary and seasonal staff, must provide sexual harassment prevention training, 2 hours for supervisors and 1 hour for staff, every two years (Government Code Section 12950.1). With no training on record, you have no documented proof of this legally required step, and that absence can count against you if a claim is filed.",
    scopeOfWork: [
      "Confirm headcount against the 5-employee threshold, all locations and temp staff",
      "Deliver CRD-compliant training: 2 hours for supervisors, 1 hour for staff",
      "Document completion records for every employee",
      "Build a recurring 2-year retraining cadence",
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
      "Not knowing whether your training meets the state's standard carries the same exposure as skipping it. The burden of proving compliance (Government Code Section 12950.1) sits with you, and informal or undocumented training cannot meet that burden.",
    scopeOfWork: [
      "Pull existing training records and confirm hours and content for every employee",
      "Identify anyone missing documented, CRD-compliant training within two years",
      "Close any gaps and document completion going forward",
      "Build a recurring 2-year retraining cadence",
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
      "California leave law stacks by headcount: paid sick leave applies at any size (Labor Code Sections 245-249), CFRA and pregnancy disability leave apply at 5 or more employees (Government Code Sections 12945.2 and 12945), and federal FMLA layers on at 50 or more. Without a documented process for requests, eligibility, and job protection, you are exposed under whichever law applies at your current size, and that changes as you grow.",
    scopeOfWork: [
      "Map headcount against every leave-law threshold that applies",
      "Build a documented intake and eligibility-tracking process",
      "Train managers on job-protection obligations during leave",
      "Set a review trigger tied to headcount growth",
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
      "Employment law is set mostly at the state level, not federally, covering minimum wage, overtime, sick leave accrual, final pay, and required notices. A policy compliant in one state is often non-compliant in another. Each new state you hire in adds its own separate compliance regime.",
    scopeOfWork: [
      "Inventory every state where you actually have an employee",
      "Build a state-by-state compliance matrix: wage and hour, leave, notices",
      "Identify which policies need state-specific versions",
      "Set a process for checking requirements before hiring in a new state",
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
