/**
 * Valid category labels for a receipt line item.
 * `null` indicates no matching category could be determined.
 */
export type LineItemCategory =
    | "Appliance & HVAC"
    | "Building Materials"
    | "Cabinets"
    | "Doors"
    | "Electrical"
    | "Lumber"
    | "Paint"
    | "Plumbing"
    | "Supplies"
    | "Windows"
    | null;

/**
 * Represents a single line item on a receipt.
 */
export interface ReceiptLineItems {
    /** Product SKU, UPC, or barcode number. Empty string if not present. */
    sku_or_upc: string;
    /** Product serial number. Null if not present. */
    serial: string | null;
    /** Human-readable product or service name. */
    name: string;
    /** Manufacturer, make, and model. Null if not present */
    mfg: string | null;
    make: string | null;
    model: string | null;
    /** Price per single unit. */
    unit_price: number;
    /** Number of units purchased. */
    quantity: number;
    /** Total price for this line (unit_price × quantity). */
    total_price: number;
    /** Construction trade category, or null if none applies. */
    category: LineItemCategory;
}

/**
 * Represents a complete receipt document.
 */
export interface ReceiptItem {
    /** MongoDB document identifier. */
    _id: string;
    /** Purchase/transaction date in YYYY-MM-DD format. */
    date: string;
    /** True if the receipt represents a delivery order. */
    deliver: boolean;
    /** True if any line items include dimension specifications. */
    dimensions: boolean;
    /** True if any promotional features or special offers are noted. */
    feature: boolean;
    /** True if any warranty or guarantee information is present. */
    guarantee: boolean;
    /** URLs of the source receipt images. */
    images: string[];
    /** Line items extracted from the receipt. */
    line_items: ReceiptLineItems[];
    /** Purchase Order number, Job name/number, or empty string if not found. */
    po: string;
    /** True if this is a product purchase rather than a service receipt. */
    product: boolean;
    /** Total number of individual units purchased across all line items. */
    qty: number;
    /** Receipt, invoice, or transaction ID number. */
    receipt_number: string;
    /** Final total amount charged. */
    receipt_total: number;
    /** Reconciliation tracking metadata. */
    reconciled: {
        /** Identifier of the user who reconciled the receipt, or null. */
        by: string | null;
        /** Date the receipt was reconciled, or null. */
        date: string | null;
        /** Whether the receipt has been reconciled. */
        done: boolean;
    };
    /** Business name or vendor. */
    supplier: string;
    /** Total tax amount shown on the receipt. */
    total_tax: number;
}


export type ReceiptItems = ReceiptItem[]

// export type ReceiptItem = {
//     _id: string | number
//     date: string
//     deliver: boolean
//     dimensions: boolean
//     feature: boolean
//     guarantee: boolean
//     line_items: ReceiptLineItems[]
//     product: boolean
//     qty: number
//     receipt_number: string
//     receipt_total: number
//     reconciled: {
//         by: string | null
//         date: string | null
//         done: boolean
//     }
//     supplier: string
//     total_tax: number
//     images: string[]
// }

// export type ReceiptLineItems = {
//     sku_or_upc: string
//     name: string
//     unit_price: number
//     quantity: number
//     total_price: number
// }