begin;
create or replace function public.get_ai_tailor_uses()
returns integer
language sql
security definer
set search_path = ''
stable
as $$
  select case when auth.uid() is null then null
  else coalesce((select uses from public.ai_usage_quotas where user_id = auth.uid()), 0)
  end;
$$;
revoke all on function public.get_ai_tailor_uses() from public, anon, authenticated;
grant execute on function public.get_ai_tailor_uses() to authenticated;
commit;
