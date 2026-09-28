create extension if not exists pgcrypto;

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 160),
  company_name text not null check (char_length(company_name) between 1 and 160),
  company_logo text,
  location text not null default '',
  workplace_type text not null check (workplace_type in ('Remote','Hybrid','On-site')),
  employment_type text not null check (employment_type in ('Full-time','Part-time','Contract','Internship')),
  salary_min integer check (salary_min is null or salary_min >= 0),
  salary_max integer check (salary_max is null or salary_max >= 0),
  salary_currency text,
  experience_level text not null check (experience_level in ('Entry level','Mid level','Senior','Lead')),
  description text not null,
  responsibilities text[] not null default '{}',
  required_skills text[] not null default '{}',
  preferred_skills text[] not null default '{}',
  requirements text[] not null default '{}',
  education_requirements text[] not null default '{}',
  benefits text[] not null default '{}',
  company_description text not null default '',
  application_url text,
  status text not null default 'draft' check (status in ('draft','open','closed')),
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint salary_range_valid check (salary_min is null or salary_max is null or salary_max >= salary_min)
);

create index if not exists jobs_status_published_at_idx on public.jobs(status, published_at desc);
create index if not exists jobs_employer_id_idx on public.jobs(employer_id);
create index if not exists jobs_location_idx on public.jobs(location);

alter table public.jobs enable row level security;

create policy "Public can read open jobs"
on public.jobs for select
to anon, authenticated
using (status = 'open' and (expires_at is null or expires_at > now()));

create policy "Employers can read own jobs"
on public.jobs for select
to authenticated
using (employer_id = auth.uid());

create policy "Employers can create own jobs"
on public.jobs for insert
to authenticated
with check (employer_id = auth.uid());

create policy "Employers can update own jobs"
on public.jobs for update
to authenticated
using (employer_id = auth.uid())
with check (employer_id = auth.uid());

create policy "Employers can delete own draft jobs"
on public.jobs for delete
to authenticated
using (employer_id = auth.uid() and status = 'draft');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_jobs_updated_at on public.jobs;
create trigger set_jobs_updated_at
before update on public.jobs
for each row execute function public.set_updated_at();
