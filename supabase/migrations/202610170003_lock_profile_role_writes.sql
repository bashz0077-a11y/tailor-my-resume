-- PR62: prevent clients from editing authorization-related profile fields.
-- Profile creation is handled by the SECURITY DEFINER auth.users trigger.
begin;
revoke insert, update on public.profiles from authenticated;
-- No direct profile INSERT is required by the current frontend.
-- Only allow updating editable profile fields, never role, id or timestamps.
grant update (
  full_name, avatar_url, headline, company_name,
  location, skills, experience_level, preferred_workplace,
  preferred_employment
) on public.profiles to authenticated;
-- Preserve SELECT for own profile and applicants via PR61 RLS.
commit;
