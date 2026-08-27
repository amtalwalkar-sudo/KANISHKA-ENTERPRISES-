-- KFE 2.0 foundation-only schema.
-- No business-specific columns, formulas, validations, or boundaries belong here.

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

create index if not exists kfe_records_user_updated_idx
  on public.kfe_records(user_id, updated_at);

alter table public.kfe_records enable row level security;

create policy "kfe_records_select_own"
  on public.kfe_records for select
  using (auth.uid() = user_id);

create policy "kfe_records_insert_own"
  on public.kfe_records for insert
  with check (auth.uid() = user_id);

create policy "kfe_records_update_own"
  on public.kfe_records for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- No DELETE policy: records are soft-deleted through is_deleted.
