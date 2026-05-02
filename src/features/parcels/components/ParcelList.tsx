import { useMemo } from "react";
import { LoadingSkeleton } from "../../../components/table/components";
import type { TableColumnHeader } from "../../../components/table/types";
import { useResourceData } from "../../../stores";
import type { Parcel } from "../../../types/parcels";
import { Title } from "@mantine/core";
import { TableLayout } from "../../../layouts";
import { EditParcel, StartConstruction } from "../../construction";
import { defaultParcel } from "../constants";
import { flattenParcelsHomes } from "../utils/flattenParcelsHomes";

export function ParcelList() {
    const { data: parcelData, reload: parcelReload } = useResourceData<Parcel[]>("parcelList");
    const mainColumns: TableColumnHeader[] = useMemo(() => [
        // { accessor: "image.favorite", label: '', type: 'image' },
        { accessor: "parcel_id", label: "APN", filterType: "includes" },
        { accessor: "type", label: "Type", filterType: "equal" },
        { accessor: "location.subdivision_id", label: "Subdivision", filterType: "includes" },
        { accessor: "location.lotNumber", label: "Lot", filterType: "includes" },
        { accessor: "street", label: "Street", filterType: "includes" },
        { accessor: "location.city", label: "City", filterType: "includes" },
        { accessor: "location.ward", label: "Ward", filterType: "includes" },
        { accessor: "status", label: "Build", filterType: "includes" },
    ], [])
    const modals = useMemo(() => {
        return [
            { mode: 'startParcel', title: 'Start Construction', label: 'Start', component: <StartConstruction /> },
            // { mode: 'palletize', title: 'Pallet Information', label: 'Palletize', component: <PalletizeItems /> }
        ]

    }, [])
    if (!parcelData) return <LoadingSkeleton />
    console.log('Parcel render', flattenParcelsHomes(parcelData))
    return (
        <>
            <Title order={2}>Parcel Inventory</Title>
            <TableLayout
                primaryRow={
                    {
                        columns: mainColumns,
                        rows: flattenParcelsHomes(parcelData),
                        emptyRow: defaultParcel,
                        ribbonControls: { add: false, start: true, deviations: true },
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
                <EditParcel />
            </TableLayout >
        </>
    )
}
