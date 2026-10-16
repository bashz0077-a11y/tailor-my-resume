# PR61 — Restore least-privilege database access

Live audit before this PR: RLS enabled on five tables, but `anon`/`authenticated` had no normal SELECT/UPDATE/INSERT/DELETE table grants. PR60 removed unsafe TRUNCATE/TRIGGER/REFERENCES and exposed privileged function EXECUTE.

## Changes

- Anonymous visitors: SELECT open jobs only (existing jobs RLS).
- Authenticated: jobs SELECT/INSERT/UPDATE/DELETE (existing owner RLS); own profiles SELECT/INSERT/UPDATE; applications SELECT/INSERT and UPDATE(status) only; saved_jobs SELECT/INSERT/DELETE; saved_resumes SELECT/INSERT/UPDATE/DELETE. RLS still restricts rows.
- Replaces unrestricted public profile SELECT with authenticated own-profile and applicant-to-employer visibility. Anonymous users cannot read profiles.
- Removes broad grants before adding explicit minimum DML grants; no TRUNCATE, TRIGGER or REFERENCES privileges are restored.

## Important limits

- Employers with an application to one of their jobs can read the applicant's **entire** profile row, including career preferences. This is broader than a public name/headline view and should be revisited with a separate public/private profile schema if required by privacy policy.
- The existing `profiles.role` column is user-updatable. Do **not** use it for privileged authorization without a separate security fix.
- The migration has not been run on production simply by merging this PR. Apply only to project `sopeptpvxezxksczpkdl` and verify.
- Do not claim production E2E testing until a job seeker and employer have tested separately.

## Verification

1. Check anon can SELECT open jobs, but cannot SELECT profiles/applications/saved content.
2. Check authenticated user can read/update their own profile; cannot read unrelated profiles.
3. Check employer can read applicant name/headline for their own jobs; cannot read unrelated applicants.
4. Check applicants can submit, view, but not change their own application status.
5. Check employer can update status on own applications, but cannot update `applicant_id`, `job_id`, or `cover_note`.
6. Check saved jobs/resumes only accessible to owners and cannot be read anonymously.
7. Recheck both roles cannot TRUNCATE and privileged functions are not client-executable.
8. Test Google signup, employer job creation/editing, application, applicant management, saved content on live app.

If any expected operation fails, inspect RLS and grants; do not grant blanket rights as a workaround.
