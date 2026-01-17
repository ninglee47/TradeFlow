-- Create the strategies table
-- We will treat this as a singleton table for the single user, or use user_id if we want multi-user.
-- For simplicity in this local-first style app, we can just ensure there's at least one row or upsert based on a fixed ID or user_id.
create table strategies (
  id uuid default gen_random_uuid() primary key,
  user_id uuid default auth.uid(), -- Optional, matches trades table style
  strategy text,
  notes text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table strategies enable row level security;

-- Policies (matching trades table)
create policy "Enable read access for all users" on strategies for select using (true);
create policy "Enable insert for all users" on strategies for insert with check (true);
create policy "Enable update for all users" on strategies for update using (true);
create policy "Enable delete for all users" on strategies for delete using (true);
