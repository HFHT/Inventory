import { Group, Pagination, Select } from "@mantine/core";

/**
 * @typedef {Object} TablePageControlsProps
 * @property {number} page - The current page number (1-based).
 * @property {(n: number) => void} setPage - Function to update the current page.
 * @property {number} totalPages - The total number of available pages.
 * @property {number} rowsPerPage - The current number of rows displayed per page.
 * @property {(n: number) => void} setRowsPerPage - Function to update the number of rows per page.
 * @property {number[]} [rowCounts] - Optional array of selectable row counts. Defaults to `[20, 50, 100]`.
 */

/**
 * TablePageControls renders UI controls for paginating tabular data and selecting rows per page.
 *
 * @param {TablePageControlsProps} props - Component props
 * @returns {JSX.Element} Pagination and rows per page controls for a table.
 */
export function TablePageControls({
  page,
  setPage,
  totalPages,
  rowsPerPage,
  setRowsPerPage,
  rowCounts = [20, 50, 100],
}: TablePageControlsProps) {
  return (
    <Group justify="space-between" mt="sm">
      <Select
        label="Rows per page"
        size="xs"
        withAsterisk={false}
        value={String(rowsPerPage)}
        onChange={(value) => value && setRowsPerPage(Number(value))}
        data={rowCounts.map((n) => ({ value: String(n), label: String(n) }))}
        style={{ width: 120 }}
      />
      <Pagination
        total={totalPages}
        value={page}
        onChange={setPage}
        siblings={1}
        boundaries={1}
        size="sm"
        withEdges
      />
    </Group>
  );
}

/**
 * Pagination and row count controls for the table.
 * @interface TablePageControlsProps
 * @property {number} page - The current page.
 * @property {(n: number) => void} setPage - Sets the current page.
 * @property {number} totalPages - Total number of pages.
 * @property {number} rowsPerPage - Currently selected number of rows per page.
 * @property {(n: number) => void} setRowsPerPage - Sets the number of rows per page.
 * @property {number[]} [rowCounts] - Row count options.
 */
export interface TablePageControlsProps {
  /** The current page number (1-based). */
  page: number;
  /** Function to update the current page. */
  setPage: (n: number) => void;
  /** The total number of available pages. */
  totalPages: number;
  /** The current number of rows displayed per page. */
  rowsPerPage: number;
  /** Function to update the number of rows per page. */
  setRowsPerPage: (n: number) => void;
  /** Optional array of selectable row counts. Defaults to [20, 50, 100]. */
  rowCounts?: number[];
}