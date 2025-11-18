/**
 * Retrieves a nested value from an object using a string accessor path.
 * 
 * The accessor path can use dot notation and array indices (e.g., "a.b[0].c").
 * 
 * @param {any} obj - The object from which to retrieve the value.
 * @param {string} accessor - The string path describing the property to access.
 * @returns {any} The value found at the given accessor path, or `undefined` if any part of the path is invalid.
 * 
 * @example
 * const data = { a: { b: [{ c: 5 }] } };
 * getValueByAccessor(data, 'a.b[0].c'); // returns 5
 * 
 * @example
 * getValueByAccessor(data, 'a.b[1].c'); // returns undefined
 */
export function getValueByAccessor(obj: any, accessor: string): any {
  if (!accessor) return obj;
  const parts = accessor.match(/([^[.\]]+)/g);
  if (!parts) return undefined;
  return parts.reduce((o, key) => (o == null ? undefined : o[key]), obj);
}