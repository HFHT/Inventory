import type { ParcelFlatBOM, ParcelInventoryType } from "../../../types/parcels";

/**
 * Flattens the billOfMaterial array for all parcels,
 * including parcel-level identifiers in each flattened row.
 *
 * @param {ParcelInventoryType[]} parcels - The parcels inventory array.
 * @returns {Array<
 *   BillOfMaterialType & {
 *     _id: string | number;
 *     subdivision_id: string | null;
 *     parcelLot: string | null;
 *     parcel_id: string | null;
 *   }
 * >} The flattened array of bill of materials rows.
 */
export function flattenParcelBOM(
    parcels: ParcelInventoryType[]
): ParcelFlatBOM[] {
    return parcels.flatMap((parcel) =>
        parcel.billOfMaterial.map((bom) => ({
            ...bom,
            _id: parcel._id,
            subdivision_id: parcel.subdivision_id,
            parcelLot: parcel.parcelLot,
            parcel_id: parcel.parcel_id,
        })),
    );
}