import { type DefinitionNode, type DocumentNode, parse, print } from "graphql";
import { describe, expect, it } from "vitest";
import { COMPARE_REPOS, REPO_DETAIL, SAVED_REPOS, SEARCH_REPOS } from "./queries";

/**
 * Pins the GraphQL actually sent to GitHub. These snapshots were verified
 * byte-identical to ef2e195, the commit before the codegen refactor began.
 *
 * This and `codegen:check` cover different halves, and neither covers both:
 *
 * - Edit a query and *don't* regenerate → these tests still pass. `graphql()`
 *   resolves documents by source string against the generated map, so an
 *   un-regenerated edit produces no document at all rather than a changed one.
 *   `codegen:check` is what catches that.
 * - Edit a query and *do* regenerate → `codegen:check` passes, because the
 *   types now faithfully describe the new query. These tests are what catch it.
 *
 * Worth guarding because these hit a rate-limited third-party API, so a
 * selection set growing by accident has a running cost.
 *
 * A failure here is not automatically a bug — it means the GraphQL changed. If
 * that was deliberate, read the diff, confirm it is what you meant, and update
 * with `npx vitest -u`.
 */

const definitionName = (definition: DefinitionNode): string =>
  "name" in definition && definition.name ? definition.name.value : "";

// Sort definitions and round-trip through the printer so neither formatting nor
// the order codegen composes fragments in can register as a change.
const normalize = (document: DocumentNode): string => {
  const ast = parse(print(document));
  const definitions = [...ast.definitions].sort((a, b) =>
    definitionName(a).localeCompare(definitionName(b)),
  );
  return print({ ...ast, definitions });
};

const OPERATIONS: Record<string, DocumentNode> = {
  SEARCH_REPOS,
  SAVED_REPOS,
  REPO_DETAIL,
  COMPARE_REPOS,
};

describe("GraphQL operations", () => {
  for (const [name, document] of Object.entries(OPERATIONS)) {
    it(`${name} sends an unchanged document`, () => {
      expect(normalize(document)).toMatchSnapshot();
    });
  }

  // The fragments only reach GitHub because codegen composes them into each
  // operation. If that ever silently stopped, the queries above would still
  // parse but would ask for almost nothing.
  it("composes fragments into the operations that spread them", () => {
    expect(normalize(SEARCH_REPOS)).toContain("fragment RepoCard on Repository");
    expect(normalize(REPO_DETAIL)).toContain("fragment RepoDetails on Repository");
    expect(normalize(REPO_DETAIL)).toContain("fragment RepoCard on Repository");
  });
});
