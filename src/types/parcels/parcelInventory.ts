import type { BaseInventoryImages } from "../construction"

export type ParcelInventoryType = {
    _id: string | number
    active: boolean
    architecture: ArchitectureType
    billOfMaterial: BillOfMaterialType[]
    pallets: ParcelPallets[]
    endDate: string | null
    parcelLot: string | null
    parcel_id: string | null
    startDate: string |null
    subdivision_id: string | null
    note: string | undefined
    images: BaseInventoryImages
}

export type ParcelInventoryTypeIsNew = ParcelInventoryType & {
    isNew: boolean;
};

export type ParcelPallets = {
    pallet_id: number | string
    unloaded: boolean
}

export type BillOfMaterialType = {
    inventory_id: number | string
    title: string
    category: string
    subCategory: string
    required: number
    actual: number
}
export type BillOfMaterials = {
    inventory_id: string | number
    title: string
    category: string
    subCategory: string
    required: number | null
}

export type BillOfMaterialsWithActual = BillOfMaterialType & {
    actual: number;
};
export type ArchitectureType = {
    model: string | null
    variant: string | null
    elevation: string | null
}
export type Architecture = {
    model: string
    variant: string
    elevation: string
}


export type Subdivision = {
    _id: string
    ward: string | number
    city: string
    title: string
    shortName?: string
    parcels: number
    lat?: number
    lng?: number
    active?: boolean
    closed?: boolean
}
export type Model = {
    _id: string
    model: string
    elevation: string
    name: string
    desc: string
    bedRooms: number
    baths: number
    garage: number
    livable: number
    underRoof: number
    billOfMaterials: BillOfMaterials[]
    active?: boolean
}

export type ParcelFlatBOM = BillOfMaterialType & {
    _id: string | number;
    subdivision_id: string | null;
    parcelLot: string | null;
    parcel_id: string | null;
}








// export type HomesData = {
//     parcels: Parcel[]
//     parcelInventory: ParcelInventoryType[]
//     models: Model[]
//     subdivisions: Subdivision[]
//     schema: unknown
// }