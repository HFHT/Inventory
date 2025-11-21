
import { useEffect, useMemo } from 'react';
import { TableLayout } from '../layouts/TableLayout';
import { useDataResource, useResourceData } from '../stores/dataResourceStore';
import type { BulkInventoryItem } from '../types/construction';
import type { TableColumnHeader } from '../components/table/types';
import { Title } from '@mantine/core';
import { EditItem } from '../features/construction';

// type ConstructionCategories = {
//   category: '' | 'Appliances' | 'BldgMat' | 'Cabinet' | 'Door' | 'Electrical' | 'Lumber' | 'Paint' | 'Plumbing' |
//   'Supplies' | 'Assemblies' | 'Pallet' | 'Windows'
// }

export function Construction({ category }: { category: string }) {
  const { create, release } = useDataResource();
  const { data, update, remove } = useResourceData<BulkInventoryItem[]>("inventory");
  console.log(category)
  useEffect(() => {
    create({
      id: "inventory",
      apiUrl: `${import.meta.env.VITE_DATABASE_API}/getMongoDB?db=Construction&col=Inventory`,
      refreshRate: 90000
    });
    return () => {
      console.log('return')
      release("inventory")
    }
  }, [])


  const columns: TableColumnHeader[] = [
    // { accessor: "image.favorite", label: '', type: 'image' },
    { accessor: "title", label: "Title", filterType: "fuzzy" },
    { accessor: "select.category", label: "Category", filterType: "includes" },
    { accessor: "select.subCategory", label: "SubCategory", filterType: "equal" },
    { accessor: "suppliers", label: "Supplier", filterType: "fuzzy", isArray: true, sortable: false },
    { accessor: "_id", label: "ID", filterType: "equal" },
  ];

  const filteredByCategoryData = useMemo(() => {
    if (!data) return []
    return data.filter(d => category === '' || d.select.category === category)
  }, [category, data])

  console.log(filteredByCategoryData)
  if (!data) return <></>
  return (
    <>
      <Title order={2}>Construction Inventory</Title>
      <TableLayout
        columns={columns}
        rows={filteredByCategoryData}
        drawerTitle='Edit Inventory Item'
      >
        <EditItem />
      </TableLayout>
    </>
  );

}
