import { Drawer } from '@mantine/core';
import { Controls, Filter, Viewer } from '../components/table';
import type { ViewerDbTypes } from '../types';
import type { TableColumnHeader } from '../components/table/types';
import { useTable } from '../components/table/hooks';
import type { JSX, ReactNode } from 'react';
import { DrawerLayout } from './DrawerLayout';

/**
 * Props for the TableLayout component.
 * 
 * @property {TableColumnHeader[]} columns - The array of table column definitions.
 * @property {ViewerDbTypes} rows - The data to be displayed in the table.
 * @property {string} [drawerTitle] - The optional title of the drawer.
 * @property {ReactNode} [children] - The React children to be rendered inside the drawer.
 */
interface TableLayoutProps {
  columns: TableColumnHeader[];
  rows: ViewerDbTypes;
  drawerTitle?: string;
  children?: ReactNode;
}

/**
 * Renders the page layout for the table feature.
 *
 * Includes:
 * - Filtering controls
 * - Table viewer with sorting and row click handling
 * - Controls for pagination or additional actions
 * - Drawer with optional children content, shown when a row is selected
 *
 * @component
 * @param {TableLayoutProps} props - TableLayout props
 * @returns {JSX.Element} The table layout component with filtering, table, controls, and an optional drawer.
 *
 * @example
 * <TableLayout
 *   columns={columns}
 *   rows={rows}
 *   drawerTitle="Details"
 * >
 *   <MyDrawerContent />
 * </TableLayout>
 */
export function TableLayout({
  columns,
  rows,
  drawerTitle,
  children,
}: TableLayoutProps): JSX.Element {
  /**
   * Custom table hook returns state and handlers for
   * filtering, sorting, pagination, and drawer open/close.
   */
  const table = useTable({ columns, rows });

  return (
    <>
      {/* Filtering controls */}
      <Filter {...table} />

      {/* Main table viewer */}
      <Viewer
        columns={columns}
        rows={table.pagedRows}
        sort={table.sort}
        onSort={table.handleSort}
        onClick={table.handleRowClick}
      />

      {/* Bottom controls (pagination/actions) */}
      <Controls {...table} />

      {/* Drawer for showing details or forms */}
      <Drawer opened={table.drawerOpened} onClose={table.closeDrawer} title={drawerTitle}>
        <DrawerLayout title={undefined} data={[]} onClose={table.closeDrawer}>
          {children}
        </DrawerLayout>
      </Drawer>
    </>
  );
}