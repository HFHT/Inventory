import { useEffect } from 'react';
import { DrawerFormLayout } from '../layouts';
import { TableLayout } from '../layouts/TableLayout';
import { useDataResource, useResourceData } from '../stores/dataResourceStore';
import type { BulkInventoryItem } from '../types/construction';
import type { TableColumnHeader } from '../components/table/types';


export function InventoryPage() {
  const { create, release } = useDataResource();
  const { data, update, remove } = useResourceData<BulkInventoryItem[]>("inventory");

  useEffect(() => {
    create({
      id: "inventory",
      apiUrl: `${import.meta.env.VITE_DATABASE_API}/getMongoDB?db=Construction&col=Inventory`,
      refreshRate: 90000
    });
    // return () => {
    //   release("inventory")
    // }
  }, [])

  const columns: TableColumnHeader[] = [
    // { accessor: "image.favorite", label: '', type: 'image' },
    { accessor: "title", label: "Title", filterType: "fuzzy" },
    { accessor: "select.category", label: "Category", filterType: "includes" },
    { accessor: "select.subCategory", label: "SubCategory", filterType: "equal" },
    { accessor: "suppliers", label: "Supplier", filterType: "fuzzy", isArray: true, sortable: false },
    { accessor: "_id", label: "ID", filterType: "equal" },
  ];
  console.log(data)
  if (!data) return <></>
  return (
    <TableLayout
      columns={columns}
      rows={data}
      drawerContent={<DrawerFormLayout title="Add Item" />}
    />
  );
}