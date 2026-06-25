# RepoRadar

A smarter alternative to GitHub Trending: search and filter open source repos,
assess their health at a glance, save the ones you care about, and compare two
side by side.

Built with **Next.js 14** (App Router), **Apollo Client** against GitHub's
GraphQL API, **NextAuth.js** (GitHub OAuth), **Prisma 7 + Neon Postgres** for
the saved collection, and **Tailwind CSS**.

## Setup

1. Create a GitHub OAuth app at <https://github.com/settings/developers>:
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
2. Copy the env template and fill it in (including the Neon `DATABASE_URL` —
   see the comments in the file for which endpoint to use):

   ```bash
   cp .env.local.example .env.local
   # NEXTAUTH_SECRET: openssl rand -base64 32
   ```

3. Install, sync the database, and run:

   ```bash
   npm install          # also runs `prisma generate`
   npm run db:migrate   # applies migrations to the DATABASE_URL branch
   npm run dev
   ```

Sign in with GitHub at `http://localhost:3000` — all routes require a session.

## Scripts

| Script              | What it does                                  |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Dev server on :3000                           |
| `npm run build`     | Production build (strict TS, no `any`)        |
| `npm run lint`      | ESLint                                        |
| `npm test`          | Vitest unit tests for the pure utils          |
| `npm run db:migrate`| `prisma migrate dev` — create/apply migrations |
| `npm run db:deploy` | `prisma migrate deploy` — apply pending migrations |
| `npm run db:deploy:prod` | Same, against **production** creds (`.env.production.local`) |
| `npm run db:status` | `prisma migrate status` — verify in sync       |
| `npm run db:studio` | Prisma Studio                                  |

## Database

- **Prisma 7 + Neon Postgres.** Prisma 7 requires a driver adapter, so the
  client runs through `@prisma/adapter-pg` ([lib/prisma.ts](lib/prisma.ts)), and
  the datasource URL lives in [prisma.config.ts](prisma.config.ts) (not in the
  schema). The generated client is git-ignored and rebuilt on `postinstall`.
- **Branches.** The Neon project has `development` and `production` branches.
  Point `DATABASE_URL` at the branch you're working on. Always create migrations
  with `db:migrate` — never `db push` — and run `db:deploy` for production.
- **Models.** NextAuth (`User`, `Account`, `Session`, `VerificationToken`) plus
  the domain: `Folder`, `SavedRepo`, `Tag`, and a `SavedRepoTag` join. A repo
  belongs to one folder (`onDelete: SetNull` — deleting a folder unfiles, never
  unsaves) and many tags; everything cascades from `User`.

## Deployment (Vercel)

The app runs on the Node runtime as serverless functions. Two things must be
lined up beyond pushing code: a **production GitHub OAuth app** and a
**migrated production database**.

**Environment variables** (Vercel → Production): `NEXTAUTH_URL` (the canonical
prod URL), `NEXTAUTH_SECRET` (a fresh `openssl rand -base64 32`),
`GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` (from the prod OAuth app), and
`DATABASE_URL` (the Neon **pooled** endpoint — serverless functions open many
short-lived connections, so they go through PgBouncer).

**Pooled vs direct.** Runtime uses the **pooled** URL. Migrations need the
**direct** (unpooled) endpoint — PgBouncer's transaction pooling breaks the
advisory locks and DDL that `migrate deploy` relies on. Note the runtime client
([lib/prisma.ts](lib/prisma.ts)) reads `DATABASE_URL` directly, while the Prisma
CLI reads [prisma.config.ts](prisma.config.ts) — so the app's URL and the
migration URL are independent.

**Migrations are not run by the build.** Apply them deliberately, two ways that
coexist (both run the same idempotent `migrate deploy` against the same prod
ledger, so neither double-applies):

- **Manual (default here).** Put the prod **direct** URL in `.env.production.local`
  (gitignored; see [.env.production.local.example](.env.production.local.example))
  and run `npm run db:deploy:prod`. `PRISMA_ENV=production` makes the CLI load
  that file, so a normal `db:migrate` can never touch prod.
- **Automated (optional).** Add `DIRECT_DATABASE_URL` to Vercel's Production env
  and set the build command to
  `DATABASE_URL="$DIRECT_DATABASE_URL" prisma migrate deploy && next build`.
  Then every push to `main` migrates, builds, and deploys. The manual command
  stays as a break-glass tool.

## Architecture notes

- **Auth** — GitHub OAuth via NextAuth; the access token (`read:user public_repo`)
  rides the JWT into the session, and an Apollo auth link attaches it to every
  request ([lib/apollo.ts](lib/apollo.ts)). `middleware.ts` redirects all app
  routes to `/login` without a session.
- **GraphQL** — fragments (`RepoCard`, `RepoDetails`) shared across queries;
  every query selects `rateLimit { cost remaining resetAt }`, surfaced as a nav
  badge when remaining < 1000. Cursor pagination uses a cache type policy keyed
  by search string.
- **Hooks own the data** — `useRepoSearch`, `useSavedRepos`, `useComparison`;
  pages never call Apollo directly.
- **Pure logic is unit-tested** — `getActivityLevel` (computed activity badge)
  and `buildSearchQuery` (filters → GitHub search string) in `lib/utils`.
- **Saved collection** — repos, folders, and tags persist in Postgres via
  Server Actions ([app/actions/saved-repos.ts](app/actions/saved-repos.ts)).
  The `SavedReposProvider` applies optimistic updates for instant feedback, then
  reconciles to the state each action returns. The `/collection` page stores
  only the GitHub node id, name, tags, and folder; it batch-fetches live data
  with `nodes(ids: [...])` so stars/activity are always fresh. View mode and the
  last search remain in `localStorage` as per-device UI prefs.
