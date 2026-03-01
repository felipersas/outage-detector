import axios from "axios";

/**
 * Client-side axios instance for calling Next.js API routes.
 *
 * - baseURL defaults to `/api` so consumers just use relative paths
 * - Responses are automatically unwrapped to `response.data`
 */
const apiClient = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

export default apiClient;
