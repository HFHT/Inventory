import { useMemo, useState } from "react";
import { useTableSelectionStore } from "../../../components/table/stores/tableStore";
import { useLocations, useResourceData } from "../../../stores";
import type { BasePallet, BulkInventoryItem, TransferResults } from "../../../types/construction";
import { sumRequiredAndActualBySubdivision } from "../utils";
import type { ParcelInventoryType } from "../../../types/parcels";

/**
 * Shared row/selection/location/parcel data and logic. Used by:
 * - useTransferItems
 * - usePalletizeItems
 */

/**
 * @typedef {Object} TransferSelects
 * @property {string | null} locationOfInventory - The location from which inventory is transferred.
 * @property {string | null} locationOfParcel - The location to which inventory is transferred.
 * @property {string | null} parcel - The selected parcel ID.
 */
export type TransferSelects = {
    locationOfInventory: string | null;
    locationOfParcel: string | null;
    parcel: string | null;
};

/**
 * @typedef {Object} RowSelection
 * @property {string | null} parcel - The selected parcel ID for this item.
 * @property {number | null} amount - The amount to transfer for this item.
 * @property {string | undefined} title - (optional) For pallets.
 * @property {string | undefined} SKU - (optional) For pallets.
 */
type RowSelection = {
    parcel: string | null;
    title?: string | undefined;
    SKU?: string | undefined;
    amount: number | null | undefined;
};

/**
 * Store row selections by row ID. { [rowId]: { parcel, amount } }
 */
type RowSelections = Record<string, RowSelection>;

type UseTransferBaseProps = {
    db: string;
    type: 'pallet' | 'inventory';
    restock?: boolean;
};

/**
 * Shared base logic for both transfer and palletize flows.
 * @returns {object} Shared state, actions, helpers
 */
export function useTransferBase({ db, type, restock = false }: UseTransferBaseProps) {
    /** Main selects: source, destination, parcel. */
    const [selects, setSelects] = useState<TransferSelects>({
        locationOfInventory: "Chuck",
        locationOfParcel: null,
        parcel: "Any",
    });

    /**
     * Pull selectedRowIds directly from store. The store guarantees NonNullable
     * ids via DefinedRowId — we use useMemo to safely derive a filtered array
     * without creating a new reference on every render inside the selector.
     */
    const rawSelectedRowIds = useTableSelectionStore((state) => state.selectedRowIds);

    const selectedRowIds = useMemo(
        () => rawSelectedRowIds.filter((id): id is NonNullable<typeof id> => id != null),
        [rawSelectedRowIds]
    );

    /** Remove row id from selection. */
    const removeSelectedRowId = useTableSelectionStore((state) => state.removeSelectedRowId);

    /** Create default rowSelections for selected row ids. */
    function getDefaultRowSelections(ids: Array<string | number>): RowSelections {
        return ids.reduce<RowSelections>((acc, id) => {
            acc[id] = { parcel: null, amount: null };
            return acc;
        }, {});
    }

    /** Row selections state. */
    const [rowSelections, setRowSelections] = useState<RowSelections>(() =>
        getDefaultRowSelections(selectedRowIds)
    );

    /** Transfer results state. */
    const [transferResults, setTransferResults] = useState<TransferResults | undefined>();

    /** Locations select options */
    const locations = useLocations();

    /** Resource data for main, parcel, and pallet. */
    const { data, reload: reloadInventory } = useResourceData<BulkInventoryItem[]>("inventory");
    const { data: parcelData, reload: reloadParcel } = useResourceData<ParcelInventoryType[]>("parcelInventory");
    const { data: palletData, reload: reloadPallet } = useResourceData<BasePallet[]>("palletInventory");

    /** Transfer list: inventory items for selected rows. For a restock set the restockAmount value. */
    const transferList = useMemo(() => {
        console.log(type, palletData);
        if (selectedRowIds.length === 0) return [];
        if (type === 'pallet') {
            if (restock) {
                console.log('pallet - restock - initialize amount');
                return selectedRowIds.map((id) => {
                    const pallet = palletData?.find((d) => d._id === id);
                    if (!pallet) return pallet;
                    return {
                        ...pallet,
                        contents: pallet.contents.map((content) => ({
                            ...content,
                            restockAmount: content.amount,
                        })),
                    };
                });
            } else {
                return selectedRowIds.map((id) => palletData?.find((d) => d._id === id));
            }
        }
        return selectedRowIds.map((id) => data?.find((d) => d._id === id));
    }, [selectedRowIds, data, palletData]);

    /** Controlled select/row state setters for all flows. */
    function handleParcelSelectChange(rowId: string | number, value: string | null): void {
        setRowSelections((prev) => ({
            ...prev,
            [rowId]: {
                ...prev[rowId],
                parcel: value,
            },
        }));
    }

    function setRowAmount(rowId: string | number, value: number, title: string): void {
        setRowSelections((prev) => ({
            ...prev,
            [rowId]: {
                ...prev[rowId],
                amount: value,
                title: title,
            },
        }));
    }

    function setRowSKU(rowId: string | number, value: string | undefined): void {
        setRowSelections((prev) => ({
            ...prev,
            [rowId]: {
                ...prev[rowId],
                SKU: value,
            },
        }));
    }

    function rowQuantity(row: BulkInventoryItem | undefined): number {
        if (!row || type === 'pallet') return 0;
        const qtyAtLoc = row.quantity.byLocation.find((l) => l.loc === selects.locationOfInventory);
        return qtyAtLoc ? qtyAtLoc.qty : 0;
    }

    function onSiteQuantity(row: BulkInventoryItem | undefined): string {
        console.log(row, selects, type);
        const loc = locations.Locations.find((l) => l.Name === selects.locationOfParcel);
        if (!row) throw new Error('onSiteQuantity, row not provided');
        if (loc && loc.warehouse) {
            const qtyAtLoc = row.quantity.byLocation.find((l) => l.loc === loc.Name);
            return qtyAtLoc ? `${qtyAtLoc.qty}` : "0";
        }
        if (selects.parcel === 'All') {
            const { required, actual } = sumRequiredAndActualBySubdivision(parcelData, selects.locationOfParcel, row._id);
            return `${actual} of ${required}`;
        }
        const parcel = parcelData?.find((p) => p.parcelLot === selects.parcel);
        if (!row || !parcel || type === 'pallet') return "";
        const parcelQty = parcel.billOfMaterial.find((b) => b.inventory_id === row._id);
        return parcelQty ? `${parcelQty.actual} of ${parcelQty.required ? parcelQty.required : "0"}` : "0 of 0";
    }

    function setToLocation(v: string | null): void {
        setSelects((s) => ({ ...s, locationOfParcel: v, parcel: null }));
        setRowSelections(getDefaultRowSelections(selectedRowIds));
    }

    function setFromLocation(v: string | null): void {
        setSelects((s) => ({ ...s, locationOfInventory: v, locationOfParcel: null, parcel: null }));
        setRowSelections(getDefaultRowSelections(selectedRowIds));
    }

    function setToParcel(v: string | null): void {
        setSelects((s) => ({ ...s, parcel: v }));
        setRowSelections((prev) => {
            const updated = { ...prev };
            transferList.forEach((row) => {
                if (!row) return;
                if (!(row._id in updated) || updated[row._id].parcel == null) {
                    updated[row._id] = {
                        ...updated[row._id],
                        parcel: v,
                        amount: updated[row._id]?.amount ?? (type === 'pallet') ? 1 : null,
                    };
                }
            });
            return updated;
        });
    }

    function removeItem(row_id: string | number): void {
        removeSelectedRowId(row_id);
        setRowSelections((prev) => {
            const { [row_id as string]: _, ...rest } = prev;
            return rest;
        });
    }

    /** Result color */
    function transferResultsColor() {
        if (!transferResults) return undefined;
        if (transferResults.result.some(r => r.status === 'error')) return 'red';
        if (transferResults.result.some(r => r.status === 'skipped')) return 'orange';
        return 'green';
    }

    return {
        db,
        selects,
        setSelects,
        rowSelections,
        handleParcelSelectChange,
        setRowAmount,
        setRowSKU,
        rowQuantity,
        onSiteQuantity,
        setFromLocation,
        setToLocation,
        setToParcel,
        removeItem,
        transferList,
        selectedRowIds,
        locations,
        parcelData,
        transferResults,
        setTransferResults,
        reloadInventory,
        reloadParcel,
        reloadPallet,
        transferResultsColor,
    };
}



// import { useMemo, useState } from "react";
// import { useTableSelectionStore } from "../../../components/table/stores/tableStore";
// import { useLocations, useResourceData } from "../../../stores";
// import type { BasePallet, BulkInventoryItem, TransferResults } from "../../../types/construction";
// import { sumRequiredAndActualBySubdivision } from "../utils";
// import type { ParcelInventoryType } from "../../../types/parcels";

// /**
//  * Shared row/selection/location/parcel data and logic. Used by:
//  * - useTransferItems
//  * - usePalletizeItems
//  * 
//  */

// /**
//  * @typedef {Object} TransferSelects
//  * @property {string | null} locationOfInventory - The location from which inventory is transferred.
//  * @property {string | null} locationOfParcel - The location to which inventory is transferred.
//  * @property {string | null} parcel - The selected parcel ID.
//  */
// export type TransferSelects = {
//     locationOfInventory: string | null;
//     locationOfParcel: string | null;
//     parcel: string | null;
// };

// /**
//  * @typedef {Object} RowSelection
//  * @property {string | null} parcel - The selected parcel ID for this item.
//  * @property {number | null} amount - The amount to transfer for this item.
//  * @property {string | undefined} title - (optional) For pallets.
//  * @property {string | undefined} SKU - (optional) For pallets.
//  */
// type RowSelection = {
//     parcel: string | null;
//     title?: string | undefined;
//     SKU?: string | undefined;
//     amount: number | null | undefined;
// };

// /**
//  * Store row selections by row ID. { [rowId]: { parcel, amount } }
//  */
// type RowSelections = Record<string, RowSelection>;

// type UseTransferBaseProps = {
//     db: string;
//     type: 'pallet' | 'inventory'
//     restock?: boolean
// };

// /**
//  * Shared base logic for both transfer and palletize flows.
//  * @returns {object} Shared state, actions, helpers
//  */
// export function useTransferBase({ db, type, restock = false }: UseTransferBaseProps) {
//     /** Main selects: source, destination, parcel. */
//     const [selects, setSelects] = useState<TransferSelects>({
//         locationOfInventory: "Chuck",
//         locationOfParcel: null,
//         parcel: "Any",
//     });

//     /** Table selection store ids (string[]). */
//     const selectedRowIds = useTableSelectionStore((state) => state.selectedRowIds);
//     /** Remove row id from selection. */
//     const removeSelectedRowId = useTableSelectionStore((state) => state.removeSelectedRowId);

//     /** Create default rowSelections for selected row ids. */
//     function getDefaultRowSelections(selectedRowIds: Array<string | number>): RowSelections {
//         return selectedRowIds.reduce<RowSelections>((acc, id) => {
//             acc[id] = { parcel: null, amount: null };
//             return acc;
//         }, {});
//     }

//     /** Row selections state. */
//     const [rowSelections, setRowSelections] = useState<RowSelections>(() =>
//         getDefaultRowSelections(selectedRowIds)
//     );

//     /** Transfer results state. */
//     const [transferResults, setTransferResults] = useState<TransferResults | undefined>();

//     /** Locations select options */
//     const locations = useLocations();

//     /** Resource data for main, parcel, and pallet. */
//     const { data, reload: reloadInventory } = useResourceData<BulkInventoryItem[]>("inventory");
//     const { data: parcelData, reload: reloadParcel } = useResourceData<ParcelInventoryType[]>("parcelInventory");
//     const { data: palletData, reload: reloadPallet } = useResourceData<BasePallet[]>("palletInventory");

//     /** Transfer list: inventory items for selected rows. For a restock set the restockAmount value. */
//     const transferList = useMemo(() => {
//         console.log(type, palletData);
//         if (selectedRowIds.length === 0) return [];
//         if (type === 'pallet') {
//             if (restock) {
//                 console.log('pallet - restock - initialize amount')
//                 return selectedRowIds.map((id) => {
//                     const pallet = palletData?.find((d) => d._id === id);
//                     if (!pallet) return pallet;
//                     return {
//                         ...pallet,
//                         contents: pallet.contents.map((content) => ({
//                             ...content,
//                             restockAmount: content.amount,
//                         })),
//                     };
//                 });
//             } else {
//                 return selectedRowIds.map((id) => palletData?.find((d) => d._id === id));
//             }
//         }
//         return selectedRowIds.map((id) => data?.find((d) => d._id === id));
//     }, [selectedRowIds, data, palletData]);

//     /** Controlled select/row state setters for all flows. */
//     function handleParcelSelectChange(rowId: string | number, value: string | null): void {
//         setRowSelections((prev) => ({
//             ...prev,
//             [rowId]: {
//                 ...prev[rowId],
//                 parcel: value,
//             },
//         }));
//     }

//     function setRowAmount(rowId: string | number, value: number, title: string): void {
//         setRowSelections((prev) => ({
//             ...prev,
//             [rowId]: {
//                 ...prev[rowId],
//                 amount: value,
//                 title: title
//             },
//         }));
//     }

//     function setRowSKU(rowId: string | number, value: string | undefined): void {
//         setRowSelections((prev) => ({
//             ...prev,
//             [rowId]: {
//                 ...prev[rowId],
//                 SKU: value
//             },
//         }));
//     }

//     function rowQuantity(row: BulkInventoryItem | undefined): number {
//         if (!row || type === 'pallet') return 0;
//         const qtyAtLoc = row.quantity.byLocation.find((l) => l.loc === selects.locationOfInventory);
//         return qtyAtLoc ? qtyAtLoc.qty : 0;
//     }

//     function onSiteQuantity(row: BulkInventoryItem | undefined): string {
//         console.log(row, selects, type)
//         const loc = locations.Locations.find((l) => l.Name === selects.locationOfParcel)
//         if (!row) throw new Error('onSiteQuantity, row not provided')
//         if (loc && loc.warehouse) {
//             const qtyAtLoc = row.quantity.byLocation.find((l) => l.loc === loc.Name)
//             return qtyAtLoc ? `${qtyAtLoc.qty}` : "0";
//         }
//         if (selects.parcel === 'All') {
//             const { required, actual } = sumRequiredAndActualBySubdivision(parcelData, selects.locationOfParcel, row._id)
//             return `${actual} of ${required}`
//         }
//         const parcel = parcelData?.find((p) => p.parcelLot === selects.parcel);
//         if (!row || !parcel || type === 'pallet') return "";
//         const parcelQty = parcel.billOfMaterial.find((b) => b.inventory_id === row._id);
//         return parcelQty ? `${parcelQty.actual} of ${parcelQty.required ? parcelQty.required : "0"}` : "0 of 0";
//     }

//     function setToLocation(v: string | null): void {
//         setSelects((s) => ({ ...s, locationOfParcel: v, parcel: null }));
//         setRowSelections(getDefaultRowSelections(selectedRowIds));
//     }

//     function setFromLocation(v: string | null): void {
//         setSelects((s) => ({ ...s, locationOfInventory: v, locationOfParcel: null, parcel: null }));
//         setRowSelections(getDefaultRowSelections(selectedRowIds));
//     }

//     function setToParcel(v: string | null): void {
//         setSelects((s) => ({ ...s, parcel: v }));
//         setRowSelections((prev) => {
//             const updated = { ...prev };
//             transferList.forEach((row) => {
//                 if (!row) return;
//                 if (!(row._id in updated) || updated[row._id].parcel == null) {
//                     updated[row._id] = {
//                         ...updated[row._id],
//                         parcel: v,
//                         amount: updated[row._id]?.amount ?? (type === 'pallet') ? 1 : null,
//                     };
//                 }
//             });
//             return updated;
//         });
//     }

//     function removeItem(row_id: string | number): void {
//         removeSelectedRowId(row_id);
//         setRowSelections((prev) => {
//             const { [row_id as string]: _, ...rest } = prev;
//             return rest;
//         });
//     }

//     /** Result color */
//     function transferResultsColor() {
//         if (!transferResults) return undefined;
//         if (transferResults.result.some(r => r.status === 'error')) {
//             return 'red';
//         }
//         if (transferResults.result.some(r => r.status === 'skipped')) {
//             return 'orange';
//         }
//         return 'green';
//     }

//     return {
//         db,
//         selects,
//         setSelects,
//         rowSelections,
//         handleParcelSelectChange,
//         setRowAmount,
//         setRowSKU,
//         rowQuantity,
//         onSiteQuantity,
//         setFromLocation,
//         setToLocation,
//         setToParcel,
//         removeItem,
//         transferList,
//         selectedRowIds,
//         locations,
//         parcelData,
//         transferResults,
//         setTransferResults,
//         reloadInventory,
//         reloadParcel,
//         reloadPallet,
//         transferResultsColor,
//     };
// }