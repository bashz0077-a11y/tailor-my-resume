# PR62 — Profile authorization field hardening

## Threat
PR61 granted authenticated users table-level UPDATE and INSERT on `profiles`. Existing owner RLS checks only `id = auth.uid()`, so an account holder could modify their own `role` from `job_seeker` to `employer` (or write timestamps). This role must not be trusted for privileged authorization.

## Fix
- Revoke authenticated INSERT on profiles. The `auth.users` signup trigger creates profiles as SECURITY DEFINER and does not need client INSERT.
- Revoke broad UPDATE and allow only fields used by the account editor and employer-facing profile fields. `role`, `id`, `created_at`, `updated_at` cannot be directly updated by clients.
- Existing owner UPDATE RLS and PR61 SELECT RLS remain unchanged.

## Verification after applying
- `has_column_privilege('authenticated','public.profiles','role','UPDATE')` false.
- `has_column_privilege('authenticated','public.profiles','full_name','UPDATE')` true.
- `has_table_privilege('authenticated','public.profiles','INSERT')` false.
- `has_table_privilege('authenticated','public.profiles','TRUNCATE')` false.
- Test a real new Google signup: trigger creates profile and account page can edit career fields.
- Test two different authenticated users: each can only edit own profile, and employers can see only applicants for their jobs.

This is a permissions audit, not a complete live two-user integration test. Apply migration separately; merge alone does not change Supabase.
