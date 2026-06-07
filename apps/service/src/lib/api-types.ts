// API response shapes.
//
// Success: status 2xx, body = { data: <payload> } (or {} when no payload).
// Failure: status 4xx/5xx, body = { error: { code, message } }.
//
// The HTTP status carries success/failure — clients should check
// `res.ok` and then read either `data` or `error`. No redundant
// `success: true` field.

export type ApiOk<T> = { data: T };
export type ApiEmpty = Record<string, never>;
export type ApiError = { error: { code: string; message: string } };

export type ApiResponse<T = ApiEmpty> = ApiOk<T> | ApiError | ApiEmpty;

// Standard error codes used across handlers. Domain-specific ones (e.g.
// 'site_limit_reached') can be added inline at the call site.
export const ErrorCode = {
  Unauthorized: 'unauthorized',
  Forbidden: 'forbidden',
  NotFound: 'not_found',
  MethodNotAllowed: 'method_not_allowed',
  ValidationError: 'validation_error',
  Conflict: 'conflict',
  InternalError: 'internal_error'
} as const;
