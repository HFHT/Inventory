import type { Parcel, ParcelInventoryTypeIsNew } from "../../../types/parcels";
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
  street: null,
  startDate: null,
  subdivision_id: null,
  note: undefined,
  images: {
    favorite: null,
    urls: []
  },
  isNew: true
}

export const defaultParcel: Parcel = {
  _id: undefined,
  homes: [{
    street: '',
    build: {
      lotName: '',
      startDate: '',
      endDate: '',
      status: '',
      fundingSources: [],
      model: '',
      variant: '',
      resrictions: ''
    },
    history: [],
  }],
  history: [{
    acquired: '',
    sold: '',
    recorderSequenceNo: null
  }],
  location: {
    lat: 0,
    lng: 0,
    geoAddress: '',
    lotNumber: '',
    subdivision_id: '',
    ward: '',
    city: 'Tucson',
    state: 'Az'
  },
  notes: [],
  type: 'Inventory'
}