import { useEffect, useMemo } from 'react';
import { TableLayout } from '../layouts/TableLayout';
import { useDataResource, useResourceData } from '../stores/dataResourceStore';
import type { BulkInventoryItem } from '../types/construction';
import type { TableColumnHeader } from '../components/table/types';
import { Title } from '@mantine/core';
import { EditItem, TransferItems, PalletizeItems } from '../features/construction';
import { LoadingSkeleton } from '../components/table/components';
import { defaultInventoryItem } from '../features/construction/constants';

export function Construction({ category }: { category: string }) {
  const { create } = useDataResource();
  const { data, reload } = useResourceData<BulkInventoryItem[]>("inventory");

  console.log(category)
  useEffect(() => {
    console.log('create resources, construction')
    create({
      id: "inventory",
      apiUrl: `${import.meta.env.VITE_DATABASE_API}/mongoDB`,
      db: 'Construction',
      col: 'Inventory',
      refreshRate: 10000
    });
    create({
      id: "parcelInventory",
      apiUrl: `${import.meta.env.VITE_DATABASE_API}/mongoDB`,
      db: 'Homes',
      col: 'ParcelInventory',
      refreshRate: 10000
    });
    create({
      id: "palletInventory",
      apiUrl: `${import.meta.env.VITE_DATABASE_API}/mongoDB`,
      db: 'Construction',
      col: 'Pallets',
      refreshRate: 10000
    });
  }, [])

  const columns: TableColumnHeader[] = useMemo(() => [
    // { accessor: "image.favorite", label: '', type: 'image' },
    { accessor: "title", label: "Title", filterType: "fuzzy" },
    { accessor: "select.category", label: "Category", filterType: "includes" },
    { accessor: "select.subCategory", label: "SubCategory", filterType: "equal" },
    { accessor: "suppliers", label: "Supplier", filterType: "fuzzy", isArray: true, sortable: false },
    { accessor: "_id", label: "ID", filterType: "equal" },
  ], [])

  const filteredByCategoryData = useMemo(() => {
    if (!data) return []
    return data.filter(d => category === '' || d.select.category === category)
  }, [category, data])

  const modals = useMemo(() => {
    return [
      { mode: 'transfer', title: 'Transfer Inventory Item(s)', label: 'Transfer', component: <TransferItems /> },
      { mode: 'palletize', title: 'Pallet Information', label: 'Palletize', component: <PalletizeItems /> }
    ]

  }, [])

  if (!data) return <LoadingSkeleton />
  console.log('Construction render')

  return (
    <>
      <Title order={2}>Construction Inventory</Title>
      <TableLayout
        primaryRow={
          {
            columns: columns,
            rows: filteredByCategoryData,
            emptyRow: {
              ...defaultInventoryItem, select: { ...defaultInventoryItem.select, category: category }
            },
            ribbonControls: { transfer: true, pallet: true },
            drawerTitle: 'Edit Inventory Item',
            modals: modals
          }
        }
        reload={reload}
      >
        <EditItem />
      </TableLayout>
    </>
  );

}
