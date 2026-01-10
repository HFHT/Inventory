
import { Divider, Drawer } from '@mantine/core';
import { PageControls, Filter, Viewer, Ribbon, Overlay } from '../components/table';
import type { ViewerDbRowTypes, ViewerDbTypes } from '../types';
import type { TableColumnHeader } from '../components/table/types';
import { useRibbon, useTable } from '../components/table/hooks';
import { useEffect, useState, type JSX, type ReactNode } from 'react';
import { DrawerLayout } from './DrawerLayout';
import { useDrawerStore } from '../stores';
import { DRAWER_SIZE, MARGIN_TOP } from '../constants/table';
import { useDisclosure } from '@mantine/hooks';

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
  emptyRow: ViewerDbRowTypes;
  reload: () => void;
  drawerTitle?: string;
  // modalTitle?: string;
  children?: ReactNode;
  modals?: {
    mode: string | null,
    title: string,
    label: string,
    component: ReactNode | JSX.Element;
  }[]
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
  emptyRow,
  reload,
  drawerTitle,
  // modalTitle,
  children,
  modals,
}: TableLayoutProps): JSX.Element {
  const { isDrawerOpen, openDrawer, closeDrawer } = useDrawerStore();
  // mode controls which modal component is used within the custom modal
  const [mode, setMode] = useState<string | null>(null)
  const [opened, { open, close, toggle }] = useDisclosure(false)

  const findModalChild = () => {
    const result = modals?.find(f => f.mode === mode)
    if (!result || !result.component) return undefined
    return result.component
  }
  const findModalTitle = () => {
    const result = modals?.find(f => f.mode === mode)
    if (!result || !result.title) return undefined
    return result.title
  }
  const findModalLabel = () => {
    const result = modals?.find(f => f.mode === mode)
    if (!result || !result.label) return undefined
    return result.label
  }
  /**
   * Custom table hook returns state and handlers for
   * filtering, sorting, pagination, and drawer open/close.
   */
  const table = useTable({ columns, rows, openDrawer });
  const ribbon = {
    pagedRows: table.pagedRows,
    checkbox: table.checkbox,
    clearSelectedRowIds: table.clearSelectedRowIds,
    emptyRow: emptyRow,
    reload: reload,
    openDrawer: openDrawer,
    controls: { add: true, transfer: true, pallet: true, refresh: true, export: true, import: true, filter: true },
    mode: mode,
    setMode: setMode,
    handleToggleModal: toggle,
    modalButtonLabel: findModalLabel()
  }

  console.log('TableLayout render')

  return (
    <>
      {/* Action controls (multi select, download, upload, etc) */}
      <Ribbon {...ribbon} />

      {/* Filtering controls */}
      <Filter {...table} />

      {/* Main table viewer */}
      <Viewer {...table} />

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

      {/* Modal overlay controlled by the Ribbon mode */}
      <Overlay title={findModalTitle()} opened={opened} close={close} children={findModalChild()} />
    </>
  );
}