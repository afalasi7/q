create extension if not exists pgcrypto;

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free', 'pro', 'team')),
  credits_remaining integer not null default 3 check (credits_remaining >= 0),
  stripe_customer_id text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text not null,
  thumbnail_url text,
  config jsonb not null default '{}'::jsonb,
  is_premium boolean not null default false,
  is_arabic boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  template_id uuid references public.templates(id) on delete set null,
  title text not null default 'Untitled Project',
  status text not null default 'draft' check (status in ('draft', 'processing', 'done', 'failed')),
  original_video_path text,
  exported_video_path text,
  thumbnail_path text,
  duration_seconds double precision,
  settings jsonb not null default '{}'::jsonb,
  last_error text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'processing', 'done', 'failed')),
  job_type text not null,
  bull_job_id text,
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  attempts integer not null default 0,
  error_message text,
  result jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.captions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects(id) on delete cascade,
  language text not null default 'en' check (language in ('en', 'ar', 'auto')),
  source text not null default 'whisper',
  version integer not null default 1,
  segments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_projects_user_id_updated_at on public.projects(user_id, updated_at desc);
create index if not exists idx_jobs_project_id on public.jobs(project_id);
create index if not exists idx_jobs_user_id_created_at on public.jobs(user_id, created_at desc);
create index if not exists idx_captions_project_id on public.captions(project_id);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.handle_updated_at();

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
before update on public.projects
for each row
execute function public.handle_updated_at();

drop trigger if exists set_jobs_updated_at on public.jobs;
create trigger set_jobs_updated_at
before update on public.jobs
for each row
execute function public.handle_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = excluded.full_name,
      avatar_url = excluded.avatar_url,
      updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.templates enable row level security;
alter table public.projects enable row level security;
alter table public.jobs enable row level security;
alter table public.captions enable row level security;

drop policy if exists "profiles_self" on public.profiles;
create policy "profiles_self"
on public.profiles
for all
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "templates_public_read" on public.templates;
create policy "templates_public_read"
on public.templates
for select
to anon, authenticated
using (true);

drop policy if exists "projects_owner_access" on public.projects;
create policy "projects_owner_access"
on public.projects
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "jobs_owner_access" on public.jobs;
create policy "jobs_owner_access"
on public.jobs
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "captions_owner_access" on public.captions;
create policy "captions_owner_access"
on public.captions
for all
to authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = captions.project_id
      and projects.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.projects
    where projects.id = captions.project_id
      and projects.user_id = (select auth.uid())
  )
);
