# Ledgr

A premium personal money management app: track expenses and income, see spending trends and category breakdowns, and understand your financial health over time.

## Stack

- Next.js 16 (App Router, Turbopack) + TypeScript + React 19
- Tailwind CSS v4 (CSS-first theme, light/dark)
- PostgreSQL + Prisma ORM
- Zod for validation, Recharts for charts, Radix UI primitives, Lucide icons
- Vitest for unit tests

## Getting started

1. **Database** — point `DATABASE_URL` at a Postgres instance. Copy the example and edit it:

   ```bash
   cp .env.example .env
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Migrate and seed** — creates the schema and a demo user with ~13 months of realistic transactions:

   ```bash
   npx prisma migrate dev
   npm run db:seed
   ```

4. **Run the app**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Other commands

```bash
npm run build      # production build
npm run start       # run the production build
npm run lint        # ESLint
npm run test        # Vitest unit tests (financial calculations, date ranges, money formatting)
npm run db:seed     # re-seed demo data (wipes and recreates the demo user)
```

## Architecture notes

- **Single demo user, multi-tenant-ready schema.** There's no login screen yet, but every table is scoped by `userId` and every query goes through `src/lib/auth.ts#getCurrentUser()`. Swapping that one function for a real session lookup (NextAuth, etc.) is the only change needed to support multiple accounts.
- **Money is stored as integer minor units** (cents, or the equivalent for zero-decimal currencies like JPY/KRW) — see `src/lib/money.ts`. No floating-point arithmetic touches currency values.
- **Date-range logic is centralized** in `src/lib/dates.ts` — "this month", "last month", rolling 3/6/12-month windows, and their comparison periods are all defined in one place rather than duplicated across pages.
- **Financial calculations are pure functions** in `src/lib/calculations.ts`, unit-tested in `src/lib/calculations.test.ts` independent of the database.
- **Server Actions** (`src/app/actions/*`) handle both mutations (create/update/delete transactions and categories) and the client-driven re-fetches used by the period selector on the Dashboard and Analytics pages, so switching periods never triggers a full page reload.
- **Aggregation happens in SQL**, not in JS after fetching everything: `src/db/queries.ts` uses `groupBy` for totals/category breakdowns and a `date_trunc` raw query for the time-bucketed trend chart.

## Known limitations / design decisions

- No authentication UI — see the architecture note above.
- The dashboard's period selector (This Month / Last Month / 3 / 6 / 12 Months) is the single time control; there's no separate month-arrow navigator on top of it, since the two would conflict for multi-month periods. The **Income** page does have month-arrow navigation, since salary is inherently a single-month concept.
- "Last Year" is a rolling 12-calendar-month window (current month + previous 11), for consistency with how the 3/6-month windows are defined — not a strict trailing-365-days window.
- "Week starts on" is stored as a user preference but isn't yet consumed by any week-based view (there isn't one yet).
