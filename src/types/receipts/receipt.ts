export type Receipt = {
    _id: string | number
    date: string
    deliver: boolean
    dimensions: boolean
    feature: boolean
    guarantee: boolean
    line_items: ReceiptLineItems[]
    product: boolean
    qty: number
    receipt_number: string
    receipt_total: number
    reconciled: {
        by: string | null
        date: string | null
        done: boolean
    }
    supplier: string
    total_tax: number
    images: string[]
}

export type ReceiptLineItems = {
    r_id: string | number 
    sku_or_upc: string
    name: string
    unit_price: number
    quantity: number
    total_price: number
}

export type ReceiptReconcile = {
    by: string | null
    date: string | null
    status: 'C' | 'X' | null
    deviations: ReceiptDeviation[] 
}

export type ReceiptDeviation = {
    fk_r_id: string | number
    deviation: 'q' | 's' | 'p' | 'qs' | 'qp' | 'sp' | 'qsp'
    q_Actual: number
    s_Actual: string
    p_Actual: number
}

export interface ReceiptItemWithCreated extends Receipt {
    created: {
        by: string
        date: string
    }
}