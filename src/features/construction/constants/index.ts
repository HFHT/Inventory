import type { BasePallet } from "../../../types/construction";
import { uniqueKey } from "../../../utils";
import { dateAsString } from "../../../utils/date";

export const defaultPallet: BasePallet = {
  _id: uniqueKey(),
  title: '',
  description: '',
  dateCreated: dateAsString(new Date()),
  dateShipped: '',
  fromLocation: '',
  toLocation: '',
  contents: [],
  images: {
    favorite: null,
    urls: []
  },
  archived: false
}