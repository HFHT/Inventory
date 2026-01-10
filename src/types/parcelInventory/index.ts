export type ParcelInventoryType = {
    _id: string | number
    active: boolean
    architecture: ArchitectureType
    billOfMaterial: BillOfMaterialType[]
    endDate: string
    parcelLot: string
    parcel_id: string
    startDate: string
    subdivision_id: string
}

export type BillOfMaterialType = {
    inventory_id: number | string
    title: string
    category: string
    subCategory: string
    required: number
    actual: number
}

export type ArchitectureType = {
    model: string
    variant: string
    elevation: string
}