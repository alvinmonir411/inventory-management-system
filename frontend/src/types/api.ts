export type ApiErrorResponse = {
  statusCode?: number;
  message?: string | string[];
  error?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
