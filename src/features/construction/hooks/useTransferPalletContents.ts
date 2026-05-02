import { useCallback, useEffect, useState } from "react";
import { useTransferBase } from ".";
import type { BasePallet } from "../../../types/construction";

export function useTransferPalletContents({ db, type, restock = false }: { db: string, type: 'pallet' | 'inventory', restock?: boolean }) {
    const {
        selects,
        setSelects,
        rowSelections,
        setRowSKU,
        setRowAmount,
        handleParcelSelectChange,
        locations,
        rowQuantity,
        setFromLocation,
        removeItem,
        transferList,
        transferResults,
        setTransferResults,
        transferResultsColor
        // Intentionally omitting locations etc for brevity
    } = useTransferBase({ db, type: type, restock: restock });

    const [palletRestockList, setPalletRestockList] = useState<BasePallet[] | undefined>(transferList as BasePallet[])

    useEffect(() => {
        if (!palletRestockList) return
        console.log('useTransferPalletContents-useEffect', palletRestockList)
        const pallets = palletRestockList
        pallets.forEach(p => p.contents.forEach(c => c.restockAmount === c.amount))
        setPalletRestockList(pallets)
    }, [palletRestockList])

    /**
 * Updates the `restockAmount` for a specific pallet contents item
 * identified by `inventory_id` across all pallets in the restock list.
 *
 * @param {string | number} inventory_id - The ID of the contents item to update.
 * @param {number} amount - The new restock amount.
 */
    const updateRestockAmount = useCallback(
        (inventory_id: string | number, amount: number) => {
            setPalletRestockList((prev) =>
                prev!.map((pallet) => ({
                    ...pallet,
                    contents: pallet.contents.map((item) =>
                        item.inventory_id === inventory_id
                            ? { ...item, restockAmount: amount }
                            : item
                    ),
                }))
            );
        },
        [setPalletRestockList]
    );
    const transferDisabled = () => {
        return false
    }
    const restockContents = () => {

    }
    const unloadContents = () => {

    }
    return { restockContents, unloadContents, updateRestockAmount, transferDisabled, rowSelections, locations, removeItem, palletRestockList, setPalletRestockList, transferResults, setTransferResults, transferResultsColor }
}
