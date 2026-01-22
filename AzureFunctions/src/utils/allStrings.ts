import { TransferSelects } from "../functions/transferItems";

/**
* Checks if all properties of TransferSelects object are strings.
* @param {TransferSelects} controls - The object to validate.
* @returns {boolean} True if all values are strings, false otherwise.
*/
export function allStrings(controls: any): boolean {
    return Object.values(controls).every(value => typeof value === "string" && value !== null);
}