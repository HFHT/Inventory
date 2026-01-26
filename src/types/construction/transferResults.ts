/**
 * Represents the result of transferring a row with various possible statuses.
 */
export type TransferResult =
    | {
        /** Unique identifier for the row */
        rowId: string
        /** The row transfer was skipped */
        status: 'skipped'
        /** Reason why the row was skipped */
        reason: string
    }
    | {
        rowId: string
        status: 'updated'
        /** Number or identifier of items matched */
        matched: number | string
        /** Number or identifier of items modified */
        modified: number | string
    }
    | {
        rowId: string
        /** Existing parcel was updated */
        status: 'parcel-updated-existing'
        /** BOM data for the update */
        bom: any
        /** Inventory data for the update */
        inventory: any
    }
    | {
        rowId: string
        /** A new parcel was added */
        status: 'parcel-added-new'
        bom: any
        inventory: any
    }
    | {
        rowId: string
        /** An error occurred during transfer */
        status: 'error'
        /** Error information */
        error: any
    }

/** Array of transfer results */
export type TransferResults = {
    data?: any
    result: TransferResult[]
    pallet?: any
}