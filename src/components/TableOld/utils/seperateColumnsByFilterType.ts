/**
 * @typedef {Object} TableColumnHeader
 * @property {string} accessor - The key for the column.
 * @property {string} label - The display label for the column.
 * @property {'fuzzy'|'equal'|'includes'|undefined} filterType - The filter type.
 */

import type { TableColumnHeader } from "../types";

/**
 * Separates column headers by their filterType.
 * Only recognizes 'fuzzy', 'equal', and 'includes' types.
 *
 * @param {TableColumnHeader[]} columns - The array of column headers.
 * @returns {{
 *   fuzzy: TableColumnHeader[],
 *   equal: TableColumnHeader[],
 *   includes: TableColumnHeader[]
 * }} An object grouping columns by filterType.
 */
export function separateColumnsByFilterType(
  columns: TableColumnHeader[]
) {
  return columns.reduce(
    (acc, column) => {
      if (column.filterType === 'fuzzy' || column.filterType === 'equal' || column.filterType === 'includes') {
        acc[column.filterType].push(column);
      }
      // ignore columns with undefined or unknown filterType
      return acc;
    },
    { fuzzy: [], equal: [], includes: [] } as {
      fuzzy: TableColumnHeader[],
      equal: TableColumnHeader[],
      includes: TableColumnHeader[]
    }
  );
}

