// READMEs come back as raw markdown, so relative image/link paths resolve
// against our own origin and 404. GitHub rewrites them when it renders; we do
// the same: images → raw.githubusercontent.com, links → github.com/blob.

type RepoRef = { owner: string; name: string; branch: string };

// Leave absolute (has a protocol), protocol-relative, and in-page anchors alone
const isRelativeUrl = (url: string) =>
  !/^[a-z][a-z0-9+.-]*:/i.test(url) && !url.startsWith("//") && !url.startsWith("#");

// react-markdown's urlTransform: `key` is the attribute ("src" for images,
// "href" for links). Returns a factory so the component can bind the repo ref.
export const makeReadmeUrlTransform = ({ owner, name, branch }: RepoRef) => {
  const rawBase = `https://raw.githubusercontent.com/${owner}/${name}/${branch}/`;
  const blobBase = `https://github.com/${owner}/${name}/blob/${branch}/`;

  return (url: string, key: string): string => {
    if (!url || !isRelativeUrl(url)) return url;
    // Leading slash = repo-root-relative; strip so it nests under the repo path
    const path = url.startsWith("/") ? url.slice(1) : url;
    try {
      return new URL(path, key === "src" ? rawBase : blobBase).toString();
    } catch {
      return url;
    }
  };
};
