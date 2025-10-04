# Supabase Integration Guide

Use this to wire the beta application form to your Supabase project.

## 1) Install dependency
Already added in package.json:

- @supabase/supabase-js ^2.x

## 2) Environment variables (Vite)
Create a .env file at repo root (or in your deploy provider UI):

```
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_PUBLIC_KEY
```

These keys are public in the frontend context; do NOT use service role keys in the browser.

## 3) Database schema
In Supabase SQL Editor, run:

```sql
create table if not exists public.beta_applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  x_username text not null,
  email text not null,
  top_protocol text not null,
  followed_seifu boolean not null,
  followed_miles boolean not null
);

alter table public.beta_applications enable row level security;

-- Allow inserts from anonymous (public) clients
create policy "allow insert" on public.beta_applications
  for insert
  to anon
  with check (true);

-- Optional: allow read for admin roles only. Keep anon select disabled by default.
```

If you want to view submissions in the app for admins, create an RPC with auth or use a serverless function.

## 4) Client usage
The app uses `src/utils/supabase.ts` with `saveBetaApplication()` called from the landing modal submit step.

If env vars are missing, the function throws an informative error.

## 5) Optional serverless (Netlify/Vercel)
For sensitive logic, proxy inserts through a serverless function using a service role key stored as a secure env var. Then call that function from the frontend instead of direct Supabase insert.
