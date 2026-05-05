create table if not exists spaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  emoji text default '📦',
  created_at timestamptz default now()
);

alter table spaces enable row level security;

create policy "Owner access only"
  on spaces for all
  using (auth.uid() = user_id);
