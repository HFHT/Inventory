import { useMemo } from "react"
import type { TableColumnHeader } from "../../../components/table/types"
import { useResourceData } from "../../../stores";
import type { ParcelInventoryType } from "../../../types/parcels";
import { StartConstruction } from ".";
import { LoadingSkeleton } from "../../../components/table/components";
import { Title } from "@mantine/core";
import { TableLayout } from "../../../layouts";
import { flattenParcelBOM } from "../../construction/utils";
import { defaultParcelInventory } from "../constants";
import { EditParcelInventory } from "../../construction";

export function ParcelBomInventory() {
    const { data: parcelData, reload: parcelReload } = useResourceData<ParcelInventoryType[]>("parcelInventory");

    const mainColumns: TableColumnHeader[] = useMemo(() => [
        // { accessor: "image.favorite", label: '', type: 'image' },
        { accessor: "subdivision_id", label: "Subdivision", filterType: "includes" },
        { accessor: "parcelLot", label: "Lot", filterType: "includes" },
        { accessor: "title", label: "Title", filterType: "includes" },
        { accessor: "required", label: "Required", filterType: "includes" },
        { accessor: "required", label: "Ordered", filterType: "includes" },
        { accessor: "required", label: "Received", filterType: "includes" },
        { accessor: "actual", label: "On Site", filterType: "includes" },
        { accessor: "category", label: "Category", filterType: "includes" },
        { accessor: "subCategory", label: "Sub Category", filterType: "includes" },
        { accessor: "inventory_id", label: "ID", filterType: "equal" },
    ], [])

    const modals = useMemo(() => {
        return [
            // { mode: 'startParcel', title: 'Start Construction', label: 'Start', component: <StartConstruction /> },
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
                        ribbonControls: { add: false, deviations: true },
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
