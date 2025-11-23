# LazyMe

LazyMe is a minimalistic personal productivity app for managing tasks, categories, schedules, and timers—helping you stay organized with a clean, focused workflow.

## Features

- **Task Management**: Create, edit, and delete todos with categories
- **Timer Functionality**: Countdown timer with presets and custom durations
- **Calendar View**: Jira-like calendar for scheduling and viewing tasks
- **Links & Notes**: Add links to todos with auto-embedding for YouTube videos
- **Notes Canvas**: Milanote-style canvas for adding text notes and images
- **Next Task Logic**: Automatically identifies and displays the next upcoming task
- **User Authentication**: Secure authentication with Supabase Auth

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

## Getting Started

First, install the dependencies:

```bash
npm install
```

Set up your environment variables in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Run the database migrations from `SQLCODE.md` in your Supabase SQL editor to create the required tables.

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

## Database Schema

The database schema is defined in `SQLCODE.md`. Make sure to run all the SQL statements in your Supabase project before using the app.

## Project Structure

- `src/app/` - Next.js app router pages
- `src/components/` - React components
- `src/lib/supabase/` - Supabase client utilities
- `src/types/` - TypeScript type definitions

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
