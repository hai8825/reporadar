/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  fragment RepoCard on Repository {\n    id\n    nameWithOwner\n    name\n    owner {\n      login\n    }\n    description\n    url\n    stargazerCount\n    forkCount\n    pushedAt\n    isArchived\n    primaryLanguage {\n      name\n      color\n    }\n    licenseInfo {\n      spdxId\n      name\n    }\n    repositoryTopics(first: 6) {\n      nodes {\n        topic {\n          name\n        }\n      }\n    }\n    goodFirstIssues: issues(labels: [\"good first issue\"], states: OPEN) {\n      totalCount\n    }\n  }\n": typeof types.RepoCardFragmentDoc,
    "\n  fragment RepoDetails on Repository {\n    ...RepoCard\n    homepageUrl\n    diskUsage\n    openIssues: issues(states: OPEN) {\n      totalCount\n    }\n    openPullRequests: pullRequests(states: OPEN) {\n      totalCount\n    }\n    watchers {\n      totalCount\n    }\n    languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {\n      totalSize\n      edges {\n        size\n        node {\n          name\n          color\n        }\n      }\n    }\n    readme: object(expression: \"HEAD:README.md\") {\n      ... on Blob {\n        text\n      }\n    }\n    defaultBranchRef {\n      name\n      target {\n        ... on Commit {\n          history(first: 10) {\n            nodes {\n              oid\n              messageHeadline\n              committedDate\n              url\n              author {\n                name\n              }\n            }\n          }\n        }\n      }\n    }\n    issues(first: 10, states: OPEN, orderBy: { field: CREATED_AT, direction: DESC }) {\n      nodes {\n        id\n        number\n        title\n        url\n        createdAt\n      }\n    }\n  }\n": typeof types.RepoDetailsFragmentDoc,
    "\n  query SearchRepos($query: String!, $first: Int!, $after: String) {\n    search(query: $query, type: REPOSITORY, first: $first, after: $after) {\n      repositoryCount\n      pageInfo {\n        endCursor\n        hasNextPage\n      }\n      edges {\n        node {\n          ...RepoCard\n        }\n      }\n    }\n    rateLimit {\n      cost\n      remaining\n      resetAt\n    }\n  }\n": typeof types.SearchReposDocument,
    "\n  query SavedRepos($ids: [ID!]!) {\n    nodes(ids: $ids) {\n      ... on Repository {\n        ...RepoCard\n      }\n    }\n    rateLimit {\n      cost\n      remaining\n      resetAt\n    }\n  }\n": typeof types.SavedReposDocument,
    "\n  query RepoDetail($owner: String!, $name: String!) {\n    repository(owner: $owner, name: $name) {\n      ...RepoDetails\n    }\n    rateLimit {\n      cost\n      remaining\n      resetAt\n    }\n  }\n": typeof types.RepoDetailDocument,
    "\n  query CompareRepos($owner1: String!, $name1: String!, $owner2: String!, $name2: String!) {\n    repoA: repository(owner: $owner1, name: $name1) {\n      ...RepoDetails\n    }\n    repoB: repository(owner: $owner2, name: $name2) {\n      ...RepoDetails\n    }\n    rateLimit {\n      cost\n      remaining\n      resetAt\n    }\n  }\n": typeof types.CompareReposDocument,
};
const documents: Documents = {
    "\n  fragment RepoCard on Repository {\n    id\n    nameWithOwner\n    name\n    owner {\n      login\n    }\n    description\n    url\n    stargazerCount\n    forkCount\n    pushedAt\n    isArchived\n    primaryLanguage {\n      name\n      color\n    }\n    licenseInfo {\n      spdxId\n      name\n    }\n    repositoryTopics(first: 6) {\n      nodes {\n        topic {\n          name\n        }\n      }\n    }\n    goodFirstIssues: issues(labels: [\"good first issue\"], states: OPEN) {\n      totalCount\n    }\n  }\n": types.RepoCardFragmentDoc,
    "\n  fragment RepoDetails on Repository {\n    ...RepoCard\n    homepageUrl\n    diskUsage\n    openIssues: issues(states: OPEN) {\n      totalCount\n    }\n    openPullRequests: pullRequests(states: OPEN) {\n      totalCount\n    }\n    watchers {\n      totalCount\n    }\n    languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {\n      totalSize\n      edges {\n        size\n        node {\n          name\n          color\n        }\n      }\n    }\n    readme: object(expression: \"HEAD:README.md\") {\n      ... on Blob {\n        text\n      }\n    }\n    defaultBranchRef {\n      name\n      target {\n        ... on Commit {\n          history(first: 10) {\n            nodes {\n              oid\n              messageHeadline\n              committedDate\n              url\n              author {\n                name\n              }\n            }\n          }\n        }\n      }\n    }\n    issues(first: 10, states: OPEN, orderBy: { field: CREATED_AT, direction: DESC }) {\n      nodes {\n        id\n        number\n        title\n        url\n        createdAt\n      }\n    }\n  }\n": types.RepoDetailsFragmentDoc,
    "\n  query SearchRepos($query: String!, $first: Int!, $after: String) {\n    search(query: $query, type: REPOSITORY, first: $first, after: $after) {\n      repositoryCount\n      pageInfo {\n        endCursor\n        hasNextPage\n      }\n      edges {\n        node {\n          ...RepoCard\n        }\n      }\n    }\n    rateLimit {\n      cost\n      remaining\n      resetAt\n    }\n  }\n": types.SearchReposDocument,
    "\n  query SavedRepos($ids: [ID!]!) {\n    nodes(ids: $ids) {\n      ... on Repository {\n        ...RepoCard\n      }\n    }\n    rateLimit {\n      cost\n      remaining\n      resetAt\n    }\n  }\n": types.SavedReposDocument,
    "\n  query RepoDetail($owner: String!, $name: String!) {\n    repository(owner: $owner, name: $name) {\n      ...RepoDetails\n    }\n    rateLimit {\n      cost\n      remaining\n      resetAt\n    }\n  }\n": types.RepoDetailDocument,
    "\n  query CompareRepos($owner1: String!, $name1: String!, $owner2: String!, $name2: String!) {\n    repoA: repository(owner: $owner1, name: $name1) {\n      ...RepoDetails\n    }\n    repoB: repository(owner: $owner2, name: $name2) {\n      ...RepoDetails\n    }\n    rateLimit {\n      cost\n      remaining\n      resetAt\n    }\n  }\n": types.CompareReposDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment RepoCard on Repository {\n    id\n    nameWithOwner\n    name\n    owner {\n      login\n    }\n    description\n    url\n    stargazerCount\n    forkCount\n    pushedAt\n    isArchived\n    primaryLanguage {\n      name\n      color\n    }\n    licenseInfo {\n      spdxId\n      name\n    }\n    repositoryTopics(first: 6) {\n      nodes {\n        topic {\n          name\n        }\n      }\n    }\n    goodFirstIssues: issues(labels: [\"good first issue\"], states: OPEN) {\n      totalCount\n    }\n  }\n"): (typeof documents)["\n  fragment RepoCard on Repository {\n    id\n    nameWithOwner\n    name\n    owner {\n      login\n    }\n    description\n    url\n    stargazerCount\n    forkCount\n    pushedAt\n    isArchived\n    primaryLanguage {\n      name\n      color\n    }\n    licenseInfo {\n      spdxId\n      name\n    }\n    repositoryTopics(first: 6) {\n      nodes {\n        topic {\n          name\n        }\n      }\n    }\n    goodFirstIssues: issues(labels: [\"good first issue\"], states: OPEN) {\n      totalCount\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment RepoDetails on Repository {\n    ...RepoCard\n    homepageUrl\n    diskUsage\n    openIssues: issues(states: OPEN) {\n      totalCount\n    }\n    openPullRequests: pullRequests(states: OPEN) {\n      totalCount\n    }\n    watchers {\n      totalCount\n    }\n    languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {\n      totalSize\n      edges {\n        size\n        node {\n          name\n          color\n        }\n      }\n    }\n    readme: object(expression: \"HEAD:README.md\") {\n      ... on Blob {\n        text\n      }\n    }\n    defaultBranchRef {\n      name\n      target {\n        ... on Commit {\n          history(first: 10) {\n            nodes {\n              oid\n              messageHeadline\n              committedDate\n              url\n              author {\n                name\n              }\n            }\n          }\n        }\n      }\n    }\n    issues(first: 10, states: OPEN, orderBy: { field: CREATED_AT, direction: DESC }) {\n      nodes {\n        id\n        number\n        title\n        url\n        createdAt\n      }\n    }\n  }\n"): (typeof documents)["\n  fragment RepoDetails on Repository {\n    ...RepoCard\n    homepageUrl\n    diskUsage\n    openIssues: issues(states: OPEN) {\n      totalCount\n    }\n    openPullRequests: pullRequests(states: OPEN) {\n      totalCount\n    }\n    watchers {\n      totalCount\n    }\n    languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {\n      totalSize\n      edges {\n        size\n        node {\n          name\n          color\n        }\n      }\n    }\n    readme: object(expression: \"HEAD:README.md\") {\n      ... on Blob {\n        text\n      }\n    }\n    defaultBranchRef {\n      name\n      target {\n        ... on Commit {\n          history(first: 10) {\n            nodes {\n              oid\n              messageHeadline\n              committedDate\n              url\n              author {\n                name\n              }\n            }\n          }\n        }\n      }\n    }\n    issues(first: 10, states: OPEN, orderBy: { field: CREATED_AT, direction: DESC }) {\n      nodes {\n        id\n        number\n        title\n        url\n        createdAt\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SearchRepos($query: String!, $first: Int!, $after: String) {\n    search(query: $query, type: REPOSITORY, first: $first, after: $after) {\n      repositoryCount\n      pageInfo {\n        endCursor\n        hasNextPage\n      }\n      edges {\n        node {\n          ...RepoCard\n        }\n      }\n    }\n    rateLimit {\n      cost\n      remaining\n      resetAt\n    }\n  }\n"): (typeof documents)["\n  query SearchRepos($query: String!, $first: Int!, $after: String) {\n    search(query: $query, type: REPOSITORY, first: $first, after: $after) {\n      repositoryCount\n      pageInfo {\n        endCursor\n        hasNextPage\n      }\n      edges {\n        node {\n          ...RepoCard\n        }\n      }\n    }\n    rateLimit {\n      cost\n      remaining\n      resetAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SavedRepos($ids: [ID!]!) {\n    nodes(ids: $ids) {\n      ... on Repository {\n        ...RepoCard\n      }\n    }\n    rateLimit {\n      cost\n      remaining\n      resetAt\n    }\n  }\n"): (typeof documents)["\n  query SavedRepos($ids: [ID!]!) {\n    nodes(ids: $ids) {\n      ... on Repository {\n        ...RepoCard\n      }\n    }\n    rateLimit {\n      cost\n      remaining\n      resetAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query RepoDetail($owner: String!, $name: String!) {\n    repository(owner: $owner, name: $name) {\n      ...RepoDetails\n    }\n    rateLimit {\n      cost\n      remaining\n      resetAt\n    }\n  }\n"): (typeof documents)["\n  query RepoDetail($owner: String!, $name: String!) {\n    repository(owner: $owner, name: $name) {\n      ...RepoDetails\n    }\n    rateLimit {\n      cost\n      remaining\n      resetAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query CompareRepos($owner1: String!, $name1: String!, $owner2: String!, $name2: String!) {\n    repoA: repository(owner: $owner1, name: $name1) {\n      ...RepoDetails\n    }\n    repoB: repository(owner: $owner2, name: $name2) {\n      ...RepoDetails\n    }\n    rateLimit {\n      cost\n      remaining\n      resetAt\n    }\n  }\n"): (typeof documents)["\n  query CompareRepos($owner1: String!, $name1: String!, $owner2: String!, $name2: String!) {\n    repoA: repository(owner: $owner1, name: $name1) {\n      ...RepoDetails\n    }\n    repoB: repository(owner: $owner2, name: $name2) {\n      ...RepoDetails\n    }\n    rateLimit {\n      cost\n      remaining\n      resetAt\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;