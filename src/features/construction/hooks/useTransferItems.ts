import { useTransferBase } from "./useTransferBase";
import { transferItems } from "../services/transferItems";

/**
 * Logic for the non-pallet inventory transfer flow.
 * @returns {object} State/actions for inventory transfer
 */
export function useTransferItems({ db }: { db: string }) {
  const {
    selects,
    rowSelections,
    handleParcelSelectChange,
    setRowAmount,
    rowQuantity,
    onSiteQuantity,
    setFromLocation,
    setToLocation,
    setToParcel,
    removeItem,
    transferList,
    locations,
    parcelData,
    transferResults,
    setTransferResults,
    reloadParcel,
    transferResultsColor
  } = useTransferBase({ db });

  /**
   * Returns true if transfer action should be disabled.
   */
  function transferDisabled(): boolean {
    if (transferList.length === 0) return true;
    if (transferResults !== undefined) return true;
    return transferList.some((row) => {
      if (!row || !selects || !selects.locationOfInventory || !selects.locationOfParcel) return true;
      const sel = rowSelections[row._id];
      return (
        !sel ||
        sel.parcel == null ||
        sel.parcel === "" ||
        typeof sel.amount !== "number" ||
        isNaN(sel.amount)
      );
    });
  }

  async function handleTransferOfItems() {
    setTransferResults(await transferItems({
      controls: { controllingDB: db, ...selects },
      items: rowSelections,
    }));
    reloadParcel();
    // You may want to also call reloadInventory()
  }

  return {
    selects,
    rowSelections,
    handleParcelSelectChange,
    handleTransferOfItems,
    rowQuantity,
    onSiteQuantity,
    setFromLocation,
    setToLocation,
    setToParcel,
    transferDisabled,
    setRowAmount,
    removeItem,
    transferList,
    locations,
    parcelData,
    transferResults,
    transferResultsColor,
  };
}


// import { useEffect, useMemo, useState } from "react";
// import { useTableSelectionStore } from "../../../components/table/stores/tableStore";
// import { useLocations, useResourceData } from "../../../stores";
// import type { BasePallet, BulkInventoryItem, TransferResults } from "../../../types/construction";
// import { transferItems } from "../services/transferItems";
// import type { ParcelInventoryType } from "../../../types/parcelInventory";
// import { defaultPallet } from "../constants";
// import { palletizeItems } from "../services/palletizeItems";

// /**
//  * @typedef {Object} TransferSelects
//  * @property {string | null} locationOfInventory - The location from which inventory is transferred.
//  * @property {string | null} locationOfParcel - The location to which inventory is transferred.
//  * @property {string | null} parcel - The selected parcel ID.
//  */
// type TransferSelects = {
//     locationOfInventory: string | null;
//     locationOfParcel: string | null;
//     parcel: string | null;
// };

// /**
//  * @typedef {Object} RowSelection
//  * @property {string | null} parcel - The selected parcel ID for this item.
//  * @property {string | undefined} title - The item title, used for pallet transfers.
//  * @property {string | undefined} SKU - The item SKU, used for pallet transfers.
//  * @property {number | null} amount - The amount to transfer for this item.
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


// /**
//  * Props passed to this hook
//  */
// type TransferProps = {
//     db: string
//     pallet?: boolean
// }
// /**
//  * React hook for managing inventory transfer between locations or parcels.
//  *
//  * @returns {Object} Hook state, selectors, and actions for the inventory transfer flow.
//  */
// export function useTransferItems({ db, pallet = false }: TransferProps) {
//     /**
//      * State object for main selects: source location, destination location, and parcel.
//      */
//     const [selects, setSelects] = useState<TransferSelects>({
//         locationOfInventory: "Chuck",
//         locationOfParcel: null,
//         parcel: "Any",
//     });

//     /** @type {string[]} */
//     const selectedRowIds = useTableSelectionStore((state) => state.selectedRowIds);

//     /**
//      * Initialize rowSelections using selectedRowIds.
//      */
//     function getDefaultRowSelections(selectedRowIds: Array<string | number>): RowSelections {
//         console.log(selectedRowIds)
//         return selectedRowIds.reduce<RowSelections>((acc, id) => {
//             acc[id] = { parcel: null, amount: null };
//             return acc;
//         }, {});
//     }

//     /**
//      * State: Map row IDs to their parcel and amount selection.
//      */
//     const [rowSelections, setRowSelections] = useState<RowSelections>(() =>
//         getDefaultRowSelections(selectedRowIds)
//     );

//     const [transferResults, setTransferResults] = useState<TransferResults | undefined>()

//     function transferResultsColor() {
//         if (!transferResults) return undefined
//         if (transferResults.result.some(r => r.status === 'error')) {
//             return 'red'
//         }
//         if (transferResults.result.some(r => r.status === 'skipped')) {
//             return 'orange'
//         }
//         return 'green'
//     }

//     /** @type {(id: string | number) => void} */
//     const removeSelectedRowId = useTableSelectionStore((state) => state.removeSelectedRowId);

//     /** @type {ReturnType<typeof useLocations>} */
//     const locations = useLocations();

//     /** @type {{ data: BulkInventoryItem[] | undefined }} */
//     const { data, reload: reloadInventory } = useResourceData<BulkInventoryItem[]>("inventory");
//     /** @type {{ data: ParcelInventoryType[] | undefined }} */
//     const { data: parcelData, reload: reloadParcel } = useResourceData<ParcelInventoryType[]>("parcelInventory");
//     /** @type {{ data: BasePallet[] | undefined }} */
//     const { data: palletData, reload: reloadPallet } = useResourceData<BasePallet[]>("palletInventory");

//     /**
//      * Memoized list of inventory items matched with current selected row IDs.
//      */
//     const transferList = useMemo(() => {
//         if (selectedRowIds.length === 0) return [];
//         return selectedRowIds.map((id) => data?.find((d) => d._id === id));
//     }, [selectedRowIds, data, parcelData]);

//     /**
//      * Update selected parcel for a specific row.
//      * @param {string | number} rowId - The ID of the inventory row.
//      * @param {string | null} value - The new parcel value.
//      */
//     function handleParcelSelectChange(rowId: string | number, value: string | null): void {
//         setRowSelections((prev) => ({
//             ...prev,
//             [rowId]: {
//                 ...prev[rowId],
//                 parcel: value,
//             },
//         }));
//     }

//     /**
//      * Assign an amount for a particular row/item.
//      * @param {string | number} rowId - Item ID.
//      * @param {number} value - Amount to set.
//      */
//     function setRowAmount(rowId: string | number, value: number): void {
//         setRowSelections((prev) => ({
//             ...prev,
//             [rowId]: {
//                 ...prev[rowId],
//                 amount: value,
//             },
//         }));
//     }

//     /**
//      * Get the quantity of the provided item at the selected source inventory location.
//      * @param {BulkInventoryItem | undefined} row - The inventory item row.
//      * @returns {number} Amount of item at selected location.
//      */
//     function rowQuantity(row: BulkInventoryItem | undefined): number {
//         if (!row) return 0;
//         const qtyAtLoc = row.quantity.byLocation.find((l) => l.loc === selects.locationOfInventory);
//         return qtyAtLoc ? qtyAtLoc.qty : 0;
//     }

//     /**
//      * Get a display string of "actual/required" on site for given row's inventory in selected parcel.
//      * @param {BulkInventoryItem | undefined} row - The inventory item.
//      * @returns {string} Display summary, e.g. "5 of 10"
//      */
//     function onSiteQuantity(row: BulkInventoryItem | undefined): string {
//         const parcel = parcelData?.find((p) => p.parcelLot === selects.parcel);
//         if (!row || !parcel) return "";
//         const parcelQty = parcel.billOfMaterial.find((b) => b.inventory_id === row._id);
//         return parcelQty ? `${parcelQty.actual} of ${parcelQty.required ? parcelQty.required : "0"}` : "0 of 0";
//     }

//     /**
//      * Set "to" (destination) location and reset parcel selection.
//      * @param {string | null} v - Location value.
//      */
//     function setToLocation(v: string | null): void {
//         setSelects((s) => ({ ...s, locationOfParcel: v, parcel: null }));
//         const initialValues = getDefaultRowSelections(selectedRowIds);
//         setRowSelections({ ...initialValues });
//     }

//     /**
//      * Set "from" (source) inventory location.
//      * @param {string | null} v - Location value.
//      */
//     function setFromLocation(v: string | null): void {
//         setSelects((s) => ({ ...s, locationOfInventory: v, locationOfParcel: null, parcel: null }));
//         const initialValues = getDefaultRowSelections(selectedRowIds);
//         setRowSelections({ ...initialValues });
//     }

//     /**
//      * Sets the parcel selection and assigns it to all rows missing an assignment.
//      * @param {string | null} v - Parcel value.
//      */
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
//                         // Retain old amount if set, else null
//                         amount: updated[row._id]?.amount ?? null,
//                     };
//                 }
//             });
//             return updated;
//         });
//     }

//     /**
//      * Determine if the transfer action should be disabled based on selections and amounts.
//      * @returns {boolean}
//      */
//     function transferDisabled(): boolean {
//         console.log('transferDisabled', transferList, rowSelections, selects)
//         if (transferList.length === 0) return true
//         if (transferResults !== undefined) return true
//         return transferList.some((row) => {
//             if (!row || !selects || !selects.locationOfInventory || !selects.locationOfParcel) return true;
//             const sel = rowSelections[row._id];
//             return (
//                 !sel ||
//                 sel.parcel == null ||
//                 sel.parcel === "" ||
//                 typeof sel.amount !== "number" ||
//                 isNaN(sel.amount)
//             );
//         });
//     }

//     /**
//      * Removes the selected row/item and clears associated state.
//      * @param {string | number} row_id - The row/item ID to remove.
//      */
//     function removeItem(row_id: string | number): void {
//         // Update selectedRowIds via store
//         removeSelectedRowId(row_id);

//         // Cleanup local UI state
//         setRowSelections((prev) => {
//             const { [row_id as string]: _, ...rest } = prev;
//             return rest;
//         });
//     }

//     /**
//      * Placeholder for the actual transfer logic (to be implemented).
//      */
//     async function handleTransferOfItems() {
//         // Implement transfer functionality here
//         console.log('handleTransferOfItems', db);
//         if (pallet) {
//             // selectedPallet contains the pallet information
//             // rowSelections contains the amount sku and title for each item
//             const contents =
//                 Object.entries(rowSelections).map(([rowId, rowSelection]) => {
//                     const { parcel, ...rest } = rowSelection;
//                     return { ...rest, inventory_id: rowId };
//                 })
//             console.log(contents)
//             const updatedSelectedPallet = { ...selectedPallet, contents: contents, fromLocation: selects.locationOfInventory! }
//             console.log('pallet', selects, rowSelections, selectedPallet)
//             console.log(updatedSelectedPallet)
//             setTransferResults(await palletizeItems({ controls: { controllingDB: db }, items: updatedSelectedPallet }))
//             reloadPallet()
//         } else {
//             setTransferResults(await transferItems({ controls: { controllingDB: db, ...selects }, items: rowSelections }))
//             reloadParcel()
//         }
//         // reloadInventory()
//     }

//     const [selectedPallet, setSelectedPallet] = useState<BasePallet>(defaultPallet)
//     const [selectedPalletName, setSelectedPalletName] = useState<string>('')
//     const [havePalletInfo, setHavePalletInfo] = useState(false)


//     useEffect(() => {
//         if (selectedPalletName === '') {
//             setHavePalletInfo(false)
//             setSelectedPallet(defaultPallet)
//         }
//     }, [selectedPalletName])

//     useEffect(() => {
//         if (selects.locationOfInventory === null) setHavePalletInfo(false)
//     }, [selects.locationOfInventory])

//     const onPalletQuantity = (row: BulkInventoryItem) => {
//         console.log(row)
//         const item = selectedPallet.contents.find((f) => f.inventory_id === row._id)
//         if (!item) return '0'
//         return item.amount
//     }
//     const palletList = useMemo(() => {
//         console.log(data)
//         if (!palletData || palletData.length === 0) return []
//         return palletData.filter((d) => d.dateShipped === '').map((d) => d.title)
//     }, [palletData])

//     const nextStep = () => {
//         console.log('nextStep')
//         console.log(selectedPalletName, palletList)
//         const thePallet = palletData?.find((d) => d.title === selectedPalletName)
//         setSelectedPallet(thePallet ?? { ...defaultPallet, title: selectedPalletName })
//         setToLocation('pallet')
//         setHavePalletInfo(true)
//     }
//     // Return full API
//     return {
//         selects,
//         setSelects,
//         rowSelections,
//         setRowSelections,
//         handleParcelSelectChange,
//         handleTransferOfItems,
//         rowQuantity,
//         onSiteQuantity,
//         setFromLocation,
//         setToLocation,
//         setToParcel,
//         transferDisabled,
//         setRowAmount,
//         removeItem,
//         transferList,
//         selectedRowIds,
//         locations,
//         parcelData,
//         transferResults,
//         transferResultsColor,

//         selectedPalletName,
//         setSelectedPalletName,
//         selectedPallet,
//         setSelectedPallet,
//         havePalletInfo,
//         setHavePalletInfo,
//         onPalletQuantity,
//         palletList,
//         nextStep
//     };
// }
