/**
 * The structure of a MongoDB API request.
 *
 * @typedef {Object} MongoRequest
 * @property {string} db    - Name of the MongoDB database to operate on.
 * @property {string} col   - Name of the MongoDB collection to operate on.
 * @property {any[]} rows   - Array of documents or query objects relevant to the operation.
 */
export interface MongoRequest {
  db: string;
  col: string;
  rows: any[];
}

/**
 * The standard response shape for MongoDB API methods.
 *
 * @template T
 * @typedef {Object} MongoResponse
 * @property {T[]} data         - The array of documents returned from the database. May be empty.
 * @property {any} [result]     - Additional result information (e.g. write result, update count).
 * @property {any} [error]      - Error details if the request failed or partially succeeded.
 */
export interface MongoResponse<T = any> {
  data: T[];
  result?: any;
  error?: any;
}