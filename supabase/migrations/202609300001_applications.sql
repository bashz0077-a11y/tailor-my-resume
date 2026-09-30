create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  applicant_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'applied' check (status in ('applied','reviewing','shortlisted','rejected')),
  cover_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint applications_job_applicant_unique unique (job_id, applicant_id)
);

create index if not exists applications_applicant_id_idx on public.applications(applicant_id, created_at desc);
create index if not exists applications_job_id_idx on public.applications(job_id, created_at desc);

alter table public.applications enable row level security;

create policy "Applicants can read own applications"
on public.applications for select
to authenticated
using (applicant_id = auth.uid());

create policy "Employers can read applications for own jobs"
on public.applications for select
to authenticated
using (
  exists (
    select 1 from public.jobs
    where jobs.id = applications.job_id
      and jobs.employer_id = auth.uid()
  )
);

create policy "Applicants can apply to open jobs"
on public.applications for insert
to authenticated
with check (
  applicant_id = auth.uid()
  and exists (
    select 1 from public.jobs
    where jobs.id = applications.job_id
      and jobs.status = 'open'
      and (jobs.expires_at is null or jobs.expires_at > now())
      and (jobs.employer_id is null or jobs.employer_id <> auth.uid())
  )
);

create policy "Employers can update application status"
on public.applications for update
to authenticated
using (
  exists (
    select 1 from public.jobs
    where jobs.id = applications.job_id
      and jobs.employer_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.jobs
    where jobs.id = applications.job_id
      and jobs.employer_id = auth.uid()
  )
);

drop trigger if exists set_applications_updated_at on public.applications;
create trigger set_applications_updated_at
before update on public.applications
for each row execute function public.set_updated_at();
