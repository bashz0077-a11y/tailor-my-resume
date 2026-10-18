-- PR64: atomic, durable per-user Gemini request quota.
-- This is independent of browser localStorage.
begin;
create table if not exists public.ai_usage_quotas (
  user_id uuid primary key references auth.users(id) on delete cascade,
  uses integer not null default 0 check (uses between 0 and 3),
  updated_at timestamptz not null default now()
);
alter table public.ai_usage_quotas enable row level security;
revoke all on public.ai_usage_quotas from public, anon, authenticated;
create or replace function public.claim_ai_tailor_use()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_claimed uuid;
begin
  if v_user is null then return false; end if;
  insert into public.ai_usage_quotas (user_id, uses)
  values (v_user, 1)
  on conflict (user_id) do update
    set uses = public.ai_usage_quotas.uses + 1, updated_at = now()
    where public.ai_usage_quotas.uses < 3
  returning user_id into v_claimed;
  return v_claimed is not null;
end;
$$;
revoke all on function public.claim_ai_tailor_use() from public, anon, authenticated;
grant execute on function public.claim_ai_tailor_use() to authenticated;
commit;
