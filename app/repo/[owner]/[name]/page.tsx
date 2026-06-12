import { RepoDetailClient } from "./repo-detail-client";

type RepoPageProps = {
  params: { owner: string; name: string };
};

export default function RepoPage({ params }: RepoPageProps) {
  return (
    <RepoDetailClient
      owner={decodeURIComponent(params.owner)}
      name={decodeURIComponent(params.name)}
    />
  );
}
