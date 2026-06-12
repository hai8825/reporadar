import type { RepoDetailData } from "@/lib/types";

type LanguageBarProps = {
  languages: NonNullable<RepoDetailData["languages"]>;
};

// Proportional horizontal bar from languages.edges + legend with percentages
export const LanguageBar = ({ languages }: LanguageBarProps) => {
  const edges = languages.edges ?? [];
  if (edges.length === 0 || languages.totalSize === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex h-2.5 w-full overflow-hidden rounded-full" role="img" aria-label="Language breakdown">
        {edges.map(({ size, node }) => (
          <span
            key={node.name}
            title={node.name}
            style={{
              width: `${(size / languages.totalSize) * 100}%`,
              backgroundColor: node.color ?? "#6B7280",
            }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
        {edges.map(({ size, node }) => (
          <span key={node.name} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: node.color ?? "#6B7280" }}
            />
            {node.name}
            <span className="font-mono text-text-muted">
              {((size / languages.totalSize) * 100).toFixed(1)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
};
