// Shared by the client provider (optimistic display) and the server actions
// (persisted value) so a tag normalizes identically on both sides.
export const normalizeTag = (tag: string): string =>
  tag.trim().toLowerCase().replace(/\s+/g, "-");
