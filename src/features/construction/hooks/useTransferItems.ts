import { useTransferBase } from "./useTransferBase";
import { transferItems } from "../services/transferItems";

/**
 * Logic for the non-pallet inventory transfer flow.
 * @returns {object} State/actions for inventory transfer
 */
export function useTransferItems({ db, type }: { db: string, type: 'pallet' | 'inventory' }) {
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
  } = useTransferBase({ db, type });

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
      controls: { controllingDB: db, type: type, ...selects },
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