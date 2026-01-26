import type { ParcelInventoryType } from "../../../types/parcelInventory";

/**
 * Sums the 'required' and 'actual' values of BillOfMaterial entries
 * for all parcels that match the specified subdivision_id and where
 * the `billOfMaterial.inventory_id` matches the specified inventory_id.
 *
 * @param {ParcelInventoryType[]} parcels - Array of parcel inventory objects.
 * @param {string} subdivision_id - The subdivision_id to filter parcels by.
 * @param {string | number} inventory_id - The inventory_id to filter billOfMaterial entries by.
 * @returns {{ required: number, actual: number }} The aggregated sums.
 */
export function sumRequiredAndActualBySubdivision(
    parcels: ParcelInventoryType[] | null,
    subdivision_id: string | null,
    inventory_id: string | number
): { required: number; actual: number } {
    if (!parcels || !subdivision_id) return { required: 0, actual: 0 }
    return parcels
        .filter(parcel => parcel.subdivision_id === subdivision_id)
        .reduce(
            (acc, parcel) => {
                parcel.billOfMaterial.forEach(bom => {
                    if (bom.inventory_id === inventory_id) {
                        acc.required += typeof bom.required === "number" ? bom.required : 0;
                        acc.actual += typeof bom.actual === "number" ? bom.actual : 0;
                    }
                });
                return acc;
            },
            { required: 0, actual: 0 }
        );
}