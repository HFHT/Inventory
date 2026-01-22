import { TransferSelects } from "../functions/transferItems";

/**
* Returns true if all TransferSelects properties exist on the controls object.
* @param {Partial<TransferSelects>} controls 
* @returns {boolean}
*/
export function hasTransferSelectsProps(controls: Partial<TransferSelects>): boolean {
    return ["controllingDB", "locationOfInventory", "locationOfParcel"]
        .every((key) => key in controls);
}