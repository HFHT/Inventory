import type { ParcelInventoryTypeIsNew } from "../../../types/parcels";
import { uniqueKey } from "../../../utils";

export const defaultParcelInventory: ParcelInventoryTypeIsNew = {
  _id: uniqueKey(),
  active: true,
  architecture: {
    model: null,
    variant: null,
    elevation: null
  },
  billOfMaterial: [],
  pallets: [],
  endDate: null,
  parcelLot: null,
  parcel_id: null,
  startDate: null,
  subdivision_id: null,
  note: undefined,
  images: {
    favorite: null,
    urls: []
  },
  isNew: true
}