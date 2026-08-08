import { graphql, type FragmentType } from "@/gql";
import { unmask } from "./unmask";

// Everything a repo card in the grid needs — also the base for the detail fragment.
export const REPO_CARD_FRAGMENT = graphql(/* GraphQL */ `
  fragment RepoCard on Repository {
    id
    nameWithOwner
    name
    owner {
      login
    }
    description
    url
    stargazerCount
    forkCount
    pushedAt
    isArchived
    primaryLanguage {
      name
      color
    }
    licenseInfo {
      spdxId
      name
    }
    repositoryTopics(first: 6) {
      nodes {
        topic {
          name
        }
      }
    }
    goodFirstIssues: issues(labels: ["good first issue"], states: OPEN) {
      totalCount
    }
  }
`);

// Card fields + readme blob, language breakdown, commit history, issue list, PR count.
// Used by both /repo/[owner]/[name] and /compare.
export const REPO_DETAIL_FRAGMENT = graphql(/* GraphQL */ `
  fragment RepoDetails on Repository {
    ...RepoCard
    homepageUrl
    diskUsage
    openIssues: issues(states: OPEN) {
      totalCount
    }
    openPullRequests: pullRequests(states: OPEN) {
      totalCount
    }
    watchers {
      totalCount
    }
    languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
      totalSize
      edges {
        size
        node {
          name
          color
        }
      }
    }
    readme: object(expression: "HEAD:README.md") {
      ... on Blob {
        text
      }
    }
    defaultBranchRef {
      name
      target {
        ... on Commit {
          history(first: 10) {
            nodes {
              oid
              messageHeadline
              committedDate
              url
              author {
                name
              }
            }
          }
        }
      }
    }
    issues(first: 10, states: OPEN, orderBy: { field: CREATED_AT, direction: DESC }) {
      nodes {
        id
        number
        title
        url
        createdAt
      }
    }
  }
`);

/**
 * RepoDetails spreads RepoCard, so a detail view needs both fragments' fields
 * but masking exposes only one level at a time. Unmask both and merge: they
 * describe the same repository object and unmasking is an identity function at
 * runtime, so this is a type-level join, not a copy of live data.
 */
export const unmaskRepoDetails = (repo: FragmentType<typeof REPO_DETAIL_FRAGMENT>) => {
  const details = unmask(REPO_DETAIL_FRAGMENT, repo);
  return { ...unmask(REPO_CARD_FRAGMENT, details), ...details };
};

export type RepoDetails = ReturnType<typeof unmaskRepoDetails>;
