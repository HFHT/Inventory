import { useEffect, useMemo } from 'react';
import { TableLayout } from '../layouts/TableLayout';
import { useDataResource, useResourceData } from '../stores/dataResourceStore';
import type { BasePallet, BulkInventoryItem } from '../types/construction';
import type { TableColumnHeader } from '../components/table/types';
import { Title } from '@mantine/core';
import { EditPallet, TransferPallet } from '../features/construction';
import { defaultPallet } from '../features/construction/constants';
import { LoadingSkeleton } from '../components/table/components';

export function Pallet() {
    const { create } = useDataResource();
    const { data, reload } = useResourceData<BasePallet[]>("palletInventory");
    useEffect(() => {
        console.log('create resources, pallet')
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
        { accessor: "title", label: "Name", filterType: "fuzzy" },
        { accessor: "location", label: "Location", filterType: "includes" },
        { accessor: "dateCreated", label: "Date", filterType: "equal" },
        { accessor: "description", label: "Description", filterType: "fuzzy" },
        { accessor: "_id", label: "ID", filterType: "equal" },
    ], [])
    const filteredByActive = useMemo(() => {
        if (!data) return []
        return data.filter(d => !d.archived)
    }, [data])
    const modals = useMemo(() => {
        return [
            { mode: 'transfer', title: 'Transfer Inventory Item(s)', label: 'Transfer', component: <TransferPallet /> },
            { mode: 'restock', title: 'Restock Pallet Contents', label: 'Restock', component: <></> },
            { mode: 'unload', title: 'Unload Pallet Contents', label: 'Unload', component: <></> },
        ]

    }, [])
    if (!data) return <LoadingSkeleton />
    console.log('Pallet render')

    return (
        <>
            <Title order={2}>Pallet Inventory</Title>
            <TableLayout
                primaryRow={
                    {
                        columns: columns,
                        rows: filteredByActive,
                        emptyRow: defaultPallet,
                        ribbonControls: { transfer: true, restock: true, unload: true },
                        drawerTitle: 'Edit Pallet',
                        modals: modals
                    }
                }
                reload={reload}
            >
                <EditPallet />
            </TableLayout >
        </>)
}
