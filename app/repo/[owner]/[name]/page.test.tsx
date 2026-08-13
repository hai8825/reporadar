import { describe, expect, it, vi } from "vitest";

// The real client component drags in Apollo and the whole detail view. The
// contract under test is only which props reach it.
vi.mock("./repo-detail-client", () => ({ RepoDetailClient: () => null }));

const { default: RepoPage } = await import("./page");

const renderWith = async (params: { owner: string; name: string }) =>
  (await RepoPage({ params: Promise.resolve(params) })).props as {
    owner: string;
    name: string;
  };

/**
 * Next 15 made route params async. Getting this wrong does not throw — reading
 * `.owner` off an un-awaited promise yields undefined, and the page renders
 * "undefined/undefined" against a green build.
 *
 * `tsc --noEmit` does not cover it either: the page declares its own props
 * type, and Next's route contract only applies through the generated types
 * during `next build`. This is the only check that runs in `npm run verify`.
 */
describe("RepoPage", () => {
  it("awaits params before reading the segments", async () => {
    expect(await renderWith({ owner: "block", name: "buzz" })).toEqual({
      owner: "block",
      name: "buzz",
    });
  });

  it("decodes percent-encoded segments", async () => {
    expect(await renderWith({ owner: "my%20org", name: "dot.net" })).toEqual({
      owner: "my org",
      name: "dot.net",
    });
  });
});
