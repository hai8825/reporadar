# AGENTS.md — RepoRadar

Conventions for any agent working in this repo. Copied from
`portfolio-specs/00-ROADMAP.md`; that file is the source of truth if the two
ever disagree.

**RepoRadar is live and deployed on Vercel.** Changes here reach production.
Prefer small reversible steps over sweeping refactors.

---

## Package manager: npm

This repo predates the roadmap's pnpm default and ships a `package-lock.json`.
**Do not migrate it.** Every `pnpm x` in the roadmap or a spec means `npm run x`
here.

## The verify gate

```bash
npm run verify
```

`lint && typecheck && test`. A milestone is done when its Verify commands exit
0 — not when the work "looks complete". Run it before every commit; a failing
check blocks the commit.

**`verify` passing is not enough to ship.** Run `npm run build` too. Two real
breakages have slipped through it:

- Next validates route signatures against types it generates *during a build*.
  A page declaring its own props type typechecks fine while violating the
  contract — Next 15's async `params` rendered the literal string
  `"undefined/undefined"` with a green `verify`.
- `next.config.mjs` silently ignores unrecognised keys. When
  `serverComponentsExternalPackages` moved to `serverExternalPackages`, the
  stale key would have un-externalised Prisma and `pg` from the server bundle
  and broken the database layer at runtime, with nothing failing locally.

CI runs `build` as its own step, so nothing reaches production on `verify`
alone. It is local confidence that is overstated.

---

## Code conventions

- `const` + arrow functions, named exports, early returns.
- Booleans named as questions: `isLoading`, `hasError`, `canSubmit`.
- Short functions — extract when one does more than one thing.
- Brief "what + why" comments on meaningful blocks; JSDoc only for genuinely complex logic.
- Functional patterns by default; classes only where they clearly earn their keep.
- No `any` except at true third-party boundaries, and wrapped immediately.

## Testing conventions

- Implementation first, then test the *behavior* — query by role/label, never by test ID.
- Run `npm run verify` before every commit. A failing check blocks the commit.
- No skipped or `.only` tests committed.

## Git conventions

- Each project is its **own repository** (flat, no monorepo) under `~/Developer/AI/Claude/CodeProjects/<repo-name>`.
- Initialize with `git init -b main`. First commit `chore: scaffold project` after the M1 setup.
- Conventional prefixes: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`. State WHAT changed and WHY; skip the obvious.
- Atomic commits — one logical change each; typically 1–4 per milestone.
- **Never add a `Co-Authored-By: Claude` trailer or any AI attribution.**
- Do not push unless asked. Leave repos ready to push (`gh repo create hai8825/<repo> --public --source . --push` is the expected later command — do not run it unprompted).

---

## Do not edit

| Path | Why |
|---|---|
| `gql/` | GraphQL Code Generator output. Edit the `graphql()` operation in the source file, then run `npm run codegen`. Hand edits are wiped and will fail `codegen:check` in CI. |
| `lib/graphql/__snapshots__/` | Pins the GraphQL actually sent to GitHub. Never hand-edit; if a query change is intentional, read the failing diff and run `npx vitest -u`. A failure here means the wire traffic changed, which is worth a second look — these queries hit a rate-limited API. |
| `generated/prisma/` | Prisma client output, rebuilt by `postinstall`. Gitignored. |
| `prisma/migrations/` | Applied migrations. Never rewrite one — add a new migration. |
| `package-lock.json` | Only ever changed as a side effect of a real `npm install`. |

## Do not change without being asked

- **Query behavior.** Selection sets, variables, pagination and the rate-limit
  budgeting in `lib/apollo.ts` are settled. Spec 02 changed how they are typed,
  never what they ask for, and the operation snapshots now hold that line. A
  changed query costs real rate-limit budget, so it should be a decision, not a
  side effect.
- **Prisma / NextAuth / Server Actions layers.** Ask first. Prisma has since
  moved to 7.9 for security patches, but the schema, migrations and auth flow
  are untouched.
- The package manager, the framework version, or the folder layout.

## What NOT to do

- No placeholder or lorem content — every view runs on real data.
- No extra features beyond the current spec's milestones. Park ideas in the README roadmap section.
- No monorepo restructuring, no framework swaps, no "while I'm here" refactors.
- No unrequested dependencies beyond what the spec's stack table names.
