create table if not exists public.saved_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint saved_jobs_user_job_unique unique (user_id, job_id)
);

create index if not exists saved_jobs_user_created_idx
on public.saved_jobs(user_id, created_at desc);

alter table public.saved_jobs enable row level security;

create policy "Users can read own saved jobs"
on public.saved_jobs for select
to authenticated
using (user_id = auth.uid());

create policy "Users can save jobs"
on public.saved_jobs for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.jobs
    where jobs.id = saved_jobs.job_id
      and jobs.status = 'open'
      and (jobs.expires_at is null or jobs.expires_at > now())
  )
);

create policy "Users can unsave own jobs"
on public.saved_jobs for delete
to authenticated
using (user_id = auth.uid());
