-- PR61: restore only the DML privileges used by TailorMyResume.
-- Keep PR60's TRUNCATE/TRIGGER/REFERENCES revocations intact.
-- RLS applies to row access; table grants are a separate required layer.
begin;

-- Remove public profile enumeration. The account owner can read their own
-- profile; employers can read applicant profiles only for their own jobs.
drop policy if exists "Profiles are publicly readable" on public.profiles;
drop policy if exists "Users can read own or applicant profiles" on public.profiles;
create policy "Users can read own or applicant profiles"
on public.profiles for select to authenticated
using (
  id = (select auth.uid())
  or exists (
    select 1 from public.applications a
    join public.jobs j on j.id = a.job_id
    where a.applicant_id = profiles.id
      and j.employer_id = (select auth.uid())
  )
);

-- Restrict status updates to a single column. The existing employer UPDATE
-- RLS policy still limits which application rows can be changed.
-- A trigger maintains updated_at, without client UPDATE rights to it.
revoke all privileges on table
  public.profiles, public.jobs, public.applications,
  public.saved_jobs, public.saved_resumes
from anon, authenticated;

grant select on public.jobs to anon, authenticated;
grant insert, update, delete on public.jobs to authenticated;

grant select, insert, update on public.profiles to authenticated;

grant select, insert on public.applications to authenticated;
grant update (status) on public.applications to authenticated;

grant select, insert, delete on public.saved_jobs to authenticated;
grant select, insert, update, delete on public.saved_resumes to authenticated;

-- Do not grant TRUNCATE, REFERENCES, TRIGGER or application DELETE.
commit;
