import { gql, type TypedDocumentNode } from "@apollo/client";
import { print } from "graphql";
import { graphql } from "@/gql";
import type { RateLimitInfo, RepoCardData, RepoDetailData } from "@/lib/types";
import { REPO_CARD_FRAGMENT, REPO_DETAIL_FRAGMENT } from "./fragments";

// Every query selects rateLimit so the nav badge always has fresh numbers.

// Migrated to codegen (M1): the result and variable types come from GitHub's
// introspected schema, so there is nothing hand-written left to drift.
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

export type SavedReposData = {
  // nodes() returns a heterogeneous Node list; non-repos come back without our fields
  nodes: Array<RepoCardData | null>;
  rateLimit: RateLimitInfo | null;
};

export type SavedReposVars = { ids: string[] };

export const SAVED_REPOS: TypedDocumentNode<SavedReposData, SavedReposVars> = gql`
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
  ${print(REPO_CARD_FRAGMENT)}
`;

export type RepoDetailQueryData = {
  repository: RepoDetailData | null;
  rateLimit: RateLimitInfo | null;
};

export type RepoDetailVars = { owner: string; name: string };

export const REPO_DETAIL: TypedDocumentNode<RepoDetailQueryData, RepoDetailVars> = gql`
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
  ${REPO_DETAIL_FRAGMENT}
`;

export type CompareReposData = {
  repoA: RepoDetailData | null;
  repoB: RepoDetailData | null;
  rateLimit: RateLimitInfo | null;
};

export type CompareReposVars = {
  owner1: string;
  name1: string;
  owner2: string;
  name2: string;
};

// Aliased fields fetch both repos in a single round trip
export const COMPARE_REPOS: TypedDocumentNode<CompareReposData, CompareReposVars> = gql`
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
  ${REPO_DETAIL_FRAGMENT}
`;
