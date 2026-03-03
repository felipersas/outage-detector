import axios, { type AxiosError } from "axios";

/**
 * Error class for API errors with more detailed information.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Checks if an error is an Axios error with useful properties.
 */
export function isAxiosError(error: unknown): error is AxiosError {
  return axios.isAxiosError(error);
}

/**
 * Client-side axios instance for calling Next.js API routes.
 *
 * Features:
 * - baseURL defaults to `/api` so consumers just use relative paths
 * - 10-second timeout for all requests
 * - Automatic error handling with ApiError
 * - Content-Type header set to application/json
 */
const apiClient = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 10000, // 10 seconds
});

/**
 * Response interceptor for error handling.
 * Transforms Axios errors into more usable ApiError instances.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (isAxiosError(error)) {
      const statusCode = error.response?.status;
      const data = error.response?.data;

      // Network errors or timeouts
      if (!error.response) {
        if (error.code === "ECONNABORTED") {
          throw new ApiError("Request timeout. Please try again.", 408);
        }
        throw new ApiError("Network error. Please check your connection.");
      }

      // HTTP errors with response data
      let message: string;
      if (typeof data === "object" && data !== null) {
        if ("error" in data && typeof data.error === "string") {
          message = data.error;
        } else if ("message" in data && typeof data.message === "string") {
          message = data.message;
        } else {
          message = `Request failed with status ${statusCode}`;
        }
      } else {
        message = `Request failed with status ${statusCode}`;
      }

      throw new ApiError(message, statusCode, data);
    }

    // Non-Axios errors
    throw error;
  },
);

export default apiClient;
