
import { Divider, Drawer } from '@mantine/core';
import { PageControls, Filter, Viewer, Ribbon } from '../components/table';
import type { ViewerDbTypes } from '../types';
import type { TableColumnHeader } from '../components/table/types';
import { useRibbon, useTable } from '../components/table/hooks';
import type { JSX, ReactNode } from 'react';
import { DrawerLayout } from './DrawerLayout';
import { useDrawerStore } from '../stores';
import { DRAWER_SIZE, MARGIN_TOP } from '../constants/table';

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
  addRow: (row: any) => void;
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
  addRow,
  drawerTitle,
  children,
}: TableLayoutProps): JSX.Element {
  const { isDrawerOpen, openDrawer, closeDrawer } = useDrawerStore();

  /**
   * Custom table hook returns state and handlers for
   * filtering, sorting, pagination, and drawer open/close.
   */
  const table = useTable({ columns, rows, openDrawer });
  const ribbon = useRibbon({
    pagedRows: table.pagedRows,
    addRow: addRow,
    openDrawer: openDrawer,
    controls: { add: true, refresh: true, export: true, import: true, filter: true }
  })

  console.log('TableLayout render')

  return (
    <>
      {/* Action controls (multi select, download, upload, etc) */}
      <Ribbon {...ribbon} />

      {/* Filtering controls */}
      <Filter {...table} />

      {/* Main table viewer */}
      <Viewer {...table}

      />

      {/* Bottom controls (pagination/actions) */}
      <PageControls {...table} />

      {/* Drawer for showing details or forms */}
      <Drawer.Root opened={isDrawerOpen} onClose={closeDrawer}
        position='right' size={DRAWER_SIZE}
        styles={{
          content: { marginTop: MARGIN_TOP, border: '' },
          overlay: { backgroundOpacity: 0.5, blur: 4, top: MARGIN_TOP }
        }}
      >
        <Drawer.Overlay />
        <Drawer.Content>
          <Divider size='md' />
          <Drawer.Header>
            <Drawer.Title>{drawerTitle}</Drawer.Title>
            <Drawer.CloseButton />
          </Drawer.Header>
          <Drawer.Body>
            <DrawerLayout title={undefined} >
              {children}
            </DrawerLayout>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>
    </>
  );
}