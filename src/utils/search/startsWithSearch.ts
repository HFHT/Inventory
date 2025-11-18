/**
 * Filters an array of objects, returning rows where any specified key's value starts with the filterValue (case-insensitive).
 *
 * @template T
 * @param {T[]} data - The data array to filter
 * @param {string} filterValue - The value to match at the START of any selected key's value
 * @param {(keyof T)[]} keys - The property keys to search on
 * @returns {T[]} - Filtered array of objects
 */
export function startsWithSearch<T extends Record<string, any>>(
    data: T[],
    filterValue: string,
    keys: string[]
): T[] {
    if (!filterValue.trim()) return data;
    const norm = filterValue.trim().toLowerCase();

    console.log(keys, filterValue, data)
    return data.filter((item) =>
        keys.some((key) => {
            console.log(key, item, getByPath(item, key))
            const value = (getByPath(item, key) ?? '').toString().toLowerCase();
            return value.startsWith(norm);
        })
    );
}

/**
 * Accesses the value at a given dot-separated path in an object.
 * @param {object} obj The object to get the value from.
 * @param {string} path The dot-separated path, e.g., "select.subCategory".
 */
function getByPath(obj: any, path: string) {
    return path.split('.').reduce((prev, key) => prev?.[key], obj);
}