create table if not exists public.saved_resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled resume',
  resume_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists saved_resumes_user_updated_idx
  on public.saved_resumes (user_id, updated_at desc);

alter table public.saved_resumes enable row level security;

create policy "Users can read own saved resumes"
on public.saved_resumes for select to authenticated
using (user_id = auth.uid());

create policy "Users can create own saved resumes"
on public.saved_resumes for insert to authenticated
with check (user_id = auth.uid());

create policy "Users can update own saved resumes"
on public.saved_resumes for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can delete own saved resumes"
on public.saved_resumes for delete to authenticated
using (user_id = auth.uid());

drop trigger if exists set_saved_resumes_updated_at on public.saved_resumes;
create trigger set_saved_resumes_updated_at
before update on public.saved_resumes
for each row execute function public.set_updated_at();
