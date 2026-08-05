import { gql } from "@apollo/client";
import { print } from "graphql";
import { graphql } from "@/gql";

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
//
// Still a hand-written `gql` document — it migrates in M2. It composes with the
// generated RepoCard via print(): graphql() returns a location-less DocumentNode
// and graphql-tag's interpolation reads `arg.loc.source.body`, so passing the
// document itself throws at import time. The composed operation is unchanged.
export const REPO_DETAIL_FRAGMENT = gql`
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
  ${print(REPO_CARD_FRAGMENT)}
`;
