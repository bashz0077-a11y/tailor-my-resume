-- PR60: Remove high-risk privileges verified in the live TailorMyResume project.
-- RLS does NOT protect TRUNCATE. Do not grant TRUNCATE to API roles.
-- Do not grant SELECT/UPDATE here: profile privacy and employer-update
-- authorization need a separate reviewed migration before restoring DML.
revoke truncate, trigger, references on table
  public.profiles,
  public.jobs,
  public.applications,
  public.saved_jobs,
  public.saved_resumes
from anon, authenticated;

-- These functions are internal triggers, not client-callable RPCs.
-- Revoke from PUBLIC as well to remove inherited EXECUTE access.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
