/**
 * Represents image information for an inventory item.
 * @interface
 */
export interface BaseInventoryImages {
  /** The index of the favorite image, or null if none. */
  favorite: number | null;
  /** Array of image URLs associated with this item. */
  urls: string[];
}

/**
 * Base shape for a construction inventory item.
 * @interface
 */
export interface BaseInventoryItem {
  /** Unique identifier for the item (number or string). */
  _id: number | string;
  /** Display name of the inventory item. */
  title: string;
  /** If true, the item is pinned to the top or marked as important. */
  pin: boolean;
  /** Selected category and subcategory for organization. */
  select: {
    /** Name of the main category. */
    category: string;
    /** Name of the subcategory. */
    subCategory: string;
  };
  /** Images related to this item. */
  images: BaseInventoryImages;
  /** Quantity warning thresholds for inventory management. */
  warnLevels: {
    /** Quantity at which a notification is triggered. */
    notify: number;
    /** Quantity at which a warning is triggered. */
    warn: number;
  };
}

/**
 * Describes the quantity of an item at a specific location.
 * @interface
 */
export interface ByLocation {
  /** Location identifier (e.g., warehouse name, shelf id). */
  loc: string;
  /** Quantity at the specified location. */
  qty: number;
}

/**
 * Represents a bulk inventory item with additional bulk properties.
 * @interface
 * @extends BaseInventoryItem
 */
export interface BulkInventoryItem extends BaseInventoryItem {
  /** List of barcodes associated with the item. */
  barcodes: string[];
  /** Array of supplier names or IDs for this item. */
  suppliers: string[];
  /** Quantity tracking info. */
  quantity: {
    /** Total quantity of this inventory item. */
    total: number;
    /** Quantity breakdown by location. */
    byLocation: ByLocation[];
  };
}

/**
 * Represents an inventory item with associated serial numbers, SKUs, and barcodes.
 * @interface
 * @extends BulkInventoryItem
 */
export interface InventoryItemWithSerials extends BulkInventoryItem {
  /**
   * List of serial numbers for this item.
   * @type {string[]}
   */
  serialNumbers: string[];
  /**
   * Barcodes for this item (can override parent barcodes if different or duplicated).
   * @type {string[]}
   */
  barcodes: string[];
  /**
   * List of SKU details and their available quantities and serials.
   */
  SKUs: {
    /** Universal Product Code. */
    upc: string;
    /** Barcode value. */
    barcode: string;
    /** Manufacturer name. */
    mfg: string;
    /** Model identifier. */
    model: string;
    /** Quantity for this specific SKU. */
    qty: number;
    /** Optional: URL to more SKU info. */
    url: string;
    /** Optional: Image URL for this SKU. */
    img: string;
    /** Description of this SKU. */
    desc: string;
    /** List of serial numbers specific to this SKU. */
    serials: string[];
    /** Quantity breakdown for this SKU by location. */
    quantity: {
      /** Total available for this SKU. */
      total: number;
      /** Object mapping locations to their respective quantity counts. */
      byLocation: Record<string, number>;
    };
  }[];
}