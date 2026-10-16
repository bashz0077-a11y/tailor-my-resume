# PR59 — Launch gate (2026-10-17)

**Decision: NOT CLEARED for unrestricted public launch.** This is a repository-based assessment, not a completed live security or end-to-end test. Vercel build checks prove compilation/deployment, not authorization correctness or AI cost controls.

## Completed in source

- PR53/55: AI input validation, bounded provider timeout, response shape validation and safer error logging.
- PR58: actual JSON body byte cap, PDF size checks and PDF signature checks.
- PR56/57: job application error handling and mobile accessibility improvements.
- README corrected for Gemini and Supabase configuration.

## Blocking gates (all must be verified before launch)

| Gate | Current evidence | Pass condition |
| --- | --- | --- |
| AI cost and abuse controls | `app/api/tailor/route.ts` is publicly callable; client localStorage is bypassable | Server-enforced rate limits/quotas, including anonymous abuse policy, verified with negative tests |
| Supabase privacy | Public `profiles` SELECT policy may expose preferences and location | Review deployed grants and policies, remediate private columns, verify anonymous requests cannot read them |
| Application integrity | Employer UPDATE policy may permit edits beyond status | Restrict mutable fields, verify employer cannot alter applicant, job or cover note |
| Database connection | TailorMyResume Supabase project not available in connected account | Identify correct project and run read-only policy/grant inspection, security advisors and staging isolation tests |
| End-to-end workflow | QA checklists exist but test execution not recorded | Test 2 seekers + 2 employers, job create/publish/apply/shortlist, saved data, account switching, unauthorized access |
| PDF endpoint resource controls | Multipart parser may consume large streamed body before file-size check | Add bounded multipart ingress, verify malformed/oversized uploads and failure recovery |
| CI and deployment | Vercel build success; no proven lint/typecheck/test workflow | Add reproducible automated checks, confirm deployment envs, rollback and monitoring |
| Mobile and accessibility | CSS improvements, no real device evidence | Test small Android/iOS viewports, keyboard, focus, long text and screen readers |
| Real job data | Demonstration listings exist | Keep demos labeled; validate real employer listings and moderation process before calling jobs live |

## Release procedure

1. Confirm the TailorMyResume Supabase project reference from its dashboard or `NEXT_PUBLIC_SUPABASE_URL` (public project URL only; **never share secret keys**).
2. Connect that project for read-only audit. Do not run queries against unrelated projects.
3. Remediate high-severity policy and quota issues in reviewed migrations, stage and test before applying to production.
4. Execute the staging QA matrices in `docs/resume-ai-qa.md` and PR56's job workflow QA document, recording date, test account role, expected/actual results, and failures.
5. Verify Vercel production and preview configuration without printing secrets; exercise rollback and incident response.
6. Only mark **GO** after every blocking gate is passed with evidence and an explicit final sign-off.

**No database changes were applied by PR59.**
