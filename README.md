# Pomodoro Tracker

Minimal Pomodoro-style time tracking app built with Next.js App Router, Tailwind CSS, Clerk authentication, and Neon PostgreSQL through Drizzle ORM.

## Stack

- Next.js App Router
- Tailwind CSS
- Clerk for Google/email authentication
- Neon PostgreSQL
- Drizzle ORM
- Zustand for responsive timer state

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
DATABASE_URL=
```

## Local setup

1. Install dependencies with install scripts disabled first:

```bash
npm install --ignore-scripts
```

If that completes cleanly and you want a normal install lifecycle afterward, run:

```bash
npm rebuild
```

2. Create a Neon project and copy its pooled `DATABASE_URL`.

3. Run the SQL in [drizzle/0000_initial.sql](/Users/Harshit/Documents/New project/drizzle/0000_initial.sql) against Neon, or use Drizzle migrations after env vars are configured:

```bash
npm run db:migrate
```

4. Create a Clerk application:
- Enable Google and Email authentication in the Clerk dashboard.
- Add `http://localhost:3000` as an allowed origin.
- Copy the publishable and secret keys into `.env.local`.

5. Start the app:

```bash
npm run dev
```

## How auth works

- The landing page at `/` is public and redirects signed-in users to `/dashboard`.
- Clerk protects `/dashboard` through [middleware.ts](/Users/Harshit/Documents/New project/middleware.ts).
- The server always derives `userId` from Clerk with `auth()`.
- On first login, the app upserts the signed-in user into the `users` table before loading dashboard data.

## Data model

- `users`: one row per Clerk user
- `activities`: user-owned activity buckets
- `sessions`: tracked or manual time entries linked to activities

## Core behavior

- Create, rename, and delete activities
- Start, pause, and stop a timestamp-based timer
- Optional 25-minute focus / 5-minute break Pomodoro mode
- Manual session entry
- Dashboard totals with per-activity progress bars
- All persisted data syncs across devices through Neon

## Deploy to Vercel

1. Push the repository to GitHub.
2. Import the project into Vercel.
3. Add the same environment variables in Vercel:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `DATABASE_URL`
4. In Clerk, add your Vercel production domain to allowed origins and redirect URLs.
5. In Neon, allow Vercel to connect using the production connection string.
6. Deploy.

## Notes

- `axios` is not used anywhere in this project.
- Session writes are server-side only.
- Activity and session queries are always scoped by the Clerk `userId`.
- The active timer itself is client-side state; saved sessions are cross-device because they are persisted in Neon.
