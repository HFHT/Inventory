import React from 'react';
import { Drawer } from '@mantine/core';
import { useInventoryStore } from '../stores';
import { Controls, Filter, Viewer } from '../components/table';
import type { ViewerDbTypes } from '../types';
import type { TableColumnHeader } from '../components/table/types';
import { useTable } from '../components/table/hooks';

/**
 * @template T - The type of each data item displayed in the table.
 * @typedef {Object} TableLayoutProps
 * @property {T[]} data - The table data.
 * @property {React.ReactNode} drawerContent - Content to display inside the Drawer.
 */

/**
 * Renders the main layout for the table, including filtering, controls, viewer, and drawer.
 *
 * @template T
 * @param {TableLayoutProps<T>} props
 */
export function TableLayout({ columns, rows, drawerContent }: { columns: TableColumnHeader[]; rows: ViewerDbTypes; drawerContent: React.ReactNode }) {
  const isDrawerOpen = useInventoryStore((s) => s.isDrawerOpen);
  const closeDrawer = useInventoryStore((s) => s.closeDrawer);
  const table = useTable({ columns: columns, rows: rows });

  return (
    <>
      <Filter />
      <Viewer columns={columns} rows={rows} sort={table.sort} onSort={table.handleSort} onClick={table.handleRowClick} />
      <Controls />
      <Drawer opened={isDrawerOpen} onClose={closeDrawer} title="Add/Edit Item">
        {drawerContent}
      </Drawer>
    </>
  );
}