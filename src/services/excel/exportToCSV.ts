
/**
 * Creates a csv file (filename) from the data provided and uses columns to establish the title, order, and data source
 * 
 * @param data                            // any array of objects
 * @param columns                         // title, order, and data source 
 * @returns 
 * 
 * @example
 * exportToCSV([{name: {first: 'Joe', last: 'Doe'}], [{key:'name.first', order: 0, title:'FirstName'}]}], 'donors.csv')
 */

import { getNestedValue } from "./utils/getNestedValue";

export type exportColumnsType = {
  key: string,
  order: number,
  title: string
}

export function exportToCSV<T>(data: T[], columns: exportColumnsType[], filename: string) {
  console.log('exportToCSV', data, columns, filename)
  const sortedColumns = [...columns].sort((a, b) => a.order - b.order);
  const header = sortedColumns.map(col => `"${col.title}"`).join(",");
  const rows = data.map(item =>
    sortedColumns.map(col => `"${String(getNestedValue(item, col.key) ?? "")}"`).join(",")
  );
  const csvContent = [header, ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}