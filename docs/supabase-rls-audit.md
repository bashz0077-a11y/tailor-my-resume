# PR54 — Supabase schema and RLS security review

Reviewed 2026-10-16 against the committed migrations. **This is a static review, not a live database verification.** The connected Supabase account lists only TestSwap and Project Guardian; no TailorMyResume project could be identified. No SQL has been run or production policies changed. Do not use either unrelated project for testing.

## Findings

1. **HIGH — Public profile exposure:** `202609290002_profiles.sql` defines `Profiles are publicly readable` with `USING (true)` for both `anon` and `authenticated`. After `202610070001_job_seeker_profile_settings.sql`, that same table contains location, skills, experience and preferences. RLS restricts rows, not columns; clients with SELECT privilege can potentially read all profile columns for every user. Decide which fields are intentionally public, then restrict the private data using separate tables or carefully designed column grants/views. Do not simply remove public reads without checking employer and applicant pages.
2. **MEDIUM — Application status update scope:** `202609300001_applications.sql` allows an employer to UPDATE applications for their jobs with an ownership predicate, but does not constrain which columns may change. A malicious employer client might change `applicant_id`, `job_id`, or `cover_note` in addition to status, subject to constraints and RLS. Restrict UPDATE privileges to `status` or use a narrowly scoped database function; test cross-account writes.
3. **GOOD (source only) — Ownership policies:** Jobs, saved jobs, saved resumes and applications define RLS with ownership checks. Confirm actual deployed policies and grants match these migrations; repository files alone do not prove deployment.
4. **REVIEW — User profile role:** `profiles.role` is editable by the profile owner via broad UPDATE policy. This role must **not** be treated as an authorization boundary. If roles become privileged, move authorization to non-user-editable data.
5. **REVIEW — SECURITY DEFINER:** `public.handle_new_user()` is a SECURITY DEFINER trigger function with fixed empty search path. Confirm EXECUTE privileges are limited as appropriate and the function cannot be abused as a public RPC.

## Live verification plan (blocked until the correct project is connected)

- Confirm the exact TailorMyResume Supabase project ID via Vercel `NEXT_PUBLIC_SUPABASE_URL` or Supabase dashboard. Do **not** paste secret/service-role keys into chat.
- Run read-only metadata checks for RLS enabled status, current policies, table/column grants, and public functions. Use Supabase security advisors.
- Create two test job seekers and two test employers in staging; verify read, insert, update and delete isolation. Confirm public users cannot access private profile fields.
- Confirm employers can only update application status, and cannot modify applicant identity, job association or notes.
- Compare live migration history with repo migrations; stage and test any SQL remediation before applying to production.
- Record pass/fail evidence and rerun advisors. Do not declare launch-ready until these tests pass.

## Read-only SQL inspection (run only on confirmed TailorMyResume project)

```sql
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('profiles','jobs','applications','saved_jobs','saved_resumes')
order by tablename;

select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('profiles','jobs','applications','saved_jobs','saved_resumes')
order by tablename, policyname;

select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('profiles','jobs','applications','saved_jobs','saved_resumes')
  and grantee in ('anon','authenticated')
order by table_name, grantee, privilege_type;
```

**Gate:** RLS verification is incomplete until the correct database is available. The next remediation PR should fix confirmed issues only after checking app query dependencies.
