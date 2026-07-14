# BTC California HR Risk Audit

A paid-ads lead magnet for be the change HR. A visitor answers 11 questions in
60 to 90 seconds and receives an instant A-F HR compliance risk grade with
named (not detailed) gap categories, plus a free 30-minute HR discovery call
booked immediately on the result screen. After they give an email, a
personalized hosted audit report (full diagnosis and full scope of work,
never the actual fix) is delivered by email and SMS, with the same booking
link.

See `CLAUDE.md` for the full mission, architecture, and non-negotiable rules.
Read it before touching any code in this repo.

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS + Vitest, deployable on
Vercel. No database: the hosted report page is stateless, recomputed from an
HMAC-signed token in the URL.

## Local development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. Copy `.env.example` to `.env.local` and fill
in real values for any environment you're testing against (see comments in
`.env.example` for what each variable does). The app runs fine locally with
placeholder values; the webhook logs to the console instead of sending when
`COMPLIANCE_CHECK_WEBHOOK_URL` is unset.

## Running tests

```bash
npm test          # single run, includes the golden-master scenarios
npm run test:watch
npm run typecheck
npm run lint
npm run format:check
```

## Local QA with seeded scenarios

Visit `/preview` for a menu of seeded input scenarios, including the three
hand-reconciled golden-master scenarios documented in `VERIFICATION.md`, each
linking directly to its on-page result and hosted report.

## Channel modes

Paid mode ships now (default, no `mode` param required). Email mode
(`?mode=email&...`) is a stubbed future seam only, see `CLAUDE.md`.

## Deploying to Vercel

```bash
vercel
vercel --prod
```

Set every variable from `.env.example` in the Vercel project's environment
settings before the first production deploy. `REPORT_TOKEN_SECRET` must be a
real, long random secret in production, never the placeholder dev value.

## Annual maintenance

The CA exempt salary floor ($70,304) and the CA state minimum wage ($16.90/hr,
its basis) change every year. CA DIR announces the next year's minimum wage by
August 1, effective the following January 1. Update `data/gap-library.ts`
(`gap-exempt-all`, `gap-exempt-mix`) once the 2027 figure publishes, expected
around 2026-08-01. See the ANNUAL MAINTENANCE comment above `GAP_LIBRARY` in
that file.

## Project files that gate whether this can go live

- `REVIEW.md`: the human HR-Pro sign-off checklist (LeiLani/Genevieve), a
  liability gate on the scoring weights and every gap-item wording.
- `VERIFICATION.md`: the evidence-backed definition-of-done checklist.
- `ops/n8n-workflow.md`: the delivery pipeline's node map and go-live gate
  status, built and test-fired but not connected to real ad traffic yet.
