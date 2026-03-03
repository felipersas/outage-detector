/** Helpers for standardized API Gateway responses */

/**
 * Standard API response shape.
 */
export interface ApiResponse {
  statusCode: number;
  body: string;
  headers?: Record<string, string>;
}

const JSON_HEADERS = { "Content-Type": "application/json" };

/**
 * Creates a successful API response with the provided data.
 *
 * @param data - The data to include in the response body
 * @returns An API response with status 200
 */
export function success(data: unknown): ApiResponse {
  return {
    statusCode: 200,
    headers: JSON_HEADERS,
    body: JSON.stringify(data),
  };
}

/**
 * Creates a bad request (400) API response.
 *
 * @param message - The error message to include in the response
 * @returns An API response with status 400
 */
export function badRequest(message: string): ApiResponse {
  return {
    statusCode: 400,
    headers: JSON_HEADERS,
    body: JSON.stringify({ error: message }),
  };
}

/**
 * Creates an unauthorized (401) API response.
 *
 * @param message - The error message to include in the response (default: "Unauthorized")
 * @returns An API response with status 401
 */
export function unauthorized(message = "Unauthorized"): ApiResponse {
  return {
    statusCode: 401,
    headers: JSON_HEADERS,
    body: JSON.stringify({ error: message }),
  };
}

/**
 * Creates an internal server error (500) API response.
 *
 * @param message - The error message to include in the response (default: "Internal server error")
 * @returns An API response with status 500
 */
export function serverError(message = "Internal server error"): ApiResponse {
  return {
    statusCode: 500,
    headers: JSON_HEADERS,
    body: JSON.stringify({ error: message }),
  };
}
