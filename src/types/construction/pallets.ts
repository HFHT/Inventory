/**
 * Base shape for a construction pallet.
 * @interface
 */
export interface BasePallet {
    _id: number | string;
    title: string;
    description: string
    dateCreated: string;
    dateShipped: string;
    dateUnloaded: string;
    location: string;
    lot: string;
    contents: PalletContents[];
    archived: boolean;
    images: PalletImages;
}
/** Represents images of the pallet.
 * @interface
 */
export interface PalletImages {
    urls: string[];
    favorite: string | null;
}

/**
 * Represents contents of the pallet.
 * @interface
 */
export interface PalletContents {
    /** The item's unique identifier (number or string). */
    inventory_id: number | string;
    /** The selected or scanned SKU for this item. */
    SKU: string;
    /** The title of this item. */
    title: string;
    /** The quantify of this item placed on the pallet. */
    amount: number;
    /** The quantify of this item to remove from the pallet. */
    restockAmount?: number | undefined;
}