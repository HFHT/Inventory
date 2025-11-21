import { getValueByAccessor } from ".";
import type { ViewerDbTypes } from "../../../types";

/**
 * Sorts an array of table rows based on the specified column and sort direction.
 * 
 * It supports sorting by numbers, dates, and string values. 
 * If no valid sort column or direction are provided, it returns the rows without sorting.
 * 
 * @param {ViewerDbTypes} rows - The array of table row objects to sort.
 * @param {{ column: string | null; direction: "asc" | "desc" | null }} sort - 
 *   The sorting parameters, consisting of the column accessor and direction ('asc' or 'desc').
 * @returns {ViewerDbTypes} A new array of table rows, sorted as specified.
 * 
 * @example
 * ```
 * const sorted = sortRows(rows, { column: "createdAt", direction: "desc" });
 * ```
 */
export function sortRows(
  rows: ViewerDbTypes,
  sort: { column: string | null; direction: "asc" | "desc" | null }
): ViewerDbTypes {
  if (!sort.column || !sort.direction) return rows;
  const { column, direction } = sort;
  console.log(column, direction)
  return [...rows].sort((a, b) => {
    const aValue = getValueByAccessor(a, column);
    const bValue = getValueByAccessor(b, column);

    if (typeof aValue === "number" && typeof bValue === "number") {
      return direction === "asc" ? aValue - bValue : bValue - aValue;
    }
    if (aValue instanceof Date && bValue instanceof Date) {
      return direction === "asc"
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime();
    }
    console.log(aValue,bValue)
    return direction === "asc"
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });
}