# PR60 — Live database permission finding and remediation

Live project: `sopeptpvxezxksczpkdl` (TailorMyResume). Read-only SQL executed 2026-10-17.

## Confirmed

- RLS enabled on profiles, jobs, applications, saved_jobs and saved_resumes.
- `anon` and `authenticated` both have `TRUNCATE`, `TRIGGER`, `REFERENCES` on all five tables. `TRUNCATE` is **not controlled by RLS** and is a high-severity permission mistake.
- Both roles currently lack table-level SELECT and UPDATE on these tables. These grants likely break intended app features; do **not** restore unrestricted SELECT until profile privacy is fixed, nor UPDATE on applications until only status updates are authorized.
- Both roles have EXECUTE on public SECURITY DEFINER trigger functions `handle_new_user()` and `rls_auto_enable()`; Supabase security advisors warn about this.
- Existing public profiles SELECT policy `USING(true)` and employer application UPDATE policy are too broad **if** normal DML permissions are restored.

## Change

Migration `202610170001_revoke_unsafe_api_privileges.sql` revokes TRUNCATE/TRIGGER/REFERENCES and client EXECUTE on the two internal functions. No user data is modified.

## Rollout and verification

1. Review this migration and merge after CI. It is committed to GitHub but **not automatically applied to Supabase**.
2. Apply to the **confirmed** TailorMyResume project after approval; ensure functions are used as internal triggers, not client RPC.
3. Query `has_table_privilege('anon','public.profiles','TRUNCATE')` and repeat for both roles and all five tables; all must return false.
4. Query `has_function_privilege('anon','public.handle_new_user()','EXECUTE')` and similarly for both roles and both functions; all must return false.
5. Rerun Supabase security advisors. Test signup trigger still works and verify user login, jobs, applications and saved content in staging.
6. Follow up with separate carefully tested migrations for profile privacy, column-scoped application status updates, and least-privilege DML grants.

**Do not claim the database is secured until applied and verified.**
