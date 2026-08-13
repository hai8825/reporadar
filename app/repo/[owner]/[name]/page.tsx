import { RepoDetailClient } from "./repo-detail-client";

// Next 15 made the request APIs async — params is a promise now
type RepoPageProps = {
  params: Promise<{ owner: string; name: string }>;
};

export default async function RepoPage({ params }: RepoPageProps) {
  const { owner, name } = await params;

  return (
    <RepoDetailClient owner={decodeURIComponent(owner)} name={decodeURIComponent(name)} />
  );
}
