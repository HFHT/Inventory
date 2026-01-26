/**
 * @typedef {Object} Locations
 * @property {string} Name - The location Name.
 * @property {number} lat - The latitude.
 * @property {number} lon - The longitude.
 * @property {any} Org - Warehouse organization.
 * @property {boolean} hide - Inactive location.
 */
export type InventoryLocation = {
    Name: string;
    lat: number;
    lon: number;
    warehouse?: boolean;
    Org?: any;
    hide?: boolean;
};

export type InventoryLocationList = InventoryLocation[]

export type InventoryDbType = {
    _id: string;
    Locations: InventoryLocationList;
}


export type ParcelInventoryType = {
    _id: string
    parcel_id: string
    parcelLot: string
    subdivision_id: string
    billOfMaterial: BillOfMaterial[]
    active: boolean
}

export type BillOfMaterial = {
    inventory_id: number | string
    title: string
    category: string
    subCategory: string
    required: number | null
    actual: number
}


export type Inventory = {
    _id: string | number
    barcodes: string[]
    images: InventoryImage
    pin: boolean
    quantity: InventoryQuantity
    select: InventorySelect
    suppliers: string[]
    title: string
    warnLevels: InventoryWarnLevels
}

export type InventoryImage = {
    favorite: number | null
    urls: string[]
}

export type InventoryQuantity = {
    total: number
    byLocation: ByLocation
}

type ByLocation = {
    [key: string]: number;
}

export type InventorySelect = {
    category: string
    subCategory: string
}
export type InventoryWarnLevels = {
    notify: number
    warn: number
}


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
    contents: PalletContents[];
    archived: boolean;
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
    amount: number
}