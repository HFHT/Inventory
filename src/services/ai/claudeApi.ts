/**
 * @fileoverview Generic Azure Web App API fetch service.
 * Provides a reusable fetch handler for all Azure Web App API requests.
 * @module claudeApi
 */

/** Generic API response structure */
interface ApiResponse<T = unknown> {
  /** Indicates whether the processing was successful */
  success: boolean;
  /** Optional message from the API */
  message?: string;
  /** Optional data returned from the API */
  data?: T;
}

/** Configuration options for API fetch requests */
interface FetchOptions {
  /** API endpoint path (e.g., "/api/receipts/process") */
  endpoint: string;
  /** Request payload to be sent as JSON */
  payload: unknown;
  /** HTTP method to use for the request */
  method?: "POST" | "PUT" | "PATCH" | "DELETE" | "GET";
}

/** Azure Web App API configuration */
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_INVENTORY_API,
  FUNCTION_KEY: "none",
} as const;

/**
 * Generic fetch handler for all Azure Web App API requests.
 * Handles common error checking, headers, and response parsing.
 * @template T - The expected response data type
 * @param {FetchOptions} options - Configuration options for the fetch request
 * @returns {Promise<ApiResponse<T> | null>} The API response or null if an error occurred
 * @example
 * const response = await apiFetch({
 *   endpoint: "/api/some/endpoint",
 *   payload: { key: "value" },
 *   method: "POST",
 * });
 */
const apiFetch = async <T = unknown>(
  options: FetchOptions
): Promise<ApiResponse<T> | null> => {
  const { endpoint, payload, method = "POST" } = options;

  if (!API_CONFIG.FUNCTION_KEY) {
    console.log("Error: Azure Function Key is not configured");
    return null;
  }

  if (!endpoint || endpoint.trim() === "") {
    console.log("Error: API endpoint is not defined");
    return null;
  }

  const url = `${API_CONFIG.BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-functions-key": API_CONFIG.FUNCTION_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.log(
        `Error: API responded with status ${response.status} - ${response.statusText}`
      );
      return null;
    }

    const data: ApiResponse<T> = await response.json();
    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      console.log(`Error: Network error or invalid URL - ${error.message}`);
      return null;
    }

    if (error instanceof SyntaxError) {
      console.log(
        `Error: Failed to parse API response as JSON - ${error.message}`
      );
      return null;
    }

    console.log(`Error: Unexpected error occurred - ${String(error)}`);
    return null;
  }
};

export { apiFetch };
export type { ApiResponse, FetchOptions };