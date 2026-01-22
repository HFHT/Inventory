import { useCallback } from "react";
import { mongoDelete, mongoGet, mongoPost, mongoPut } from "../services/database";
import type { MongoResponse } from "../types/services";

/**
 * React hook for CRUD operations on a MongoDB collection.
 * Uses memoized callbacks for consistent API interaction.
 *
 * @param {string} db - The MongoDB database name.
 * @param {string} col - The MongoDB collection name.
 * @returns {{
 *   getAll: () => Promise<any[]>,
 *   insertMany: (docs: any[]) => Promise<any>,
 *   updateMany: (filtersAndUpdates: { filter: any; update: any }[]) => Promise<any>,
 *   deleteMany: (filters: any[]) => Promise<any>
 * }}
 */
export function useMongo(db: string, col: string) {
  /**
   * Retrieves all documents from the collection.
   * @returns {Promise<any[]>} Promise resolving to an array of documents.
   */
  const getAll = useCallback((): Promise<MongoResponse<any>> => mongoGet(db, col), [db, col]);

  /**
   * Inserts multiple documents into the collection.
   * @param {any[]} docs - Documents to insert.
   * @returns {Promise<any>} Promise resolving to MongoDB insert result.
   */
  const insertMany = useCallback((docs: any[]): Promise<any> =>
    mongoPost({ db, col, rows: docs }), [db, col]);

  /**
   * Updates multiple documents by filter and update pairs.
   * @param {{ filter: any; update: any }[]} filtersAndUpdates - Array of filter and update objects.
   * @returns {Promise<any>} Promise resolving to MongoDB update result.
   */
  const updateMany = useCallback(
    (filtersAndUpdates: { filter: any; update: any }[]): Promise<any> =>
      mongoPut({ db, col, rows: filtersAndUpdates }),
    [db, col]
  );

  /**
   * Deletes multiple documents based on filter array.
   * @param {any[]} filters - Array of MongoDB filter objects.
   * @returns {Promise<any>} Promise resolving to MongoDB delete result.
   */
  const deleteMany = useCallback(
    (filters: any[]): Promise<any> => mongoDelete({ db, col, rows: filters }),
    [db, col]
  );

  return { getAll, insertMany, updateMany, deleteMany };
}