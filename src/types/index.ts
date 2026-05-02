import type { BasePallet, BulkInventoryItem } from "./construction";
import type { Parcel, ParcelFlatBOM, ParcelFlatHome, ParcelInventoryType } from "./parcels";

/**
 * The main type that defines all inventory database types
 * used throughout the application.
 *
 * @typedef {BulkInventoryItem[]} ViewerDbTypes
 * @typedef {BulkInventoryItem} ViewerDbRowTypes
 * 
 * @property {BulkInventoryItem[]} BulkInventoryItem - Array of bulk inventory items.
 * 
 * @remarks
 * In the future, this type will be expanded to include additional
 * database types relevant to the inventory application.
 */
export type ViewerDbTypes = (BulkInventoryItem | BasePallet | ParcelInventoryType | ParcelFlatBOM | ParcelFlatHome)[];
export type ViewerDbRowTypes = BulkInventoryItem | BasePallet | ParcelInventoryType | ParcelFlatBOM | Parcel;