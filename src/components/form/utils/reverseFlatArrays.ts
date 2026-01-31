/**
 * For each $-prefixed string property on the input object, parses it back into an
 * array (splitting by comma and trimming each item), assigns it to the corresponding
 * key (without the $), and removes the $ property. Non-modified properties are preserved.
 *
 * @template T - The type of the base object (without $ fields)
 * @param obj - The object to un-flatten
 * @returns A new object with the $ keys converted and removed.
 */
export function reverseFlatArrays<T extends Record<string, any>>(obj: T): Omit<T, `$${string}`> {
    const result: Record<string, any> = { ...obj };

    Object.keys(obj).forEach(key => {
        if (key.startsWith('$') && typeof obj[key] === 'string') {
            const baseKey = key.slice(1); // remove the '$'
            result[baseKey] = (obj[key] as string).length > 0 ? (obj[key] as string).split(',').map(item => item.trim()) : [];
            delete result[key];
        }
    });

    return result as Omit<T, `$${string}`>;
}