# Car Wash Booking System (Next.js 14)

Production-oriented scaffold for a multi-branch car wash booking system on Vercel serverless.

## Stack

- Next.js 14 App Router + TypeScript
- TailwindCSS + shadcn/ui-style component setup
- Prisma ORM + PostgreSQL
- NextAuth (Credentials + Prisma adapter) for admin authentication

## Features

### Customer

- Book appointment
- View available slots by branch/service/date
- Lookup booking by phone + booking code

### Admin

- Dashboard summary
- Manage bookings and status
- Manage branches
- Manage services and branch-specific offerings

## Installation

```bash
npm install
cp .env.example .env
```

Set `.env` values for PostgreSQL and auth secret, then:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

## Default seed admin

- Email: `admin@carwash.local`
- Password: `Admin@123456`

## Deploy to Vercel

1. Create a PostgreSQL database (Neon/Supabase/RDS with pooling URL).
2. Add env vars in Vercel:
   - `DATABASE_URL` (pooled)
   - `DIRECT_URL` (direct connection for migrations)
   - `AUTH_SECRET`
   - `AUTH_TRUST_HOST=true`
   - `NEXT_PUBLIC_APP_URL` (production URL)
3. Build command: `npm run vercel-build`
4. Install command: `npm install`

## Architecture notes

- API routes use Node runtime and keep DB access in server handlers.
- Prisma client singleton (`src/lib/prisma.ts`) avoids client explosion in serverless hot reload.
- Slot engine reads branch settings (hours, interval, slot capacity) and booking status to compute real-time availability.
- Booking snapshot fields preserve historical price/service metadata after future service edits.
- Admin routes are protected via `middleware.ts` + NextAuth session role checks.
