// Availability lifecycle for saved repos. GitHub returns "could not resolve to
// a node" for both a deleted repo AND one that merely went private or that our
// token lost access to — the two are indistinguishable from the error alone.
// So we never delete on sight: a repo rides a grace period as "unavailable",
// and only then gets archived (kept, but dropped from the live refetch).

export const UNAVAILABLE_GRACE_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;
export const UNAVAILABLE_GRACE_MS = UNAVAILABLE_GRACE_DAYS * DAY_MS;

// Minimal row shape the planner needs — matches the Prisma select below.
export type AvailabilityRow = {
  githubId: string;
  unavailableSince: Date | null;
  archivedAt: Date | null;
};

// The three disjoint sets of githubIds a reconcile pass acts on.
export type AvailabilityPlan = {
  clear: string[]; // resolved again → wipe unavailableSince
  mark: string[]; // newly missing → stamp unavailableSince = now
  archive: string[]; // missing past the grace period → stamp archivedAt = now
};

/**
 * Decide what a reconcile pass should change, given the user's non-archived
 * rows and the ids GitHub actually resolved this load. `now` is injected so the
 * grace-period boundary is testable.
 *
 * CALLER CONTRACT: only run this with `resolvedIds` from a *successful* GitHub
 * response. On a network error / bad token / rate-limit the query returns no
 * data, every row would look "missing", and a transient outage would wrongly
 * march the whole collection toward archival.
 */
export const planAvailability = (
  rows: AvailabilityRow[],
  resolvedIds: ReadonlySet<string>,
  now: Date,
): AvailabilityPlan => {
  const plan: AvailabilityPlan = { clear: [], mark: [], archive: [] };
  const cutoff = now.getTime() - UNAVAILABLE_GRACE_MS;

  for (const row of rows) {
    if (row.archivedAt) continue; // archived rows are inert until restored

    if (resolvedIds.has(row.githubId)) {
      // Recovered: a previously-missing repo resolves again
      if (row.unavailableSince) plan.clear.push(row.githubId);
      continue;
    }

    // Missing this load
    if (!row.unavailableSince) {
      plan.mark.push(row.githubId); // first sighting — start the clock
    } else if (row.unavailableSince.getTime() <= cutoff) {
      plan.archive.push(row.githubId); // outlived the grace period
    }
  }

  return plan;
};

// Whole days a repo has left before it auto-archives. Clamped at 0 so a repo
// already past the cutoff (not yet swept) never shows a negative countdown.
export const daysUntilArchive = (
  unavailableSince: string | Date,
  now: Date = new Date(),
): number => {
  const since =
    typeof unavailableSince === "string"
      ? new Date(unavailableSince)
      : unavailableSince;
  const elapsed = now.getTime() - since.getTime();
  return Math.max(0, Math.ceil((UNAVAILABLE_GRACE_MS - elapsed) / DAY_MS));
};
