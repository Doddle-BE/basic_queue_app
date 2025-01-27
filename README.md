# 🧮 Basic Queue App

A Turborepo monorepo application that demonstrates a basic queuing system for mathematical operations using tRPC for type-safe API communication and Supabase as the backend database.

## Project Structure

```
├── apps
│   ├── api/        # tRPC API server
│   └── app/        # Next.js frontend application
├── packages
│   ├── shared/     # Shared types
```

## Technologies Used

- **Frontend (app)**:

  - Next.js
  - React
  - TailwindCSS
  - shadcn/ui Components
  - TypeScript
  - tRPC Client

- **Backend (api)**:
  - tRPC Server
  - Node.js
  - TypeScript
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
cd basic_queue_app
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

Create `.env` in the api directory (apps/api/.env):

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
PORT=5000
```

Create `.env.local` in the app directory (apps/app/.env.local):

```
NEXT_PUBLIC_TRPC_URL=http://localhost:5000
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

1. Start both the API and frontend development servers:

```bash
pnpm turbo dev
```

This command will start both the API server and Next.js frontend concurrently.

2. Open [http://localhost:3000](http://localhost:3000) in your browser

Note: The API server will be running on port 5000 and the Next.js frontend on port 3000.

## Environment Variables

### API Server

| Variable            | Description                           |
| ------------------- | ------------------------------------- |
| `SUPABASE_URL`      | Your Supabase project URL             |
| `SUPABASE_ANON_KEY` | Your Supabase project's anonymous key |
| `OPENAI_API_KEY`    | Your OpenAI API key                   |
| `PORT`              | tRPC server port (default: 4000)      |

### Frontend App

| Variable               | Description             |
| ---------------------- | ----------------------- |
| `NEXT_PUBLIC_TRPC_URL` | URL of your tRPC server |

## Important Notes

- Make sure you have enabled the Realtime feature in your Supabase project settings
- The application uses Supabase's Realtime functionality to update job statuses in real-time
- The tRPC server must be running for the frontend to function properly
- Ensure your Supabase database has the correct table structure and enum types as specified in the Database Setup section

## Development

To add new features:

1. Define your types in the shared package
2. Implement the tRPC procedure in the api server
3. Use the type-safe tRPC client in your frontend components
