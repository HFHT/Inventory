import type { MongoRequest, MongoResponse } from "../../types/services";

const API_BASE = "/api/mongoDB"; // Adjust if needed

/**
 * Fetch wrapper for MongoDB API, with error handling.
 * 
 * @template T - The expected response data type.
 * @param {RequestInfo} input - The resource that you wish to fetch.
 * @param {RequestInit} [init] - An object containing custom settings to apply to the request.
 * @returns {Promise<MongoResponse<T>>} Promise resolving to the MongoResponse containing the API data.
 * @throws {Error} Throws if HTTP response is not OK.
 */
async function handleFetch<T>(input: RequestInfo, init?: RequestInit): Promise<MongoResponse<T>> {
  const res = await fetch(input, init);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

/**
 * GET all documents from a specific MongoDB collection.
 *
 * @template T - The expected response data type.
 * @param {string} db - The name of the database to query.
 * @param {string} col - The name of the collection to retrieve documents from.
 * @returns {Promise<MongoResponse<T>>} Promise resolving to MongoResponse with the collection's documents.
 */
export async function mongoGet<T>(db: string, col: string): Promise<MongoResponse<T>> {
  const url = `${API_BASE}?db=${encodeURIComponent(db)}&col=${encodeURIComponent(col)}`;
  return handleFetch<T>(url);
}

/**
 * Insert new documents into a MongoDB collection.
 *
 * @template T - The expected response data type.
 * @param {MongoRequest} req - The request payload containing database, collection, and document data.
 * @returns {Promise<MongoResponse<T>>} Promise resolving to MongoResponse with the result of the insert operation.
 */
export async function mongoPost<T>(req: MongoRequest): Promise<MongoResponse<T>> {
  return handleFetch<T>(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
}

/**
 * Update existing documents in a MongoDB collection.
 *
 * @template T - The expected response data type.
 * @param {MongoRequest} req - The request payload with the update query and data.
 * @returns {Promise<MongoResponse<T>>} Promise resolving to MongoResponse with the result of the update operation.
 */
export async function mongoPut<T>(req: MongoRequest): Promise<MongoResponse<T>> {
  return handleFetch<T>(API_BASE, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
}

/**
 * Delete documents from a MongoDB collection.
 *
 * > **Note:** While the HTTP DELETE method does not officially support a request body,
 * > most modern servers/browsers do support it. For strict compatibility, consider tunnel via POST with a delete flag.
 *
 * @template T - The expected response data type.
 * @param {MongoRequest} req - The request payload specifying which documents to delete.
 * @returns {Promise<MongoResponse<T>>} Promise resolving to MongoResponse with the result of the delete operation.
 */
export async function mongoDelete<T>(req: MongoRequest): Promise<MongoResponse<T>> {
  return handleFetch<T>(API_BASE, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
}