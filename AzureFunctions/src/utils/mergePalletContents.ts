import { BasePallet, PalletContents } from "../types";

/**
 * Merges pallet contents, summing amounts for duplicate inventory_id items,
 * and adding new ones that aren't present.
 *
 * @param {BasePallet} dbPallet - The pallet record from the database.
 * @param {BasePallet} apiPallet - The pallet received from the API.
 * @returns {BasePallet} - A new pallet with combined contents.
 */
export function mergePalletContents(
    dbPallet: BasePallet,
    apiPallet: BasePallet
): BasePallet {
    // Make a shallow copy of dbPallet and a deep copy of its contents
    const result: BasePallet = {
        ...dbPallet,
        contents: dbPallet.contents.map(item => ({ ...item }))
    };

    // Helper to find an item by inventory_id (matches numbers and strings)
    function findIndexByInventoryId(
        arr: PalletContents[],
        inventory_id: number | string
    ): number {
        return arr.findIndex(
            item => item.inventory_id == inventory_id // == to allow '1' == 1
        );
    }

    for (const apiItem of apiPallet.contents) {
        const idx = findIndexByInventoryId(result.contents, apiItem.inventory_id);
        if (idx !== -1) {
            // If exists, sum amounts
            result.contents[idx].amount += apiItem.amount;
        } else {
            // If not, add a copy of the API item
            result.contents.push({ ...apiItem });
        }
    }

    return result;
}