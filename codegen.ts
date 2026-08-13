import type { CodegenConfig } from "@graphql-codegen/cli";
import { config as loadEnv } from "dotenv";

// Same reason as prisma.config.ts: Next.js keeps secrets in .env.local, which
// no CLI reads by default.
loadEnv({ path: ".env.local", quiet: true });

const GITHUB_GRAPHQL_ENDPOINT = "https://api.github.com/graphql";

// Introspection is the only step that needs a token — building the app does
// not, because gql/ is committed. Any PAT works; no scopes are required for
// introspection. `gh auth token` is the easy local source.
const token = process.env.GITHUB_TOKEN_CODEGEN;

if (!token) {
  throw new Error(
    "GITHUB_TOKEN_CODEGEN is not set. Codegen introspects GitHub's live schema " +
      "and GitHub requires auth for that. Add it to .env.local, or run:\n" +
      "  GITHUB_TOKEN_CODEGEN=$(gh auth token) npm run codegen",
  );
}

// Codegen 6 maps unknown scalars to `unknown`. Every GitHub custom scalar is
// serialised as a JSON string over the wire (BigInt included), so declare them
// rather than casting at ~30 call sites. ID is narrowed from the default
// `string | number` because GitHub node ids are always strings.
const GITHUB_SCALARS = {
  ID: "string",
  Base64String: "string",
  BigInt: "string",
  Date: "string",
  DateTime: "string",
  GitObjectID: "string",
  GitRefname: "string",
  GitSSHRemote: "string",
  GitTimestamp: "string",
  HTML: "string",
  PreciseDateTime: "string",
  URI: "string",
  X509Certificate: "string",
} as const;

const config: CodegenConfig = {
  schema: [{ [GITHUB_GRAPHQL_ENDPOINT]: { headers: { authorization: `Bearer ${token}` } } }],
  // Only files that can hold a graphql() operation — gql/ is output, not input.
  documents: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}", "hooks/**/*.ts", "lib/**/*.ts"],
  generates: {
    "./gql/": {
      preset: "client",
      // The unmask helper is a plain function, not a React hook. Under its
      // default name (`useFragment`) eslint-plugin-react-hooks rejects every
      // call outside a component body, including inside useMemo.
      presetConfig: { fragmentMasking: { unmaskFunctionName: "getFragmentData" } },
      config: { scalars: GITHUB_SCALARS },
    },
  },
};

export default config;
