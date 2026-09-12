export function combineQueries(queries) {
  const failed = queries.find((query) => query.isError);
  return {
    isPending: !failed && queries.some((query) => query.isPending),
    isFetching: queries.some((query) => query.isFetching),
    isError: Boolean(failed),
    error: failed?.error,
    refetch: () => Promise.all(queries.map((query) => query.refetch())),
  };
}
