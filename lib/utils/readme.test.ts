import { describe, expect, it } from "vitest";
import { makeReadmeUrlTransform } from "./readme";

const transform = makeReadmeUrlTransform({
  owner: "vercel",
  name: "next.js",
  branch: "canary",
});

describe("makeReadmeUrlTransform", () => {
  it("rewrites a relative image to raw.githubusercontent.com", () => {
    expect(transform("docs/logo.png", "src")).toBe(
      "https://raw.githubusercontent.com/vercel/next.js/canary/docs/logo.png",
    );
  });

  it("rewrites a ./-prefixed image", () => {
    expect(transform("./assets/banner.svg", "src")).toBe(
      "https://raw.githubusercontent.com/vercel/next.js/canary/assets/banner.svg",
    );
  });

  it("treats a leading slash as repo-root-relative, not origin-relative", () => {
    expect(transform("/media/hero.png", "src")).toBe(
      "https://raw.githubusercontent.com/vercel/next.js/canary/media/hero.png",
    );
  });

  it("rewrites a relative link to the github blob view", () => {
    expect(transform("CONTRIBUTING.md", "href")).toBe(
      "https://github.com/vercel/next.js/blob/canary/CONTRIBUTING.md",
    );
  });

  it("leaves absolute http(s) urls untouched", () => {
    const abs = "https://example.com/x.png";
    expect(transform(abs, "src")).toBe(abs);
  });

  it("leaves data: and protocol-relative urls untouched", () => {
    expect(transform("data:image/png;base64,AAAA", "src")).toBe(
      "data:image/png;base64,AAAA",
    );
    expect(transform("//cdn.example.com/x.png", "src")).toBe("//cdn.example.com/x.png");
  });

  it("leaves in-page anchors untouched", () => {
    expect(transform("#installation", "href")).toBe("#installation");
  });

  it("resolves ../ relative to the readme location (repo root)", () => {
    expect(transform("../sibling/x.png", "src")).toBe(
      "https://raw.githubusercontent.com/vercel/next.js/sibling/x.png",
    );
  });
});
