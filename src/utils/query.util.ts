export function normalizePageLimit(
  pageRaw: unknown,
  limitRaw: unknown,
  defaults: { page?: number; limit?: number; maxLimit?: number } = {}
) {
  const defaultPage = defaults.page ?? 1;
  const defaultLimit = defaults.limit ?? 10;
  const maxLimit = defaults.maxLimit ?? 100;

  const pageNum = Number(pageRaw);
  const limitNum = Number(limitRaw);

  const page =
    Number.isFinite(pageNum) && pageNum > 0 ? Math.trunc(pageNum) : defaultPage;
  const limitCandidate =
    Number.isFinite(limitNum) && limitNum > 0
      ? Math.trunc(limitNum)
      : defaultLimit;
  const limit = Math.min(Math.max(limitCandidate, 1), maxLimit);

  return { page, limit };
}

export function normalizeSort<Allowed extends string>(
  sortByRaw: unknown,
  sortOrderRaw: unknown,
  allowed: readonly Allowed[],
  defaults: { sortBy: Allowed; sortOrder: "ASC" | "DESC" }
) {
  const sortByStr = typeof sortByRaw === "string" ? sortByRaw : undefined;
  const sortOrderStr =
    typeof sortOrderRaw === "string" ? sortOrderRaw.toUpperCase() : undefined;

  const sortBy = allowed.includes(sortByStr as Allowed)
    ? (sortByStr as Allowed)
    : defaults.sortBy;

  const sortOrder: "ASC" | "DESC" =
    sortOrderStr === "ASC" || sortOrderStr === "DESC"
      ? (sortOrderStr as "ASC" | "DESC")
      : defaults.sortOrder;

  return { sortBy, sortOrder };
}
