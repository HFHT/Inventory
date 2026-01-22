import { useMemo, useState } from "react";
import { useTableSelectionStore } from "../../../components/table/stores/tableStore";
import { useLocations, useResourceData } from "../../../stores";
import type { BulkInventoryItem, TransferResults } from "../../../types/construction";
import type { ParcelInventoryType } from "../../../types/parcelInventory";

/**
 * Shared row/selection/location/parcel data and logic. Used by:
 * - useTransferItems
 * - usePalletizeItems
 * 
 */

/**
 * @typedef {Object} TransferSelects
 * @property {string | null} locationOfInventory - The location from which inventory is transferred.
 * @property {string | null} locationOfParcel - The location to which inventory is transferred.
 * @property {string | null} parcel - The selected parcel ID.
 */
type TransferSelects = {
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
};

/**
 * Shared base logic for both transfer and palletize flows.
 * @returns {object} Shared state, actions, helpers
 */
export function useTransferBase({ db }: UseTransferBaseProps) {
    /** Main selects: source, destination, parcel. */
    const [selects, setSelects] = useState<TransferSelects>({
        locationOfInventory: "Chuck",
        locationOfParcel: null,
        parcel: "Any",
    });

    /** Table selection store ids (string[]). */
    const selectedRowIds = useTableSelectionStore((state) => state.selectedRowIds);
    /** Remove row id from selection. */
    const removeSelectedRowId = useTableSelectionStore((state) => state.removeSelectedRowId);

    /** Create default rowSelections for selected row ids. */
    function getDefaultRowSelections(selectedRowIds: Array<string | number>): RowSelections {
        return selectedRowIds.reduce<RowSelections>((acc, id) => {
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

    /** Transfer list: inventory items for selected rows. */
    const transferList = useMemo(() => {
        if (selectedRowIds.length === 0) return [];
        return selectedRowIds.map((id) => data?.find((d) => d._id === id));
    }, [selectedRowIds, data, parcelData]);

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
                title: title
            },
        }));
    }

    function setRowSKU(rowId: string | number, value: string | undefined): void {
        setRowSelections((prev) => ({
            ...prev,
            [rowId]: {
                ...prev[rowId],
                SKU: value
            },
        }));
    }

    function rowQuantity(row: BulkInventoryItem | undefined): number {
        if (!row) return 0;
        const qtyAtLoc = row.quantity.byLocation.find((l) => l.loc === selects.locationOfInventory);
        return qtyAtLoc ? qtyAtLoc.qty : 0;
    }

    function onSiteQuantity(row: BulkInventoryItem | undefined): string {
        const parcel = parcelData?.find((p) => p.parcelLot === selects.parcel);
        if (!row || !parcel) return "";
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
                        amount: updated[row._id]?.amount ?? null,
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
        if (transferResults.result.some(r => r.status === 'error')) {
            return 'red';
        }
        if (transferResults.result.some(r => r.status === 'skipped')) {
            return 'orange';
        }
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
        transferResultsColor,
    };
}