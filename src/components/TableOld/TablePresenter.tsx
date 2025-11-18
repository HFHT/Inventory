import React from "react";
import { Stack } from "@mantine/core";
import { TableDrawer, TableFilter, TablePageControls, TableView } from ".";
import type { TableColumnHeader, TableRow } from "./types";

/**
 * Presentational component for table UI.
 */
export interface TablePresenterProps {
  columns: TableColumnHeader[];
  pagedRows: TableRow[];
  sort: { column: string | null; direction: "asc" | "desc" | null };
  handleSort: (accessor: string) => void;
  filterValue: string;
  setFilterValue: (v: string) => void;
  handleRowClick: (id: string | number) => void;
  drawerOpened: boolean;
  closeDrawer: () => void;
  selectedRowId: string | number | null;
  page: number;
  setPage: (n: number) => void;
  totalPages: number;
  rowsPerPage: number;
  setRowsPerPage: (n: number) => void;
  rowCounts: number[];

  drawerChild?: (rowId: string | number | null) => React.ReactNode;
}

export const TablePresenter: React.FC<TablePresenterProps> = ({
  columns,
  pagedRows,
  sort,
  handleSort,
  filterValue,
  setFilterValue,
  handleRowClick,
  drawerOpened,
  closeDrawer,
  selectedRowId,
  page,
  setPage,
  totalPages,
  rowsPerPage,
  setRowsPerPage,
  rowCounts,
  drawerChild
}) => (
  <>
    <Stack gap="xs">
      <TableFilter filterValue={filterValue} setFilterValue={setFilterValue} />
      <TableView
        columns={columns}
        rows={pagedRows}
        sort={sort}
        onSort={handleSort}
        onClick={handleRowClick}
      />
      <TablePageControls
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        setRowsPerPage={setRowsPerPage}
        rowCounts={rowCounts}
      />
    </Stack>
    <TableDrawer
      opened={drawerOpened}
      onClose={closeDrawer}
      rowId={selectedRowId}
    >
      {drawerChild?.(selectedRowId)}
    </TableDrawer>
  </>
);