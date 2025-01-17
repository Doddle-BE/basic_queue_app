# 🧮 Basic Queue App

A Next.js application that demonstrates a basic queuing system for mathematical operations using Supabase as the backend database.

## Technologies Used

- **Frontend**:

  - Next.js 15.1
  - React 19
  - TailwindCSS
  - shadcn/ui Components
  - TypeScript

- **Backend**:
  - Supabase (Database & Realtime subscriptions)
  - OpenAI SDK

## Prerequisites

- Node.js (Latest LTS version recommended)
- pnpm package manager
- Supabase account
- OpenAI API key

## Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd structize_basic_queue_app
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables by creating a `.env.local` file:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

## Database Setup

1. Create a new project in [Supabase](https://supabase.com)
2. In the SQL editor, run the following commands to set up your database:

```sql
-- Create job status and operation types
create type job_status as enum ('pending', 'processing', 'completed', 'failed');
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

## Running the Project

1. Start the development server:

```bash
pnpm dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

| Variable            | Description                           |
| ------------------- | ------------------------------------- |
| `SUPABASE_URL`      | Your Supabase project URL             |
| `SUPABASE_ANON_KEY` | Your Supabase project's anonymous key |
| `OPENAI_API_KEY`    | Your OpenAI API key                   |

## Important Notes

- Make sure you have enabled the Realtime feature in your Supabase project settings
- The application uses Supabase's Realtime functionality to update job statuses in real-time
- Ensure your Supabase database has the correct table structure and enum types as specified in the Database Setup section
