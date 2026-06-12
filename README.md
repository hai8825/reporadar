# RepoRadar

A smarter alternative to GitHub Trending: search and filter open source repos,
assess their health at a glance, save the ones you care about, and compare two
side by side.

Built with **Next.js 14** (App Router), **Apollo Client** against GitHub's
GraphQL API, **NextAuth.js** (GitHub OAuth), and **Tailwind CSS**.

## Setup

1. Create a GitHub OAuth app at <https://github.com/settings/developers>:
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
2. Copy the env template and fill it in:

   ```bash
   cp .env.local.example .env.local
   # NEXTAUTH_SECRET: openssl rand -base64 32
   ```

3. Install and run:

   ```bash
   npm install
   npm run dev
   ```

Sign in with GitHub at `http://localhost:3000` — all routes require a session.

## Scripts

| Script          | What it does                          |
| --------------- | ------------------------------------- |
| `npm run dev`   | Dev server on :3000                   |
| `npm run build` | Production build (strict TS, no `any`) |
| `npm run lint`  | ESLint                                |
| `npm test`      | Vitest unit tests for the pure utils  |

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
- **Saved collection** — repo IDs persist in `localStorage` per user; the
  `/collection` page batch-fetches live data with `nodes(ids: [...])` so stale
  local data is never rendered.
