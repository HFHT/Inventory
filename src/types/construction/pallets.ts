/**
 * Base shape for a construction pallet.
 * @interface
 */
export interface BasePallet {
    _id: number | string;
    dateCreated: string;
    dateShipped: string;
    fromLocation: string;
    toLocation: string;
    contents: PalletContents[];
    archived: boolean;
}

/**
 * Represents contents of the pallet.
 * @interface
 */
export interface PalletContents {
    /** The item's unique identifier (number or string). */
    id: number | string;
    /** The selected or scanned SKU for this item. */
    SKU: string;
    /** The quantify of this item placed on the pallet. */
    quantity: number
}