import type { BasePallet, BulkInventoryItem } from "./construction";

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
export type ViewerDbTypes = BulkInventoryItem[] | BasePallet[];
export type ViewerDbRowTypes = BulkInventoryItem | BasePallet;