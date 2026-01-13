-- Create the trades table
create table trades (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid default auth.uid(), -- Optional: for multi-user support
  date date not null,
  time time not null,
  pair text not null,
  direction text check (direction in ('Long', 'Short')),
  timeframe text,
  target_rr numeric,
  pnl numeric,
  setup text,
  strategy text,
  result text check (result in ('Win', 'Lose', 'BE', 'Pending')),
  comment text,
  chart_url text
);

-- Enable Row Level Security (RLS)
alter table trades enable row level security;

-- Create Policy to allow users to see their own trades (or public if no auth)
-- For this simple local-first/single-user app without auth, we allow public access.
create policy "Enable read access for all users" on trades for select using (true);
create policy "Enable insert for all users" on trades for insert with check (true);
create policy "Enable update for all users" on trades for update using (true);
create policy "Enable delete for all users" on trades for delete using (true);

-- To update the check constraint for 'Pending', you typically drop and re-add it.
-- ALTER TABLE trades DROP CONSTRAINT trades_result_check;
-- ALTER TABLE trades ADD CONSTRAINT trades_result_check CHECK (result IN ('Win', 'Lose', 'BE', 'Pending'));
