import { fuzzySearch, includesSearch, startsWithSearch } from "../../../utils/search";
import type { TableColumnHeader, TableRow } from "../types";

/**
 * An object describing which columns should be filtered by which method.
 */
export type FilterTypes = {
  /** Columns to search using fuzzy matching. */
  fuzzy: TableColumnHeader[];
  /** Columns to search using 'startsWith' equality. */
  equal: TableColumnHeader[];
  /** Columns to search using inclusion. */
  includes: TableColumnHeader[];
};

/**
 * Filters table rows according to different filtering strategies
 * (fuzzy, exact match via 'startsWith', or inclusion) depending on column settings.
 * Returns a merged and deduplicated array of matching rows.
 *
 * @param {TableRow[]} rows - All rows in the table data.
 * @param {string | undefined} filterValue - The filter value input by the user.
 * @param {FilterTypes} filterTypes - The mapping of columns to filtering methods.
 * @returns {TableRow[]} Filtered and de-duplicated table rows.
 */
export function filterRowsByFilterType(
  rows: TableRow[],
  filterValue: string | undefined,
  filterTypes: FilterTypes
): TableRow[] {
  if (!filterValue || !filterTypes) return rows;
  const fuzzyResult = fuzzySearch(
    rows,
    filterValue,
    filterTypes.fuzzy.map((f) => f.accessor)
  );
  const equalResult = startsWithSearch(
    rows,
    filterValue,
    filterTypes.equal.map((f) => f.accessor)
  );
  const includesResult = includesSearch(
    rows,
    filterValue,
    filterTypes.includes.map((f) => f.accessor)
  );
  return mergeAndDeduplicateById(fuzzyResult, equalResult, includesResult);
}

/**
 * Merges multiple arrays of objects and removes duplicates based on the `_id` field.
 * Keeps the last occurrence of a duplicate object.
 *
 * @param {...any[]} arrays - Arrays of objects to merge and deduplicate.
 * @returns {any[]} Array of merged, unique objects.
 */
function mergeAndDeduplicateById(...arrays: any[]): any[] {
  const idMap = new Map();
  arrays.flat().forEach((item) => {
    idMap.set(item._id, item); // The last occurrence is kept
  });
  return Array.from(idMap.values());
}