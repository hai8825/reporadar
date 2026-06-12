import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const GITHUB_GRAPHQL_ENDPOINT = "https://api.github.com/graphql";

type SearchConnection = {
  edges?: unknown[];
  [key: string]: unknown;
};

/**
 * One client per access token. The auth link attaches the GitHub OAuth token
 * from the NextAuth session to every request.
 */
export const createApolloClient = (accessToken: string) => {
  const httpLink = createHttpLink({ uri: GITHUB_GRAPHQL_ENDPOINT });

  const authLink = setContext((_, { headers }) => ({
    headers: {
      ...(headers as Record<string, string> | undefined),
      authorization: `Bearer ${accessToken}`,
    },
  }));

  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache({
      typePolicies: {
        Repository: {
          keyFields: ["id"],
        },
        Query: {
          fields: {
            // Cursor pagination: cache one connection per search string and
            // append pages as fetchMore brings them in.
            search: {
              keyArgs: ["query", "type"],
              merge(
                existing: SearchConnection | undefined,
                incoming: SearchConnection,
                { args },
              ): SearchConnection {
                // Fresh query (no cursor) replaces; paginated fetch appends
                if (!args?.after || !existing) return incoming;
                return {
                  ...incoming,
                  edges: [...(existing.edges ?? []), ...(incoming.edges ?? [])],
                };
              },
            },
          },
        },
      },
    }),
  });
};
