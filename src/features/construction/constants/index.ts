import type { BasePallet, BulkInventoryItemIsNew } from "../../../types/construction";
import { uniqueKey } from "../../../utils";
import { dateAsString } from "../../../utils/date";

export const defaultPallet: BasePallet = {
  _id: uniqueKey(),
  title: '',
  description: '',
  dateCreated: dateAsString(new Date()),
  dateShipped: '',
  dateUnloaded: '',
  location: 'Chuck',
  contents: [],
  images: {
    favorite: null,
    urls: []
  },
  archived: false
}

export const defaultInventoryItem: BulkInventoryItemIsNew = {
  _id: uniqueKey(),
  barcodes: [],
  pin: false,
  select: {
    category: '',
    subCategory: ''
  },
  suppliers: [],
  title: '',
  images: {
    favorite: null,
    urls: []
  },
  warnLevels: {
    notify: 0,
    warn: 0
  },
  quantity: {
    total: 0,
    byLocation: [{ loc: 'Chuck', qty: 0 }, { loc: 'Office', qty: 0 }]
  },
  isNew: true
}