# Backlog

Deferred work and ideas worth revisiting. Not committed roadmap — just a place
so decisions don't get lost.

## Server-side 30-day sweep for unavailable repos (Vercel Cron)

**Status:** deferred — revisit if RepoRadar goes public / multi-user / monetized.

**Context.** Saved repos whose GitHub node stops resolving are stamped
`unavailableSince`, and after a 30-day grace period they're archived
(`archivedAt`). Today that cutoff is enforced **on collection load** — the
`reconcileAvailability` server action applies it whenever a user opens their
collection (see `lib/utils/availability.ts`, `app/actions/saved-repos.ts`,
`app/collection/page.tsx`). Zero extra infrastructure, and nothing bad happens
if the sweep runs a few days late for a solo user.

**Why revisit.** Load-time enforcement only runs for users who actually visit.
At multi-user scale you'd want the lifecycle to advance regardless of visits
(and to reclaim rows from dormant accounts).

**Sketch when we do it:**
- `vercel.json` cron hitting `app/api/cron/sweep-availability/route.ts` daily.
- Guard the route with a `CRON_SECRET` bearer check (Vercel sets the header).
- The route sweeps **all** users: archive rows past the grace boundary. It
  can't probe GitHub per-user (no user token server-side), so it acts only on
  the already-stamped `unavailableSince` — load-time reconcile stays the source
  of truth for *detecting* unavailability; cron just enforces the deadline.
- Reuse the pure `planAvailability` helper against a tokenless row set, or a
  simpler `updateMany where unavailableSince <= now-30d and archivedAt is null`.
