# PR52 — Launch readiness audit (initial static review)

Date: 2026-10-16. Scope: repository source review only. **No live end-to-end tests, penetration tests, production database checks, or payment-provider checks were performed.** Passing Vercel builds are not substitutes for these checks.

## Findings and next actions

| Priority | Finding | Evidence | Recommended follow-up |
| --- | --- | --- | --- |
| High | AI tailoring endpoint accepts unauthenticated POST requests; no server-enforced per-user quota or rate limit is visible in the route. If Gemini is configured, this exposes usage costs to automated abuse. | `app/api/tailor/route.ts` | PR53: introduce server-side abuse controls, with clear anonymous/free-user policy. Do not rely on localStorage usage counts. |
| High | AI request body is destructured without verifying JSON field types. Non-string values can throw, returning 500 instead of a useful 400. | `app/api/tailor/route.ts` | PR53: validate content type, string fields, size, and structured responses; bound external API timeouts. |
| Medium | PDF parser checks extension/MIME and size but does not verify PDF magic bytes or impose an extraction-text limit. PDF parsing is a public endpoint. | `app/api/parse-resume/route.ts` | PR53: add signature validation, extraction limit, and appropriate request protections. |
| Medium | Gemini error response body is logged to server logs; it may contain sensitive details. | `app/api/tailor/route.ts` | PR53: log safe metadata without dumping provider response bodies. |
| Medium | Saved Jobs page fetches once on mount, has no retry control and does not clear loaded data on auth changes while mounted. | `app/saved-jobs/page.tsx` | PR56: improve loading/retry and account-switch safety; test RLS independently. |
| Medium | README still refers to OpenAI environment variables and an example file that is not in the tracked tree, while the actual AI route uses Gemini. | `README.md`, `app/api/tailor/route.ts` | Update deployment docs and environment variable instructions before launch. |
| Medium | `npm run lint` uses `next lint` although package uses Next.js 15; confirm command compatibility and CI enforcement. | `package.json` | PR58: configure reproducible lint/typecheck/build CI and verify it runs. |
| Release blocker | No evidence yet of verified real job listings, real employer onboarding, production Supabase policy tests, or end-to-end apply/shortlist flows. | Source review alone cannot establish runtime readiness. | PR54–PR59: test against a controlled staging environment and document outcomes. |

## Release verification checklist

- [ ] Verify sign-in, sign-out, expired sessions and account switching on mobile and desktop.
- [ ] Validate Supabase RLS with **two distinct job seekers and two employers**; verify unauthorized read/write operations fail.
- [ ] Test resume upload (valid PDF, invalid PDF, oversize, unreadable PDF), paste, AI generation, download and copy.
- [ ] Verify AI usage limits and abuse protection; confirm no secrets appear in client bundles or logs.
- [ ] Test job posting, publishing, expiry, applications, employer status updates and cross-account isolation.
- [ ] Confirm demo jobs are visibly labeled as demonstrations and no unverified listing is presented as live.
- [ ] Test saved resumes, saved jobs, CSV exports, search and shareable filter links.
- [ ] Verify responsive layouts and keyboard navigation on real devices.
- [ ] Confirm production environment variables, domain, logging, monitoring, backup and rollback plan.
- [ ] Run automated checks and record reproducible pass/fail evidence.

## Decision

**Not yet certified launch-ready.** This is an initial static audit and a prioritized work plan, not proof of vulnerabilities being exploitable in production. Close high-priority gaps and execute the checklist before public launch.
