## Create DB (Postgres) table

```sql
-- Create job status and operation types
create type job_status as enum ('pending', 'processing', 'completed');
create type operation_type as enum ('sum', 'difference', 'product', 'division');

-- Create the jobs table
create table jobs (
  id uuid primary key default gen_random_uuid(),
  operation operation_type not null,
  number_a numeric not null,
  number_b numeric not null,
  result numeric,
  status job_status default 'pending',
  created_at timestamp with time zone default now()
);

-- Enable realtime
alter table jobs replica identity full;
```
