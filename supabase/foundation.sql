create table if not exists public.kfe_records (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  synced boolean not null default false,
  is_deleted boolean not null default false,
  module text not null,
  payload jsonb not null default '{}'::jsonb
);

alter table public.kfe_records enable row level security;

create policy "kfe_records_owner_select" on public.kfe_records
  for select using (auth.uid() = user_id);
create policy "kfe_records_owner_insert" on public.kfe_records
  for insert with check (auth.uid() = user_id);
create policy "kfe_records_owner_update" on public.kfe_records
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists kfe_records_user_updated_idx
  on public.kfe_records(user_id, updated_at desc);
