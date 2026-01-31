/**
 * Takes an object of arrays, and for each property, adds a new property
 * with a $ prefix and the value as a flattened, comma-separated string.
 *
 * @template T - The shape of the input object, with string keys and array values
 * @param obj - The input object whose arrays to flatten
 * @returns A new object with original arrays and additional $-prefixed flat string properties
 *
 * @example
 * const input = { foo: [1, 2], bar: ['a', 'b'] };
 * const output = addFlatStringProps(input);
 * // { foo: [1,2], bar: ['a', 'b'], $foo: "1,2", $bar: "a,b" }
 */

export function addFlatArrays<T extends Record<string, any>>(obj: T): T & {
  [K in keyof T as K extends string ? `$${K}` : never]: string
} {
  const result: any = { ...obj };
  Object.entries(obj).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      result[`$${key}`] = value.join(', ');
    }
  });
  return result;
}