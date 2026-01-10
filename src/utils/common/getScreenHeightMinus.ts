/**
 * Returns the screen height minus the specified value.
 *
 * @param {number} subtractValue - The value to subtract from the screen height.
 * @returns {number} The result of the screen height minus subtractValue.
 */
export function getScreenHeightMinus(subtractValue: number): number {
  if (typeof window === 'undefined' || !window.screen) {
    throw new Error('This function must be run in a browser environment.');
  }
  return window.screen.height - subtractValue;
}