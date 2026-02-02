import { useEffect, useMemo } from "react";
import { useDataResource, useResourceData } from "../stores";
import type { ParcelInventoryType, ParcelInventoryTypeIsNew } from "../types/parcelInventory";
import type { TableColumnHeader } from "../components/table/types";
import { uniqueKey } from "../utils";
import { Title } from "@mantine/core";
import { TableLayout } from "../layouts";
import { flattenParcelBOM } from "../features/construction/utils";
import { EditParcelInventory, TransferItems } from "../features/construction";
import { LoadingSkeleton } from "../components/table/components";
import { defaultParcelInventory } from "../features/construction/constants";
import { StartConstruction } from "../features/construction/parcels";

export function Parcels({ category }: { category: 'Parcels' }) {
    const { create } = useDataResource();
    const { data: parcelData, reload: parcelReload } = useResourceData<ParcelInventoryType[]>("parcelInventory");
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

    // const mainColumns: TableColumnHeader[] = useMemo(() => [
    //     { accessor: "subdivision_id", label: "Subdivision", filterType: "includes" },
    //     { accessor: "parcelLot", label: "Lot", filterType: "includes" },
    //     {
    //         accessor: "billOfMaterial", label: "", type: 'json', details: [
    //             { accessor: "title", label: "Item", filterType: "includes" },
    //             { accessor: "required", label: "Required", filterType: "includes" },
    //             { accessor: "actual", label: "Actual", filterType: "includes" },
    //             { accessor: "category", label: "Category", filterType: "includes" },
    //             { accessor: "subCategory", label: "SubCategory", filterType: "includes" },
    //             { accessor: "inventory_id", label: "ID", filterType: "includes" },
    //         ]
    //     }
    // ], [])
    const mainColumns: TableColumnHeader[] = useMemo(() => [
        // { accessor: "image.favorite", label: '', type: 'image' },
        { accessor: "subdivision_id", label: "Subdivision", filterType: "includes" },
        { accessor: "parcelLot", label: "Lot", filterType: "includes" },
        { accessor: "title", label: "Title", filterType: "includes" },
        { accessor: "required", label: "Required", filterType: "includes" },
        { accessor: "actual", label: "Actual", filterType: "includes" },
        { accessor: "category", label: "Category", filterType: "includes" },
        { accessor: "subCategory", label: "Sub Category", filterType: "includes" },
        { accessor: "inventory_id", label: "ID", filterType: "equal" },
    ], [])

    const modals = useMemo(() => {
        return [
            { mode: 'startParcel', title: 'Start Construction', label: 'Start', component: <StartConstruction /> },
            // { mode: 'palletize', title: 'Pallet Information', label: 'Palletize', component: <PalletizeItems /> }
        ]

    }, [])

    if (!parcelData) return <LoadingSkeleton />
    console.log('Parcel render')

    return (
        <>
            <Title order={2}>Parcel Inventory</Title>
            <TableLayout
                primaryRow={
                    {
                        columns: mainColumns,
                        rows: flattenParcelBOM(parcelData),
                        emptyRow: defaultParcelInventory,
                        ribbonControls: { add: false, start: true },
                        drawerTitle: 'Edit Parcel Inventory',
                        modals: modals
                    }
                }
                nestedRow={
                    {
                        columns: mainColumns
                    }
                }
                reload={parcelReload}
            >
                <EditParcelInventory />
            </TableLayout >
        </>)
}
