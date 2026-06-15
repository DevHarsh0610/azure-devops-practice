export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationResult {
  skip: number;
  take: number;
  page: number;
  limit: number;
}

export const getPaginationOptions = (
  queryPage?: unknown,
  queryLimit?: unknown
): PaginationResult => {
  const pageVal = parseInt(String(queryPage || 1), 10);
  const page = Math.max(1, isNaN(pageVal) ? 1 : pageVal);
  const limitVal = parseInt(String(queryLimit || 10), 10);
  const limit = Math.max(
    1,
    Math.min(100, isNaN(limitVal) ? 10 : limitVal)
  );

  const skip = (page - 1) * limit;
  const take = limit;

  return {
    skip,
    take,
    page,
    limit,
  };
};

export const getPaginationMeta = (
  totalCount: number,
  page: number,
  limit: number
) => {
  const totalPages = Math.ceil(totalCount / limit);
  return {
    page,
    limit,
    totalCount,
    totalPages,
  };
};
