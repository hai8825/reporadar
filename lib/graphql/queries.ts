import { graphql } from "@/gql";

// Every query selects rateLimit so the nav badge always has fresh numbers.
// Fragment spreads resolve through the generated document store — codegen
// composes the referenced fragments into each operation.

export const SEARCH_REPOS = graphql(/* GraphQL */ `
  query SearchRepos($query: String!, $first: Int!, $after: String) {
    search(query: $query, type: REPOSITORY, first: $first, after: $after) {
      repositoryCount
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          ...RepoCard
        }
      }
    }
    rateLimit {
      cost
      remaining
      resetAt
    }
  }
`);

// nodes() returns a heterogeneous Node list; the inline fragment is what makes
// repositories come back with card fields, and the generated union type now
// says so instead of a comment.
export const SAVED_REPOS = graphql(/* GraphQL */ `
  query SavedRepos($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Repository {
        ...RepoCard
      }
    }
    rateLimit {
      cost
      remaining
      resetAt
    }
  }
`);

export const REPO_DETAIL = graphql(/* GraphQL */ `
  query RepoDetail($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      ...RepoDetails
    }
    rateLimit {
      cost
      remaining
      resetAt
    }
  }
`);

// Aliased fields fetch both repos in a single round trip
export const COMPARE_REPOS = graphql(/* GraphQL */ `
  query CompareRepos($owner1: String!, $name1: String!, $owner2: String!, $name2: String!) {
    repoA: repository(owner: $owner1, name: $name1) {
      ...RepoDetails
    }
    repoB: repository(owner: $owner2, name: $name2) {
      ...RepoDetails
    }
    rateLimit {
      cost
      remaining
      resetAt
    }
  }
`);
