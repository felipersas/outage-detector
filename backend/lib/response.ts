/** Helpers para respostas padronizadas da API Gateway */

interface ApiResponse {
  statusCode: number;
  body: string;
  headers?: Record<string, string>;
}

const JSON_HEADERS = { "Content-Type": "application/json" };

export function success(data: unknown): ApiResponse {
  return {
    statusCode: 200,
    headers: JSON_HEADERS,
    body: JSON.stringify(data),
  };
}

export function badRequest(message: string): ApiResponse {
  return {
    statusCode: 400,
    headers: JSON_HEADERS,
    body: JSON.stringify({ error: message }),
  };
}

export function unauthorized(message = "Unauthorized"): ApiResponse {
  return {
    statusCode: 401,
    headers: JSON_HEADERS,
    body: JSON.stringify({ error: message }),
  };
}

export function serverError(message = "Internal server error"): ApiResponse {
  return {
    statusCode: 500,
    headers: JSON_HEADERS,
    body: JSON.stringify({ error: message }),
  };
}
