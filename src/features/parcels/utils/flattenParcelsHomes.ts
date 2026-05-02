import type { Parcel, ParcelFlatHome } from "../../../types/parcels";

/**
 * Transforms an array of `Parcel` objects into a single flattened array of `ParcelFlatHome` objects
 * by flattening the `homes` array of each parcel.
 * Each home in every `Parcel` becomes its own `ParcelFlatHome` entry, inheriting the base parcel properties.
 *
 * @param {Parcel[]} parcels - An array of parcel objects, each containing nested homes to be flattened.
 * @returns {ParcelFlatHome[]} A single flattened array of parcel-home objects, one per home across all parcels.
 *
 * @example
 * const parcels: Parcel[] = [
 *   {
 *     _id: "abc123",
 *     location: { city: "Springfield", state: "IL", lot: "5A", ... },
 *     homes: [{ street: "123 Main St", build: { status: "Complete", ... }, ... }],
 *     ...
 *   },
 *   {
 *     _id: "def456",
 *     location: { city: "Shelbyville", state: "IL", lot: "7B", ... },
 *     homes: [
 *       { street: "456 Elm St", build: { status: "In Progress", ... }, ... },
 *       { street: "789 Oak St", build: { status: "Pending", ... }, ... },
 *     ],
 *     ...
 *   },
 * ];
 *
 * const flatHomes = flattenParcelsHomes(parcels);
 * // flatHomes.length === 3
 * // flatHomes[0].street === "123 Main St"
 * // flatHomes[0].parcel_id === "abc123"
 * // flatHomes[1].street === "456 Elm St"
 * // flatHomes[1].parcel_id === "def456"
 * // flatHomes[2].street === "789 Oak St"
 * // flatHomes[2].home_idx === 1
 */
export function flattenParcelsHomes(parcels: Parcel[]): ParcelFlatHome[] {
    return parcels.flatMap((parcel) => {
        // Destructure the base parcel properties, excluding homes
        const { homes, ...parcelBase } = parcel;

        return homes.map((home, index): ParcelFlatHome => ({
            // Spread all base parcel properties (history, location, notes, type)
            ...parcelBase,

            // Unique ID combining parcel ID and home index for list keying
            _id: index === 0 ? parcel._id! : `${parcel._id}_${index}`,

            // The index of this home within the original parcel's homes array
            home_idx: index,

            // Flat home-specific fields sourced from the home object
            street: home.street,
            status: home.build.status,

            // Fields promoted from nested location/parcel for easy access
            subdivision_id: parcel.location.subdivision_id,
            parcelLot: parcel.location.lotNumber,

            // Display version of the parcel's ID and home index
            parcel_id: index === 0 ? parcel._id! : `${parcel._id}: ${index}`,
        }));
    });
}