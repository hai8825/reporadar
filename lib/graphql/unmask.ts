import type { DocumentTypeDecoration } from "@graphql-typed-document-node/core";
import { getFragmentData, type FragmentType } from "@/gql";

/**
 * Unmask a fragment and keep its full type.
 *
 * The generated `getFragmentData` declares its `Partial<T>` overload first —
 * it exists for `@defer`/`@skip`/`@include`, where fields really can be absent.
 * That overload also matches a plain, complete `FragmentType<T>`, and
 * TypeScript takes the first match, so every unmask would otherwise hand back
 * `Partial<T>` and push optional-chaining into every consumer.
 *
 * RepoRadar uses no conditional directives, so an unmasked fragment is always
 * complete. Pinning the non-partial result here keeps that assertion to one
 * line instead of one per call site.
 */
export const unmask = <TType>(
  document: DocumentTypeDecoration<TType, unknown>,
  data: FragmentType<DocumentTypeDecoration<TType, unknown>>,
): TType => getFragmentData(document, data) as TType;
