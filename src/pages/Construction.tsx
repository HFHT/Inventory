import { useEffect, useMemo } from 'react';
import { TableLayout } from '../layouts/TableLayout';
import { useDataResource, useResourceData } from '../stores/dataResourceStore';
import type { BulkInventoryItem } from '../types/construction';
import type { TableColumnHeader } from '../components/table/types';
import { Title } from '@mantine/core';
import { EditItem } from '../features/construction';

export function Construction({ category }: { category: string }) {
  const { create, release } = useDataResource();
  const { data } = useResourceData<BulkInventoryItem[]>("inventory");

  console.log(category)
  useEffect(() => {
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
      col: 'Inventory',
      refreshRate: 10000
    });
    return () => {
      console.log('return')
      release("inventory")
      release("parcelInventory")
    }
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

  const addRow = (row: BulkInventoryItem) => {
    console.log(row)
  }
  if (!data) return <></>
  console.log('Construction render')

  return (
    <>
      <Title order={2}>Construction Inventory</Title>
      <TableLayout
        columns={columns}
        rows={filteredByCategoryData}
        addRow={addRow}
        drawerTitle='Edit Inventory Item'
      >
        <EditItem />
      </TableLayout>
    </>
  );

}
