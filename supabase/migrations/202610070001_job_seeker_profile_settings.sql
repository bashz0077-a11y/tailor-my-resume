alter table public.profiles
  add column if not exists location text not null default '',
  add column if not exists skills text[] not null default '{}',
  add column if not exists experience_level text not null default '',
  add column if not exists preferred_workplace text[] not null default '{}',
  add column if not exists preferred_employment text[] not null default '{}';

alter table public.profiles
  drop constraint if exists profiles_experience_level_check;

alter table public.profiles
  add constraint profiles_experience_level_check
  check (
    experience_level in (
      '',
      'Entry level',
      'Mid level',
      'Senior level',
      'Lead / Manager'
    )
  );
